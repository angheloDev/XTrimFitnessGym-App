import { AuthProvider } from '@/contexts/AuthContext';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import '../global.css';

export default function RootLayout() {
	return (
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
				<Stack.Screen name='(member)' options={{ headerShown: false }} />
			</Stack>
		</AuthProvider>
	);
}
