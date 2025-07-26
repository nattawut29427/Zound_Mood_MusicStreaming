// lib/getSigned.ts
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "@/lib/s3-client";

export async function getSignedPictureUrl(key: string): Promise<string> {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
    });

    return await getSignedUrl(s3Client, command, { expiresIn: 604800 }); // 7 วัน
  } catch (error) {
    console.error("Error generating signed URL:", error);
    
    // Fallback to public URL
    const publicDomain = process.env.NEXT_PUBLIC_R2_PUBLIC_DOMAIN;
    if (publicDomain) {
      return `https://${publicDomain}/${key}`;
    }
    
    throw error;
  }
}