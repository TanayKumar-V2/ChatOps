export type MessageCursor = { createdAt: string; id: string };

export function encodeCursor(cursor: MessageCursor) {
  return Buffer.from(JSON.stringify(cursor)).toString("base64url");
}

export function decodeCursor(cursor?: string): MessageCursor | undefined {
  if (!cursor) return undefined;
  try { return JSON.parse(Buffer.from(cursor, "base64url").toString("utf8")) as MessageCursor; }
  catch { return undefined; }
}
