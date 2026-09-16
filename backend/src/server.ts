import { app } from "./app";
import { env } from "./config/env";

app.listen(env.port, () => {
  console.log(`MediaVault API listening on http://localhost:${env.port}`);
  console.log(`Storage provider: ${env.storageProvider}`);
});
