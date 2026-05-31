/**
 * Client minimal pour l'API DeepSeek (compatible OpenAI Chat Completions).
 * Endpoint : https://api.deepseek.com/v1/chat/completions
 *
 * Modèle utilisé : `deepseek-chat` (DeepSeek-V3) — bon rapport qualité/prix
 * pour un agent conversationnel. `deepseek-reasoner` (R1) reste possible
 * mais est plus lent et plus cher.
 */

const DEEPSEEK_URL = "https://api.deepseek.com/v1/chat/completions";
const DEFAULT_MODEL = "deepseek-chat";

export interface ChatMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  /* OpenAI-compat tool calling */
  tool_calls?: {
    id: string;
    type: "function";
    function: { name: string; arguments: string };
  }[];
  tool_call_id?: string;
  name?: string;
}

export interface ChatCompletionRequest {
  messages: ChatMessage[];
  /* JSON-schema tool defs (compatible OpenAI) — peut être omis */
  tools?: ReadonlyArray<{
    type: "function";
    function: {
      name: string;
      description: string;
      parameters: object;
    };
  }>;
  tool_choice?: "auto" | "none";
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

export interface ChatCompletionResponse {
  choices: {
    index: number;
    finish_reason: "stop" | "tool_calls" | "length" | "content_filter";
    message: ChatMessage;
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export async function callDeepSeek(
  req: ChatCompletionRequest
): Promise<ChatCompletionResponse> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error(
      "DEEPSEEK_API_KEY manquant. Ajoute-le dans les env vars Vercel."
    );
  }

  const body = JSON.stringify({
    model: req.model ?? DEFAULT_MODEL,
    messages: req.messages,
    tools: req.tools,
    tool_choice: req.tool_choice ?? (req.tools ? "auto" : undefined),
    temperature: req.temperature ?? 0.4,
    max_tokens: req.max_tokens ?? 1500,
  });

  const res = await fetch(DEEPSEEK_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`DeepSeek API ${res.status}: ${text.slice(0, 400)}`);
  }

  return (await res.json()) as ChatCompletionResponse;
}
