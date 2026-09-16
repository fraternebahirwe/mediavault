import { v2 as cloudinary } from "cloudinary";
import { env } from "../config/env";
import { StorageProvider, UploadResult } from "./storage.interface";

cloudinary.config({
  cloud_name: env.cloudinary.cloudName,
  api_key: env.cloudinary.apiKey,
  api_secret: env.cloudinary.apiSecret,
});

export class CloudinaryStorageProvider implements StorageProvider {
  async upload({
    key,
    buffer,
  }: {
    key: string;
    buffer: Buffer;
    contentType: string;
  }): Promise<UploadResult> {
    const result = await new Promise<{ public_id: string; secure_url: string }>(
      (resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { public_id: key, resource_type: "auto", overwrite: true },
          (error, response) => {
            if (error || !response) return reject(error);
            resolve(response as { public_id: string; secure_url: string });
          }
        );
        stream.end(buffer);
      }
    );

    return { storageKey: result.public_id, storageUrl: result.secure_url };
  }

  async remove(key: string): Promise<void> {
    await cloudinary.uploader.destroy(key, { resource_type: "auto" });
  }

  async getSignedUrl(key: string): Promise<string> {
    return cloudinary.url(key, { secure: true, sign_url: true });
  }
}
