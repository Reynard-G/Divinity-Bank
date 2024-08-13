import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import {
  unstable_composeUploadHandlers,
  unstable_createMemoryUploadHandler,
} from "@remix-run/node";
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
 * Converts an async iterable to a buffer
 *
 * @param a The async iterable to convert
 */
export async function convertToBuffer(a: AsyncIterable<Uint8Array>) {
  const result = [];
  for await (const chunk of a) {
    result.push(chunk);
  }
  return Buffer.concat(result);
}

/**
 * Uploads a file to a bucket
 *
 * @param file The file to upload
 * @param contentType The content type of the file
 * @param bucket The bucket to upload the file to
 * @param path The path to upload the file to
 * @returns The key of the uploaded file
 */
export async function uploadFileToBucket(
  file: AsyncIterable<Uint8Array>,
  contentType: string,
  bucket: string,
  path: string,
): Promise<string> {
  // Generate a unique file name
  const fileName = uuidv4();

  // Upload file to bucket
  try {
    const uploadParams = {
      Bucket: bucket,
      Key: path.concat("/", fileName),
      Body: await convertToBuffer(file),
      ContentType: contentType,
    };

    await S3.send(new PutObjectCommand(uploadParams));

    return uploadParams.Key;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw new Error("Failed to upload file");
  }
}

/**
 * Handles the upload of a file
 *
 * @returns The file key
 * @throws Error if the file upload fails
 */
export const uploadHandler = unstable_composeUploadHandlers(
  async ({ contentType, data }) => {
    if (!contentType?.startsWith("image/"))
      return new TextDecoder().decode(await convertToBuffer(data));

    try {
      const uploadedImage = await uploadFileToBucket(
        data,
        contentType,
        "divinity-bank",
        "transactions/deposits",
      );

      return uploadedImage;
    } catch (error) {
      return undefined;
    }
  },
  unstable_createMemoryUploadHandler(),
);
