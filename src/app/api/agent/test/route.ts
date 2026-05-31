/**
 * Endpoint de test pour l'agent IA — protégé par un token.
 *
 *   POST /api/agent/test
 *   Headers: x-agent-test-token: <ADMIN_HEALTHCHECK_TOKEN>
 *   Body: { "message": "...", "channel": "email" | "whatsapp" | ..., "customerEmail": "...", ... }
 *
 * Retourne la réponse de l'agent + les tools appelés + tokens consommés.
 * Utile pour itérer sur le prompt sans passer par Gmail/WhatsApp.
 */

import { NextResponse } from "next/server";
import { runAgent, type AgentInput } from "@/lib/agent";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const expectedToken = process.env.ADMIN_HEALTHCHECK_TOKEN;
  if (!expectedToken) {
    return NextResponse.json(
      { error: "ADMIN_HEALTHCHECK_TOKEN non défini." },
      { status: 503 }
    );
  }

  const token = req.headers.get("x-agent-test-token");
  if (token !== expectedToken) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: Partial<AgentInput> = {};
  try {
    body = (await req.json()) as Partial<AgentInput>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.message || typeof body.message !== "string") {
    return NextResponse.json(
      { error: "Field 'message' required (string)" },
      { status: 400 }
    );
  }

  if (!body.channel) body.channel = "email";

  const started = Date.now();
  try {
    const result = await runAgent(body as AgentInput);
    return NextResponse.json({
      ...result,
      duration_ms: Date.now() - started,
    });
  } catch (e) {
    return NextResponse.json(
      {
        error: e instanceof Error ? e.message : String(e),
        duration_ms: Date.now() - started,
      },
      { status: 500 }
    );
  }
}
