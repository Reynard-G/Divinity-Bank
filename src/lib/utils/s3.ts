"use server";

import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";

import { getSession } from "@/lib/auth/jwt";

const S3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "",
  },
});

const ALLOWED_CONTENT_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

/**
 * Generates a pre-signed URL for uploading a file directly to S3.
 * This allows clients to upload directly to S3 without passing the file through the server action.
 *
 * @param fileName The original file name (used to extract extension)
 * @param contentType The MIME type of the file
 * @param contentLength The size of the file in bytes
 * @param path The S3 path prefix (e.g., "transactions/server/1/deposits")
 * @returns Object with success status and either the upload URL + key, or an error message
 */
export async function createPresignedUploadUrl(
  fileName: string,
  contentType: string,
  contentLength: number,
  path: string
): Promise<
  | { success: true; uploadUrl: string; key: string }
  | { success: false; error: string }
> {
  try {
    const session = await getSession();
    if (!session) {
      return {
        success: false,
        error: "You must be logged in to upload files",
      };
    }

    const bucket = process.env.R2_BUCKET_NAME;
    if (!bucket) {
      console.error("R2_BUCKET_NAME environment variable not set");
      return {
        success: false,
        error: "Storage configuration error",
      };
    }

    // Validate content type
    if (!ALLOWED_CONTENT_TYPES.includes(contentType)) {
      return {
        success: false,
        error: "Only JPEG, PNG, and WEBP images are allowed",
      };
    }

    // Validate file size
    if (contentLength > MAX_FILE_SIZE) {
      return {
        success: false,
        error: `File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
      };
    }

    // Generate a unique file name with proper extension
    const fileExtension = fileName.split(".").pop() || "jpg";
    const uniqueFileName = `${uuidv4()}.${fileExtension}`;
    const key = `${path}/${uniqueFileName}`;

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
      ContentLength: contentLength,
    });

    const uploadUrl = await getSignedUrl(S3, command, { expiresIn: 300 }); // 5 minute expiry

    return {
      success: true,
      uploadUrl,
      key,
    };
  } catch (error) {
    console.error("Error generating pre-signed upload URL:", error);
    return {
      success: false,
      error: "Failed to generate upload URL",
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
