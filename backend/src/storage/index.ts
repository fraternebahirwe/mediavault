import { env } from "../config/env";
import { CloudinaryStorageProvider } from "./cloudinary.storage";
import { LocalStorageProvider } from "./local.storage";
import { S3StorageProvider } from "./s3.storage";
import { StorageProvider } from "./storage.interface";
import { SupabaseStorageProvider } from "./supabase.storage";

function createStorageProvider(): StorageProvider {
  switch (env.storageProvider) {
    case "s3":
      return new S3StorageProvider();
    case "supabase":
      return new SupabaseStorageProvider();
    case "cloudinary":
      return new CloudinaryStorageProvider();
    case "local":
    default:
      return new LocalStorageProvider();
  }
}

export const storageProvider = createStorageProvider();
export * from "./storage.interface";
