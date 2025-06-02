// lib/r2.ts
import { S3Client, PutObjectCommand,  GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const r2 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT || `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function generatePresignedPutUrl(key: string, contentType: string) {
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
    ContentType: contentType,
  });

  const url = await getSignedUrl(r2, command, { expiresIn: 3600 }); // 1 ชั่วโมง
  return url;
}

export async function generatePresignedGetUrl(key: string) {
  const command = new GetObjectCommand({
    Bucket:  process.env.R2_BUCKET_NAME!,
    Key: key,
  });

  const url = await getSignedUrl(r2, command, { expiresIn: 60 * 5 }); // ลิงก์ใช้ได้ 5 นาที
  return url;
}
