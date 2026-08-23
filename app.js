/**
 * cPanel default startup filename is `app.js`.
 * Passenger sets PORT; Nitro listens on it.
 */
process.env.HOST ??= "0.0.0.0";
await import("./.output/server/index.mjs");
