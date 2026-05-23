import { Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { randomUUID } from "crypto";
import { copyFile, mkdir, readdir, rm } from "fs/promises";
import { homedir, platform, tmpdir } from "os";
import { basename, dirname, join } from "path";
import { promisify } from "util";
import { execFile } from "child_process";
import { BraveDownloadItemDto, BraveHistoryItemDto } from "./dto/brave-data-response.dto";

const execFileAsync = promisify(execFile);
const WINDOWS_EPOCH_OFFSET_SECONDS = 11644473600;
const DEFAULT_LIMIT = 10;

type BraveRows = Record<string, string | null>[];

@Injectable()
export class BraveDataService {
    async getBraveData(limit = DEFAULT_LIMIT) {
        const searchedDirectories = this.getBraveDirectories();
        const profiles = await this.findHistoryFiles(searchedDirectories);

        if (profiles.length === 0) {
            throw new NotFoundException(
                `No Brave profiles found at: ${searchedDirectories.join(", ")}`,
            );
        }

        const profileData = await Promise.all(
            profiles.map(async (historyPath) => {
                const profileName = basename(dirname(historyPath));
                const tempPath = join(tmpdir(), `brave-history-${randomUUID()}`);

                await copyFile(historyPath, tempPath);

                try {
                    const [history, downloads] = await Promise.all([
                        this.getHistory(tempPath, limit),
                        this.getDownloads(tempPath, limit),
                    ]);

                    return {
                        profileName,
                        historyPath,
                        history,
                        downloads,
                    };
                } finally {
                    await rm(tempPath, { force: true });
                }
            }),
        );

        return {
            platform: platform(),
            searchedDirectories,
            profiles: profileData,
        };
    }

    private getBraveDirectories() {
        const home = homedir();
        const currentPlatform = platform();

        if (currentPlatform === "darwin") {
            return [join(home, "Library/Application Support/BraveSoftware/Brave-Browser")];
        }

        if (currentPlatform === "win32") {
            const localAppData = process.env.LOCALAPPDATA ?? join(home, "AppData/Local");
            return [join(localAppData, "BraveSoftware/Brave-Browser/User Data")];
        }

        return [
            join(home, ".config/BraveSoftware/Brave-Browser"),
            join(home, ".config/brave-browser"),
            join(home, "snap/brave/current/.config/BraveSoftware/Brave-Browser"),
        ];
    }

    private async findHistoryFiles(searchDirectories: string[]) {
        const historyFiles = await Promise.all(
            searchDirectories.map((directory) => this.findHistoryFilesInDirectory(directory)),
        );

        return historyFiles.flat();
    }

    private async findHistoryFilesInDirectory(directory: string) {
        try {
            const entries = await readdir(directory, { withFileTypes: true });
            const profileDirectories = entries.filter((entry) => entry.isDirectory());
            const historyPaths = await Promise.all(
                profileDirectories.map(async (entry) => {
                    const profileDirectory = join(directory, entry.name);
                    const nestedEntries = await this.safeReadDirectory(profileDirectory);
                    const hasHistory = nestedEntries.some(
                        (nestedEntry) => nestedEntry.isFile() && nestedEntry.name === "History",
                    );

                    return hasHistory ? join(profileDirectory, "History") : null;
                }),
            );

            return historyPaths.filter((path): path is string => Boolean(path));
        } catch {
            return [];
        }
    }

    private async safeReadDirectory(directory: string) {
        try {
            await mkdir(directory, { recursive: false });
        } catch {
            // Directory already exists or is not writable; both are fine for a read attempt.
        }

        try {
            return await readdir(directory, { withFileTypes: true });
        } catch {
            return [];
        }
    }

    private async getHistory(historyPath: string, limit: number): Promise<BraveHistoryItemDto[]> {
        const rows = await this.queryJson(historyPath, [
            "SELECT",
            `datetime(last_visit_time/1000000-${WINDOWS_EPOCH_OFFSET_SECONDS}, 'unixepoch', 'localtime') AS time,`,
            "COALESCE(title, '') AS title,",
            "url",
            "FROM urls",
            "ORDER BY last_visit_time DESC",
            `LIMIT ${limit};`,
        ].join(" "));

        return rows.map((row) => ({
            time: row.time,
            title: row.title ?? "",
            url: row.url ?? "",
        }));
    }

    private async getDownloads(historyPath: string, limit: number): Promise<BraveDownloadItemDto[]> {
        const rows = await this.queryJson(historyPath, [
            "SELECT",
            `datetime(start_time/1000000-${WINDOWS_EPOCH_OFFSET_SECONDS}, 'unixepoch', 'localtime') AS time,`,
            "COALESCE(target_path, '') AS targetPath,",
            "COALESCE(tab_url, '') AS sourceUrl",
            "FROM downloads",
            "ORDER BY start_time DESC",
            `LIMIT ${limit};`,
        ].join(" "));

        return rows.map((row) => ({
            time: row.time,
            targetPath: row.targetPath ?? "",
            sourceUrl: row.sourceUrl ?? "",
        }));
    }

    private async queryJson(databasePath: string, sql: string): Promise<BraveRows> {
        try {
            const { stdout } = await execFileAsync("sqlite3", ["-json", databasePath, sql]);
            const trimmed = stdout.trim();

            return trimmed ? (JSON.parse(trimmed) as BraveRows) : [];
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unknown sqlite3 error";

            throw new InternalServerErrorException(
                `Unable to read Brave history. Make sure sqlite3 is installed and available in PATH. ${message}`,
            );
        }
    }
}
