import { Injectable } from "@nestjs/common";

@Injectable()
export class OnlineStore {
    private readonly users = new Set<string>();

    add(userId: string) {
        this.users.add(userId);
    }

    remove(userId: string) {
        this.users.delete(userId);
    }

    isOnline(userId: string): boolean {
        return this.users.has(userId);
    }
}
