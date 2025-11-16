import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import '../global.css';

const loggedIn = false;

export default function RootLayout() {
	return (
		<>
			<StatusBar style='auto' />
			<Stack>
				<Stack.Protected guard={!loggedIn}>
					<Stack.Screen name='(auth)' options={{ headerShown: false }} />
				</Stack.Protected>
			</Stack>
		</>
	);
}
