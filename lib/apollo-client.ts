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
import { storage } from '@/utils/storage';

// Get the API URL based on the platform and environment
const getApiUrl = () => {
	if (__DEV__) {
		// Check if API URL is configured in app.json (recommended for physical devices)
		const apiUrl = Constants.expoConfig?.extra?.apiUrl;
		if (apiUrl) {
			console.log('✅ Using API URL from app.json:', apiUrl);
			return apiUrl;
		}

		// Platform-specific URLs
		if (Platform.OS === 'android') {
			// Android Emulator uses 10.0.2.2 to access host machine's localhost
			const apiUrl = 'http://10.0.2.2:8000/graphql';
			console.log('✅ Using Android emulator API URL:', apiUrl);
			return apiUrl;
		} else if (Platform.OS === 'ios') {
			// iOS Simulator can use localhost
			const apiUrl = 'http://localhost:8000/graphql';
			console.log('✅ Using iOS simulator API URL:', apiUrl);
			return apiUrl;
		} else {
			// For physical devices, user should set this in app.json
			// Default fallback - UPDATE THIS WITH YOUR COMPUTER'S IP ADDRESS
			const apiUrl = 'http://192.168.1.71:8000/graphql'; // ⚠️ UPDATE THIS!
			console.warn(
				'⚠️ Physical device detected. Please update the API URL in app.json (extra.apiUrl) with your computer IP'
			);
			console.warn('Current API URL:', apiUrl);
			return apiUrl;
		}
	}
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
			console.log('✅ [Apollo Client] Token found in AsyncStorage, adding to Authorization header');
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
		console.error('❌ [Apollo Client] Error retrieving token from AsyncStorage:', error);
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
