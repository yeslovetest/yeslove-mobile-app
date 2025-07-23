import { AuthApiFactory } from "@/generated-api";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage"

class TokenRefreshService{

    static REFRESH_TOKEN_KEY = "refreshToken";
    static USERID_KEY = "userId";
    private intervalId: ReturnType<typeof setTimeout> | null = null;


    startRefreshingToken(initialRefreshToken: string): void {
        let currentRefreshToken: string = initialRefreshToken;
        let expiresIn: number = 50_000;
        this.intervalId = setInterval(() => {
            AuthApiFactory().postRefreshToken({refresh_token: currentRefreshToken})
            .then((response) => {
                currentRefreshToken = response.data.refresh_token ?? "";
                expiresIn = response.data.expires_in ?? 10_000;
                axios.defaults.headers.common['Authorization'] = response.data.access_token ?? "";
            }).catch ((error) => {
                this.stopRefreshingToken()
            })
        }, expiresIn);
    }    

    stopRefreshingToken(): void {
        if (this.intervalId !== null) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
    

    saveRefreshTokenToLocalStorage(refreshToken: string): Promise<void> {
        return AsyncStorage.setItem(TokenRefreshService.REFRESH_TOKEN_KEY, refreshToken);
    }

    loadRefreshTokenFromLocalStorage(): Promise<string | null> {
        return AsyncStorage.getItem(TokenRefreshService.REFRESH_TOKEN_KEY);
    }

    saveUserIdToLocalStorage(userId: string): Promise<void> {
        return AsyncStorage.setItem(TokenRefreshService.USERID_KEY, userId);
    }

    loadUserIdFromLocalStorage(): Promise<string | null> {
        return AsyncStorage.getItem(TokenRefreshService.USERID_KEY);
    }
}

export const TOKEN_REFRESH_SERVICE = new TokenRefreshService();
