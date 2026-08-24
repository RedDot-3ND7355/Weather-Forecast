const SENSOR_POLICY =
  "accelerometer=(self), gyroscope=(self), magnetometer=(self)";
const FEATURE_POLICY =
  "accelerometer 'self'; gyroscope 'self'; magnetometer 'self'";

export default async function sensorsPolicy(
  _event: unknown,
  next: () => unknown | Promise<unknown>,
): Promise<unknown> {
  const result = await next();
  if (!(result instanceof Response)) return result;
  const headers = new Headers(result.headers);
  if (!headers.has("Permissions-Policy")) {
    headers.set("Permissions-Policy", SENSOR_POLICY);
  }
  if (!headers.has("Feature-Policy")) {
    headers.set("Feature-Policy", FEATURE_POLICY);
  }
  return new Response(result.body, {
    status: result.status,
    statusText: result.statusText,
    headers,
  });
}
