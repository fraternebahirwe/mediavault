import dotenv from "dotenv";

dotenv.config();

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 4000),
  nodeEnv: process.env.NODE_ENV ?? "development",
  isProd: process.env.NODE_ENV === "production",
  clientUrl: process.env.CLIENT_URL ?? "http://localhost:5173",

  databaseUrl: required("DATABASE_URL"),

  jwt: {
    accessSecret: required("JWT_ACCESS_SECRET", "dev_access_secret"),
    refreshSecret: required("JWT_REFRESH_SECRET", "dev_refresh_secret"),
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? "15m",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? "7d",
  },

  maxFileSizeBytes: Number(process.env.MAX_FILE_SIZE_MB ?? 200) * 1024 * 1024,
  defaultStorageLimitBytes:
    Number(process.env.DEFAULT_STORAGE_LIMIT_GB ?? 10) * 1024 * 1024 * 1024,

  storageProvider: (process.env.STORAGE_PROVIDER ?? "local") as
    | "local"
    | "s3"
    | "supabase"
    | "cloudinary",

  local: {
    uploadDir: process.env.LOCAL_UPLOAD_DIR ?? "uploads",
    publicUrl: process.env.LOCAL_PUBLIC_URL ?? "http://localhost:4000/files",
  },

  s3: {
    region: process.env.AWS_REGION ?? "",
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
    bucket: process.env.AWS_S3_BUCKET ?? "",
  },

  supabase: {
    url: process.env.SUPABASE_URL ?? "",
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
    bucket: process.env.SUPABASE_BUCKET ?? "mediavault",
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME ?? "",
    apiKey: process.env.CLOUDINARY_API_KEY ?? "",
    apiSecret: process.env.CLOUDINARY_API_SECRET ?? "",
  },

  smtp: {
    host: process.env.SMTP_HOST ?? "",
    port: Number(process.env.SMTP_PORT ?? 587),
    user: process.env.SMTP_USER ?? "",
    pass: process.env.SMTP_PASS ?? "",
    from: process.env.SMTP_FROM ?? "MediaVault <no-reply@mediavault.app>",
  },
};
