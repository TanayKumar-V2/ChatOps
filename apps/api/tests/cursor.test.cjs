test("message cursors round-trip a stable timestamp and message id", async () => {
  const { decodeCursor, encodeCursor } = await import("../dist/modules/messages/cursor.js");
  const cursor = { createdAt: "2026-08-01T10:30:00.000Z", id: "message-123" };
  expect(decodeCursor(encodeCursor(cursor))).toEqual(cursor);
});

test("malformed message cursors are rejected", async () => {
  const { decodeCursor } = await import("../dist/modules/messages/cursor.js");
  expect(decodeCursor("not-a-cursor")).toBeUndefined();
});
