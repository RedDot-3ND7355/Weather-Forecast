/**
 * cPanel / CloudLinux "Application startup file".
 * Passenger sets PORT; Nitro listens on it.
 */
process.env.HOST ??= "0.0.0.0";
await import("./.output/server/index.mjs");
