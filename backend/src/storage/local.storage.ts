import fs from "fs/promises";
import path from "path";
import { env } from "../config/env";
import { StorageProvider, UploadResult } from "./storage.interface";

const ROOT = path.resolve(process.cwd(), env.local.uploadDir);

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

export class LocalStorageProvider implements StorageProvider {
  async upload({
    key,
    buffer,
  }: {
    key: string;
    buffer: Buffer;
    contentType: string;
  }): Promise<UploadResult> {
    const fullPath = path.join(ROOT, key);
    await ensureDir(path.dirname(fullPath));
    await fs.writeFile(fullPath, buffer);
    return {
      storageKey: key,
      storageUrl: `${env.local.publicUrl}/${key}`,
    };
  }

  async remove(key: string): Promise<void> {
    const fullPath = path.join(ROOT, key);
    await fs.rm(fullPath, { force: true });
  }

  async getSignedUrl(key: string): Promise<string> {
    return `${env.local.publicUrl}/${key}`;
  }
}
