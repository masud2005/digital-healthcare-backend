import {
    CreateBucketCommand,
    DeleteObjectCommand,
    GetObjectCommand,
    HeadBucketCommand,
    PutObjectCommand,
    S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import "multer";
import { v4 as uuid } from "uuid";

@Injectable()
export class StorageService implements OnModuleInit {
    private readonly publicS3: S3Client;
    private bucket = "testing";

    constructor(
        @Inject("MINIO_CLIENT")
        private readonly s3: S3Client,
    ) {
        this.publicS3 = new S3Client({
            region: "us-east-1",
            endpoint:
                process.env.MINIO_PUBLIC_ENDPOINT ||
                process.env.MINIO_ENDPOINT ||
                "http://127.0.0.1:9000",
            forcePathStyle: true,
            credentials: {
                accessKeyId: process.env.MINIO_USER || "admin",
                secretAccessKey: process.env.MINIO_PASS || "admin123",
            },
        });
    }
    async onModuleInit() {
        try {
            await this.s3.send(new HeadBucketCommand({ Bucket: this.bucket }));
            console.log("Storage initialized (connected to MinIO)");
        } catch (err: any) {
            if (err.name === "NotFound" || err.name === "NoSuchBucket") {
                try {
                    await this.s3.send(new CreateBucketCommand({ Bucket: this.bucket }));
                    console.log(
                        `Storage initialized: Bucket '${this.bucket}' created successfully`,
                    );
                } catch (createErr) {
                    console.error(`Failed to create bucket '${this.bucket}'`, createErr);
                }
            } else {
                console.error("Storage not initialized", err);
            }
        }
    }

    /**
     * 🚀 Upload file to MinIO — returns only the storage key.
     * Never store signed URLs in the database; always re-generate them on read.
     */
    async uploadFile(file: Express.Multer.File): Promise<{ key: string }> {
        const fileKey = this.generateFileKey(file.originalname);

        await this.s3.send(
            new PutObjectCommand({
                Bucket: this.bucket,
                Key: fileKey,
                Body: file.buffer,
                ContentType: file.mimetype,
            }),
        );

        return { key: fileKey };
    }

    /**
     * 🔐 Generate a fresh signed URL for a single stored key.
     * Default expiry: 5 days.
     */
    async getSignedUrl(key: string, expiresIn: number = 60 * 60 * 24 * 5): Promise<string> {
        const command = new GetObjectCommand({
            Bucket: this.bucket,
            Key: key,
        });

        return getSignedUrl(this.publicS3, command, { expiresIn });
    }

    /**
     * 🔐 Resolve an array of keys → signed URLs in parallel.
     * Useful for product images and any other multi-file fields.
     */
    async resolveKeys(keys: string[], expiresIn?: number): Promise<string[]> {
        return Promise.all(keys.map((key) => this.getSignedUrl(key, expiresIn)));
    }

    /**
     * 🔐 Resolve a nullable key → signed URL or null.
     * Useful for optional single-file fields like thumbnails.
     */
    async resolveKey(key: string | null | undefined, expiresIn?: number): Promise<string | null> {
        if (!key) return null;
        return this.getSignedUrl(key, expiresIn);
    }

    /**
     * 🗑️ Delete a file from MinIO using its storage key.
     */
    async deleteFile(key: string): Promise<void> {
        const command = new DeleteObjectCommand({
            Bucket: this.bucket,
            Key: key,
        });

        await this.s3.send(command);
    }

    /**
     * 📥 Download a file from MinIO and return its buffer.
     * Useful for fetching files to attach them directly into emails as CID.
     */
    async getFileBuffer(key: string): Promise<Buffer> {
        const command = new GetObjectCommand({
            Bucket: this.bucket,
            Key: key,
        });

        const response = await this.s3.send(command);
        const byteArray = await response.Body?.transformToByteArray();
        if (!byteArray) throw new Error("Failed to read file body from S3");
        return Buffer.from(byteArray);
    }

    private generateFileKey(originalName: string): string {
        const date = new Date().toISOString().split("T")[0];

        const safeName = originalName
            .replace(/\s+/g, "-")
            .replace(/[^a-zA-Z0-9.\-_]/g, "")
            .toLowerCase();

        return `${date}/${uuid()}-${safeName}`;
    }
}
