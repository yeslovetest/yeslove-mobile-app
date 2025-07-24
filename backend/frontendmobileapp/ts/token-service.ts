import { AuthApiFactory } from "@/generated-api";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage"

class TokenRefreshService{

    static REFRESH_TOKEN_KEY = "refreshToken";
    static USERID_KEY = "userId";



    startRefreshingToken(initialRefreshToken: string): void {
        let currentRefreshToken: string = initialRefreshToken;
        let expiresIn: number = 50_000;
        setInterval(() => {
            AuthApiFactory().postRefreshToken({refresh_token: currentRefreshToken})
            .then((response) => {
                currentRefreshToken = response.data.refresh_token ?? "";
                expiresIn = response.data.expires_in ?? 10_000;
                axios.defaults.headers.common['Authorization'] = response.data.access_token ?? "";
            })
        }, expiresIn);
    }

    saveRefreshTokenToLocalStorage(refreshToken: string): void {
        AsyncStorage.setItem(TokenRefreshService.REFRESH_TOKEN_KEY, refreshToken);
    }

    loadRefreshTokenFromLocalStorage(): Promise<string | null> {
        return AsyncStorage.getItem(TokenRefreshService.REFRESH_TOKEN_KEY);
    }

    saveUserIdToLocalStorage(userId: string): void {
        AsyncStorage.setItem(TokenRefreshService.USERID_KEY, userId);
    }

    loadUserIdFromLocalStorage(): Promise<string | null> {
        return AsyncStorage.getItem(TokenRefreshService.USERID_KEY);
    }
}

export const TOKEN_REFRESH_SERVICE = new TokenRefreshService();
