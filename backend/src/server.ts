import http from "node:http";

const PORT = Number(process.env.PORT ?? 4000);

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
    // TEMPORARY diagnostic fallback: if the real app fails to boot (e.g. a
    // bad env var), don't just crash with an opaque platform error - run a
    // bare http server that reports exactly what broke, so it's inspectable
    // via a plain curl instead of digging through a dashboard. Remove this
    // once boot is confirmed stable in production.
    console.error("FATAL: app failed to boot:", err);
    const details =
      err instanceof Error
        ? { name: err.name, message: err.message, stack: err.stack }
        : { message: String(err) };

    http
      .createServer((_req, res) => {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Backend failed to boot", error: details }, null, 2));
      })
      .listen(PORT, () => {
        console.log(`Diagnostic fallback server listening on port ${PORT}`);
      });
  }
}

main();
