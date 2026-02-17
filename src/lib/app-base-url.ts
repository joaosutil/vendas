export function getAppBaseUrl(request: Request) {
  const configured = process.env.APP_BASE_URL?.trim();
  if (configured) return configured;

  const forwardedHost = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (forwardedHost) {
    const proto = request.headers.get("x-forwarded-proto") ?? "http";
    return `${proto}://${forwardedHost}`;
  }

  return new URL(request.url).origin;
}
