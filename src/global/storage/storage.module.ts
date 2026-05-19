import { Module } from "@nestjs/common";
import { minioClient } from "./storage.client";
import { StorageService } from "./storage.service";

@Module({
    providers: [
        StorageService,
        {
            provide: "MINIO_CLIENT",
            useValue: minioClient,
        },
    ],
    exports: [StorageService],
})
export class StorageModule {}
