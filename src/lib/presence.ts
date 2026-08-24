import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/** Active sessions in this Node process. Fine for a single-container deploy. */
const sessions = new Map<string, number>();
const TTL_MS = 45_000;

function prune(now: number) {
  for (const [id, at] of sessions) {
    if (now - at > TTL_MS) sessions.delete(id);
  }
}

function touch(id: string): number {
  const now = Date.now();
  sessions.set(id, now);
  prune(now);
  return sessions.size;
}

export const presenceHeartbeat = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string().min(8).max(64) }))
  .handler(async ({ data }): Promise<{ count: number }> => {
    return { count: touch(data.id) };
  });
