const clients = new Map();

export function registerClient(userId, res) {
  const key = String(userId);
  const existing = clients.get(key) || new Set();
  existing.add(res);
  clients.set(key, existing);

  res.on("close", () => {
    existing.delete(res);
    if (existing.size === 0) {
      clients.delete(key);
    }
  });
}

export function sendToUser(userId, event, payload) {
  const key = String(userId);
  const targets = clients.get(key);
  if (!targets || targets.size === 0) {
    return;
  }

  const data = `event: ${event}\n` + `data: ${JSON.stringify(payload)}\n\n`;
  targets.forEach((res) => {
    res.write(data);
  });
}
