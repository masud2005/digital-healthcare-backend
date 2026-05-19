import { S3Client } from "@aws-sdk/client-s3";

export const minioClient = new S3Client({
    region: "us-east-1",
    endpoint: process.env.MINIO_ENDPOINT || "http://127.0.0.1:9000",
    forcePathStyle: true,
    credentials: {
        accessKeyId: process.env.MINIO_USER || "admin",
        secretAccessKey: process.env.MINIO_PASS || "admin123",
    },
});
