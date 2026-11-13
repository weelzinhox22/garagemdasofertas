function allowedHosts() {
  return (process.env.OFFER_FEED_ALLOWED_HOSTS || "")
    .split(",")
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean);
}

export function validatedFeedUrl(value: unknown) {
  const feed = new URL(String(value || ""));
  if (feed.protocol !== "https:") throw new Error("O feed precisa usar HTTPS");

  const allowed = allowedHosts();
  if (!allowed.some((host) => feed.hostname === host || feed.hostname.endsWith(`.${host}`))) {
    throw new Error("Dominio de feed nao autorizado");
  }

  return feed;
}
