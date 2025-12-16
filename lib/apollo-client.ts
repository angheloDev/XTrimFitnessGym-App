import { storage } from '@/utils/storage';
import {
	ApolloClient,
	InMemoryCache,
	createHttpLink,
	from,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Get the API URL based on the platform and environment
const getApiUrl = () => {
	if (__DEV__) {
		// Get API URL from app.json (if configured)
		// This is useful for physical devices that need the actual IP address
		const configApiUrl = Constants.expoConfig?.extra?.apiUrl;

		// Platform-specific URL logic
		if (Platform.OS === 'android') {
			// If apiUrl is configured in app.json, use it (for physical devices)
			// Otherwise, use 10.0.2.2 for Android emulator
			if (configApiUrl) {
				console.log('✅ [Android] Using API URL from app.json:', configApiUrl);
				console.log('   (Physical device or custom configuration)');
				return configApiUrl;
			}
			// Android Emulator uses 10.0.2.2 to access host machine's localhost
			// This is a special IP that Android emulator uses to reach the host
			const apiUrl = 'http://10.0.2.2:8000/graphql';
			console.log('✅ [Android] Using emulator API URL:', apiUrl);
			console.log('   (For physical devices, set apiUrl in app.json)');
			return apiUrl;
		} else if (Platform.OS === 'ios') {
			// If apiUrl is configured in app.json, use it (for physical devices)
			// Otherwise, use localhost for iOS simulator
			if (configApiUrl) {
				console.log('✅ [iOS] Using API URL from app.json:', configApiUrl);
				console.log('   (Physical device or custom configuration)');
				return configApiUrl;
			}
			// iOS Simulator can use localhost directly
			const apiUrl = 'http://localhost:8000/graphql';
			console.log('✅ [iOS] Using simulator API URL:', apiUrl);
			console.log('   (For physical devices, set apiUrl in app.json)');
			return apiUrl;
		} else if (Platform.OS === 'web') {
			// Web platform - prefer config URL, fallback to localhost
			if (configApiUrl) {
				console.log('✅ [Web] Using API URL from app.json:', configApiUrl);
				return configApiUrl;
			}
			const apiUrl = 'http://localhost:8000/graphql';
			console.log('✅ [Web] Using localhost API URL:', apiUrl);
			return apiUrl;
		} else {
			// Unknown platform - use config URL or fallback
			if (configApiUrl) {
				console.log(
					'✅ [Unknown Platform] Using API URL from app.json:',
					configApiUrl
				);
				return configApiUrl;
			}

			// Fallback - this should ideally be set in app.json
			const fallbackUrl = 'http://192.168.254.237:8000/graphql';
			console.warn('⚠️ [Unknown Platform] No API URL configured in app.json');
			console.warn("   Please add your computer's IP address to app.json:");
			console.warn('   "extra": { "apiUrl": "http://YOUR_IP:8000/graphql" }');
			console.warn('   Using fallback URL:', fallbackUrl);
			return fallbackUrl;
		}
	}

	// Production URL
	return 'https://your-production-api.com/graphql';
};

const API_URL = getApiUrl();

const httpLink = createHttpLink({
	uri: API_URL,
	credentials: 'include', // Important for cookies
});

// Auth link to add token header (fallback if cookies don't work)
const authLink = setContext(async (_, { headers }) => {
	// Get token from AsyncStorage (fallback if cookies don't work in React Native)
	try {
		const token = await storage.getItem('auth_token');

		if (token) {
			console.log(
				'✅ [Apollo Client] Token found in AsyncStorage, adding to Authorization header'
			);
			return {
				headers: {
					...headers,
					authorization: `Bearer ${token}`,
				},
			};
		} else {
			console.warn('⚠️ [Apollo Client] No token found in AsyncStorage');
		}
	} catch (error) {
		console.error(
			'❌ [Apollo Client] Error retrieving token from AsyncStorage:',
			error
		);
	}

	return {
		headers: {
			...headers,
		},
	};
});

// Error link for handling errors
const errorLink = onError((error: any) => {
	if (error.graphQLErrors) {
		error.graphQLErrors.forEach((graphQLError: any) => {
			console.error(
				`[GraphQL error]: Message: ${graphQLError.message}, Location: ${graphQLError.locations}, Path: ${graphQLError.path}`
			);
		});
	}

	if (error.networkError) {
		console.error(
			`[Network error]: ${error.networkError.message || error.networkError}`
		);
	}
});

// Create Apollo Client
const client = new ApolloClient({
	link: from([errorLink, authLink, httpLink]),
	cache: new InMemoryCache(),
	defaultOptions: {
		watchQuery: {
			errorPolicy: 'all',
		},
		query: {
			errorPolicy: 'all',
		},
	},
});

export default client;
