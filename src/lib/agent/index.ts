/**
 * Boucle principale de l'agent IA.
 *
 * Reçoit un message client (depuis n'importe quel canal), envoie à
 * DeepSeek avec les tools dispos, exécute les tools demandés,
 * renvoie à l'agent jusqu'à ce qu'il génère la réponse finale.
 *
 * Limite de sécurité : 6 tours max pour éviter les boucles.
 */

import { callDeepSeek, type ChatMessage } from "./deepseek-client";
import { TOOL_DEFINITIONS, executeTool } from "./tools";
import { buildSystemMessage } from "./system-prompt";
import { getMenuSnapshot } from "./menu-snapshot";

const MAX_TURNS = 6;

export interface AgentInput {
  channel: "email" | "whatsapp" | "instagram" | "phone" | "web";
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  /* Message courant du client */
  message: string;
  /* Historique conversationnel (optionnel, pour le contexte) */
  history?: { role: "user" | "assistant"; content: string }[];
}

export interface AgentOutput {
  reply: string;
  toolsCalled: { name: string; args: Record<string, unknown>; result: unknown }[];
  tokensUsed: number;
  escalated: boolean;
}

export async function runAgent(input: AgentInput): Promise<AgentOutput> {
  const menuSnapshot = await getMenuSnapshot();

  const systemContent = buildSystemMessage({
    channel: input.channel,
    customerName: input.customerName,
    customerPhone: input.customerPhone,
    customerEmail: input.customerEmail,
    menuSnapshot,
  });

  /* Construit le tableau initial de messages */
  const messages: ChatMessage[] = [
    { role: "system", content: systemContent },
    ...(input.history ?? []).map((h) => ({ role: h.role, content: h.content } as ChatMessage)),
    { role: "user", content: input.message },
  ];

  const toolsCalled: AgentOutput["toolsCalled"] = [];
  let escalated = false;
  let totalTokens = 0;

  for (let turn = 0; turn < MAX_TURNS; turn++) {
    const response = await callDeepSeek({
      messages,
      tools: TOOL_DEFINITIONS,
    });

    totalTokens += response.usage?.total_tokens ?? 0;

    const choice = response.choices[0];
    if (!choice) {
      return {
        reply: "Désolé, une erreur technique nous empêche de vous répondre. Réessayez ou écrivez à hello@chezmamanjolie.com.",
        toolsCalled,
        tokensUsed: totalTokens,
        escalated,
      };
    }

    const msg = choice.message;
    messages.push(msg);

    /* Pas de tool call → on a la réponse finale */
    if (!msg.tool_calls || msg.tool_calls.length === 0) {
      return {
        reply: msg.content ?? "",
        toolsCalled,
        tokensUsed: totalTokens,
        escalated,
      };
    }

    /* Exécute chaque tool en parallèle */
    const results = await Promise.all(
      msg.tool_calls.map(async (tc) => {
        let args: Record<string, unknown> = {};
        try {
          args = JSON.parse(tc.function.arguments);
        } catch {
          /* malformed, on laisse vide */
        }
        const result = await executeTool(tc.function.name, args, {
          channel: input.channel,
          customerEmail: input.customerEmail,
          customerPhone: input.customerPhone,
        });
        if (tc.function.name === "escalate_to_human") escalated = true;
        toolsCalled.push({ name: tc.function.name, args, result });
        return { id: tc.id, name: tc.function.name, result };
      })
    );

    /* Ajoute les résultats des tools au contexte pour le tour suivant */
    for (const r of results) {
      messages.push({
        role: "tool",
        content: JSON.stringify(r.result),
        tool_call_id: r.id,
        name: r.name,
      });
    }
  }

  /* MAX_TURNS atteint sans réponse finale */
  return {
    reply: "Je n'ai pas pu finaliser la réponse à votre demande. Un humain va vous recontacter rapidement.",
    toolsCalled,
    tokensUsed: totalTokens,
    escalated: true,
  };
}
