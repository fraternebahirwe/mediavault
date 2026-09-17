process.on("uncaughtException", (err) => {
  console.error("Uncaught exception at boot:", err);
});
process.on("unhandledRejection", (err) => {
  console.error("Unhandled rejection at boot:", err);
});

import { app } from "./app";
import { env } from "./config/env";

app.listen(env.port, () => {
  console.log(`MediaVault API listening on http://localhost:${env.port}`);
  console.log(`Storage provider: ${env.storageProvider}`);
});
