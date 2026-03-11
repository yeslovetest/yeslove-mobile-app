import { AuthApiFactory } from "@/generated-api";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage"

class TokenRefreshService{

    static REFRESH_TOKEN_KEY = "refreshToken";
    static ACCESS_TOKEN_KEY = "authToken";
    static USERID_KEY = "userId";   // Keycloak Id
    static USER_DBID_KEY = "userDbId";  // user Database Id
    private refreshTimeoutId: ReturnType<typeof setTimeout> | null = null;

    private getRefreshDelayMs(expiresInSeconds?: number): number {
        const safeExpires = typeof expiresInSeconds === "number" && Number.isFinite(expiresInSeconds)
            ? expiresInSeconds
            : 60;
        return Math.max((safeExpires - 30) * 1000, 15_000);
    }

    private setAuthHeader(accessToken: string): void {
        if (accessToken) {
            axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
            return;
        }
        delete axios.defaults.headers.common["Authorization"];
    }

    private async writeStorageValue(key: string, value: string): Promise<void> {
        try {
            if (typeof localStorage !== "undefined") {
                localStorage.setItem(key, value);
            }
        } catch {
            // Ignore localStorage errors in native contexts.
        }
        await AsyncStorage.setItem(key, value);
    }

    private async readStorageValue(key: string): Promise<string | null> {
        try {
            if (typeof localStorage !== "undefined") {
                const localValue = localStorage.getItem(key);
                if (localValue !== null) {
                    return localValue;
                }
            }
        } catch {
            // Ignore localStorage errors in native contexts.
        }
        return AsyncStorage.getItem(key);
    }


    startRefreshingToken(initialRefreshToken: string): void {
        if (!initialRefreshToken) {
            return;
        }

        this.stopRefreshingToken();

        let currentRefreshToken: string = initialRefreshToken;
        const scheduleNext = (expiresInSeconds?: number) => {
            const delayMs = this.getRefreshDelayMs(expiresInSeconds);
            this.refreshTimeoutId = setTimeout(() => {
                AuthApiFactory().postRefreshToken({refresh_token: currentRefreshToken})
                    .then(async (response) => {
                        const nextRefreshToken = response.data.refresh_token ?? "";
                        const accessToken = response.data.access_token ?? "";
                        currentRefreshToken = nextRefreshToken;

                        this.setAuthHeader(accessToken);
                        await this.saveAccessToken(accessToken);
                        await this.saveRefreshTokenToLocalStorage(nextRefreshToken);

                        scheduleNext(response.data.expires_in ?? undefined);
                    })
                    .catch(() => {
                        this.stopRefreshingToken();
                    });
            }, delayMs);
        };

        scheduleNext(60);
    }    

    stopRefreshingToken(): void {
        if (this.refreshTimeoutId !== null) {
            clearTimeout(this.refreshTimeoutId);
            this.refreshTimeoutId = null;
        }
    }

    async saveAccessToken(accessToken: string): Promise<void> {
        await this.writeStorageValue(TokenRefreshService.ACCESS_TOKEN_KEY, accessToken);
    }

    async loadAccessToken(): Promise<string | null> {
        return this.readStorageValue(TokenRefreshService.ACCESS_TOKEN_KEY);
    }
    

    saveRefreshTokenToLocalStorage(refreshToken: string): Promise<void> {
        return this.writeStorageValue(TokenRefreshService.REFRESH_TOKEN_KEY, refreshToken);
    }

    loadRefreshTokenFromLocalStorage(): Promise<string | null> {
        return this.readStorageValue(TokenRefreshService.REFRESH_TOKEN_KEY);
    }

    saveUserIdToLocalStorage(userId: string): Promise<void> {
        return this.writeStorageValue(TokenRefreshService.USERID_KEY, userId);
    }

    loadUserIdFromLocalStorage(): Promise<string | null> {
        return this.readStorageValue(TokenRefreshService.USERID_KEY);
    }

    saveUserDBIDToLocalStorage(userDBID: number): Promise<void> {
        return this.writeStorageValue(TokenRefreshService.USER_DBID_KEY, String(userDBID));
    }

    loadUserDBIDFromLocalStorage(): Promise<string | null> {
        return this.readStorageValue(TokenRefreshService.USER_DBID_KEY)
    }
}

export const TOKEN_REFRESH_SERVICE = new TokenRefreshService();
