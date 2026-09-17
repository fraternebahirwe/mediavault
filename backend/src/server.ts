import http from "node:http";

const PORT = Number(process.env.PORT ?? 4000);
// Checked directly from process.env, not the app's own env config module -
// if config validation itself is what's throwing, importing it here would
// just throw again and take the fallback server down with it.
const isProd = process.env.NODE_ENV === "production";

process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err);
});
process.on("unhandledRejection", (err) => {
  console.error("Unhandled rejection:", err);
});

async function main() {
  try {
    const { app } = await import("./app");
    app.listen(PORT, () => {
      console.log(`MediaVault API listening on port ${PORT}`);
    });
  } catch (err) {
    // If the real app fails to boot (e.g. a bad env var), don't just crash
    // with an opaque platform error - run a bare http server that reports
    // what broke. The full error always goes to the server-side log (visible
    // via `vercel logs`), but the HTTP response only includes it outside
    // production - a boot-time stack trace is internal information, not
    // something to hand to every visitor of a crashed deployment.
    console.error("FATAL: app failed to boot:", err);

    http
      .createServer((_req, res) => {
        res.writeHead(503, { "Content-Type": "application/json" });
        if (isProd) {
          res.end(JSON.stringify({ message: "Service temporarily unavailable" }));
        } else {
          const details =
            err instanceof Error
              ? { name: err.name, message: err.message, stack: err.stack }
              : { message: String(err) };
          res.end(JSON.stringify({ message: "Backend failed to boot", error: details }, null, 2));
        }
      })
      .listen(PORT, () => {
        console.log(`Diagnostic fallback server listening on port ${PORT}`);
      });
  }
}

main();
