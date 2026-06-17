import { Injectable } from "@nestjs/common";

@Injectable()
export class ExportService {
    /**
     * Converts headers and rows of data into a standard, properly-escaped CSV string.
     */
    generateCsv(headers: string[], rows: any[][]): string {
        const escapeCsvValue = (value: any): string => {
            if (value === null || value === undefined) {
                return "";
            }
            const str = value instanceof Date ? value.toISOString() : String(value);
            if (str.includes(",") || str.includes("\n") || str.includes('"')) {
                return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
        };

        const headerLine = headers.map(escapeCsvValue).join(",");
        const rowLines = rows.map((row) => row.map(escapeCsvValue).join(","));

        return [headerLine, ...rowLines].join("\n");
    }
}
