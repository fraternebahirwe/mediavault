import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { env } from "../config/env";
import { StorageProvider, UploadResult } from "./storage.interface";

export class SupabaseStorageProvider implements StorageProvider {
  private client: SupabaseClient;
  private bucket: string;

  constructor() {
    this.client = createClient(env.supabase.url, env.supabase.serviceRoleKey);
    this.bucket = env.supabase.bucket;
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
    const { error } = await this.client.storage
      .from(this.bucket)
      .upload(key, buffer, { contentType, upsert: true });
    if (error) throw error;

    const { data } = this.client.storage.from(this.bucket).getPublicUrl(key);
    return { storageKey: key, storageUrl: data.publicUrl };
  }

  async remove(key: string): Promise<void> {
    await this.client.storage.from(this.bucket).remove([key]);
  }

  async getSignedUrl(key: string): Promise<string> {
    const { data, error } = await this.client.storage
      .from(this.bucket)
      .createSignedUrl(key, 3600);
    if (error || !data) throw error ?? new Error("Failed to sign URL");
    return data.signedUrl;
  }
}
