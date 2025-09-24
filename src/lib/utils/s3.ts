"use server";

import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";

const S3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "",
  },
});

/**
 * Uploads a file to a bucket
 *
 * @param file The File object from FormData
 * @param bucket The bucket to upload the file to
 * @param path The path to upload the file to
 * @returns Object with success status and either the key or error message
 */
export async function uploadImageFileToS3(
  file: File,
  bucket: string,
  path: string
): Promise<{ success: true; key: string } | { success: false; error: string }> {
  // Validate file size (2MB limit)
  const MAX_SIZE = 2 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    return {
      success: false,
      error: `File size must be less than ${MAX_SIZE / (1024 * 1024)}MB`,
    };
  }

  // Validate file type
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return {
      success: false,
      error: "Only JPEG, PNG, and WEBP images are allowed",
    };
  }

  // Generate a unique file name with proper extension
  const fileExtension = file.name.split(".").pop() || "jpg";
  const fileName = `${uuidv4()}.${fileExtension}`;
  const key = `${path}/${fileName}`;

  try {
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    const uploadParams = {
      Bucket: bucket,
      Key: key,
      Body: fileBuffer,
      ContentType: file.type,
      ContentLength: file.size,
      Metadata: {
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
      },
    };

    await S3.send(new PutObjectCommand(uploadParams));

    return {
      success: true,
      key,
    };
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    return {
      success: false,
      error: "Failed to upload file to storage",
    };
  }
}

/**
 * Generates a pre-signed URL for accessing a file in S3
 *
 * @param key The S3 key (path) of the file
 * @param expiresIn The number of seconds until the URL expires (default: 1 hour)
 * @returns Promise resolving to the pre-signed URL or null if error
 */
export async function getPresignedUrl(
  key: string,
  expiresIn: number = 3600 // 1 hour default
): Promise<string | null> {
  try {
    const bucket = process.env.R2_BUCKET_NAME;
    if (!bucket) {
      console.error("R2_BUCKET_NAME environment variable not set");
      return null;
    }

    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    const presignedUrl = await getSignedUrl(S3, command, { expiresIn });
    return presignedUrl;
  } catch (error) {
    console.error("Error generating pre-signed URL:", error);
    return null;
  }
}
