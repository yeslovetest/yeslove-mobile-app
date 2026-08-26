import Constants from 'expo-constants';

// Shared API base URL used by UI and networking code.
// Keeping this outside app/index.tsx avoids import cycles through App.
const envBaseUrl = (process.env.EXPO_PUBLIC_API_BASE_URL || '').trim();

const getExpoDevHost = (): string | undefined => {
	const constantsAny = Constants as any;

	const candidates: Array<unknown> = [
		constantsAny?.expoConfig?.hostUri,
		constantsAny?.manifest?.debuggerHost,
		constantsAny?.expoGoConfig?.debuggerHost,
		constantsAny?.manifest2?.extra?.expoGo?.debuggerHost,
		constantsAny?.manifest2?.extra?.expoClient?.hostUri,
	];

	for (const candidate of candidates) {
		if (typeof candidate !== 'string' || !candidate.trim()) {
			continue;
		}

		const host = candidate.split(':')[0]?.trim();
		if (host) {
			return host;
		}
	}

	return undefined;
};

const withDeviceReachableHost = (baseUrl: string): string => {
	try {
		const parsed = new URL(baseUrl);
		const isLocalHost = ['localhost', '127.0.0.1', '0.0.0.0'].includes(parsed.hostname);

		if (!isLocalHost) {
			return baseUrl;
		}

		const devHost = getExpoDevHost();
		if (!devHost) {
			return baseUrl;
		}

		parsed.hostname = devHost;
		return parsed.toString();
	} catch {
		return baseUrl;
	}
};

const fallbackBaseUrl = 'http://localhost:5000';
export const BASE_URL = withDeviceReachableHost(envBaseUrl || fallbackBaseUrl).replace(/\/+$/, '');

