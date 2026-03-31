import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3"

const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

export async function uploadAudioToR2(
  audioBuffer: Buffer,
  fileName: string,
  mimeType: string = "audio/webm"
): Promise<string> {
  try {
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: `audio/${fileName}`,
      Body: audioBuffer,
      ContentType: mimeType,
    })

    await r2Client.send(command)
    
    // Return the public URL
    return `https://pub-${process.env.R2_ACCOUNT_ID}.r2.dev/${process.env.R2_BUCKET_NAME}/audio/${fileName}`
  } catch (error) {
    console.error("Error uploading to R2:", error)
    throw new Error("Failed to upload audio")
  }
}

export async function getAudioFromR2(fileName: string): Promise<Buffer | null> {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: `audio/${fileName}`,
    })

    const response = await r2Client.send(command)
    
    // Convert stream to buffer
    if (response.Body) {
      const chunks: Uint8Array[] = []
      const stream = response.Body as ReadableStream
      const reader = stream.getReader()
      
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        chunks.push(value)
      }
      
      return Buffer.concat(chunks)
    }
    
    return null
  } catch (error) {
    console.error("Error getting audio from R2:", error)
    return null
  }
}

export function generateAudioFileName(userId: string, testId: string): string {
  const timestamp = Date.now()
  return `${userId}_${testId}_${timestamp}.webm`
}
