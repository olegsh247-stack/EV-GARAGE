import { S3Client } from "@aws-sdk/client-s3";

export const B2_BUCKET_NAME = process.env.B2_BUCKET_NAME ?? "";

export function getB2Client() {
  const accessKeyId = process.env.B2_KEY_ID;
  const secretAccessKey = process.env.B2_APPLICATION_KEY;
  const endpoint = process.env.B2_ENDPOINT;
  const region = process.env.B2_REGION;

  if (!accessKeyId || !secretAccessKey || !endpoint || !region || !B2_BUCKET_NAME) {
    throw new Error("Backblaze B2 environment variables are not configured");
  }

  return new S3Client({
    region,
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
  });
}
