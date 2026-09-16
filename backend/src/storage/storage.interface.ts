export interface UploadResult {
  storageKey: string;
  storageUrl: string;
}

export interface StorageProvider {
  /** Upload a file buffer and return its storage key + publicly resolvable URL. */
  upload(params: {
    key: string;
    buffer: Buffer;
    contentType: string;
  }): Promise<UploadResult>;

  /** Permanently remove a file from the underlying storage. */
  remove(key: string): Promise<void>;

  /** Return a URL usable to read the file (signed if the provider requires it). */
  getSignedUrl(key: string): Promise<string>;
}
