import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Inject, Injectable } from "@nestjs/common";
import "multer";
import { v4 as uuid } from "uuid";

@Injectable()
export class StorageService {
    constructor(
        @Inject("MINIO_CLIENT")
        private readonly s3: S3Client,
    ) {}

    private bucket = "testing";

    /**
     * 🚀 Upload file to MinIO
     */
    async uploadFile(file: Express.Multer.File) {
        // 1. Generate safe S3 key
        const fileKey = this.generateFileKey(file.originalname);

        // 2. Upload to MinIO
        await this.s3.send(
            new PutObjectCommand({
                Bucket: this.bucket,
                Key: fileKey,
                Body: file.buffer,
                ContentType: file.mimetype,
            }),
        );

        // 3. IMPORTANT FIX: await signed URL
        const url = await this.getSignedUrl(fileKey);

        return {
            key: fileKey,
            url, // ✅ now always string
        };
    }

    /**
     * 🔐 Generate signed URL (secure temporary access)
     */
    async getSignedUrl(key: string): Promise<string> {
        const command = new GetObjectCommand({
            Bucket: this.bucket,
            Key: key,
        });

        return await getSignedUrl(this.s3, command, {
            expiresIn: 60 * 60, // 1 hour
        });
    }

    private generateFileKey(originalName: string): string {
        const date = new Date().toISOString().split("T")[0];

        // sanitize filename (VERY IMPORTANT for S3/MinIO)
        const safeName = originalName
            .replace(/\s+/g, "-") // spaces → dash
            .replace(/[^a-zA-Z0-9.\-_]/g, "") // remove unsafe chars
            .toLowerCase();

        return `${date}/${uuid()}-${safeName}`;
    }
}
