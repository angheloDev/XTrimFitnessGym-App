import { AuthProvider } from '@/contexts/AuthContext';
import client from '@/lib/apollo-client';
import { persistor, store } from '@/store';
import { ApolloProvider } from '@apollo/client/react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import '../global.css';

// Loading component for PersistGate
function LoadingScreen() {
	return (
		<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
			<ActivityIndicator size='large' />
		</View>
	);
}

LoadingScreen.displayName = 'LoadingScreen';

// Explicitly provide SafeAreaProvider so NativeWind can properly detect and hijack it
// This fixes the "Cannot read property 'displayName' of undefined" error
export default function RootLayout() {
	return (
		<SafeAreaProvider>
			<Provider store={store}>
				<PersistGate loading={<LoadingScreen />} persistor={persistor}>
					<ApolloProvider client={client}>
						<AuthProvider>
							<StatusBar style='auto' />
							<Stack screenOptions={{ headerShown: false }}>
								{/* Index route handles initial routing based on auth state */}
								<Stack.Screen name='index' options={{ headerShown: false }} />

								{/* Auth routes - accessible when not authenticated */}
								<Stack.Screen name='(auth)' options={{ headerShown: false }} />

								{/* Coach routes - protected, only accessible to coaches */}
								<Stack.Screen name='(coach)' options={{ headerShown: false }} />

								{/* Member routes - protected, only accessible to members */}
								<Stack.Screen
									name='(member)'
									options={{ headerShown: false }}
								/>
							</Stack>
						</AuthProvider>
					</ApolloProvider>
				</PersistGate>
			</Provider>
		</SafeAreaProvider>
	);
}
