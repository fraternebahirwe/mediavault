import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl as presign } from "@aws-sdk/s3-request-presigner";
import { env } from "../config/env";
import { StorageProvider, UploadResult } from "./storage.interface";

export class S3StorageProvider implements StorageProvider {
  private client: S3Client;
  private bucket: string;

  constructor() {
    this.client = new S3Client({
      region: env.s3.region,
      credentials: {
        accessKeyId: env.s3.accessKeyId,
        secretAccessKey: env.s3.secretAccessKey,
      },
    });
    this.bucket = env.s3.bucket;
  }

  async upload({
    key,
    buffer,
    contentType,
  }: {
    key: string;
    buffer: Buffer;
    contentType: string;
  }): Promise<UploadResult> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      })
    );
    return {
      storageKey: key,
      storageUrl: `https://${this.bucket}.s3.${env.s3.region}.amazonaws.com/${key}`,
    };
  }

  async remove(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key })
    );
  }

  async getSignedUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: key });
    return presign(this.client, command, { expiresIn: 3600 });
  }
}
