import FixedView from '@/components/FixedView';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import React from 'react';
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';

const Fifth = () => {
	const { user, setOnboardingStatus } = useAuth();
	const router = useRouter();

	const handleComplete = async () => {
		await setOnboardingStatus('completed');
		
		// Redirect to appropriate dashboard based on role
		if (user?.role === 'coach') {
			router.replace('/(coach)/dashboard');
		} else if (user?.role === 'member') {
			router.replace('/(member)/dashboard');
		}
	};

	return (
		<FixedView className="flex-1 p-4">
			<View style={styles.container}>
				<Text style={styles.title}>You're All Set! 🎉</Text>
				<Text style={styles.subtitle}>
					Welcome to XTrimFit Gym, {user?.firstName}! Your onboarding is complete.
				</Text>
				<Text style={styles.description}>
					You can now start your fitness journey with us. Let's get started!
				</Text>

				<TouchableOpacity style={styles.completeButton} onPress={handleComplete}>
					<Text style={styles.completeText}>Get Started</Text>
				</TouchableOpacity>
			</View>
		</FixedView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
		justifyContent: 'center',
	},
	title: {
		fontSize: 32,
		fontWeight: 'bold',
		marginBottom: 20,
		textAlign: 'center',
	},
	subtitle: {
		fontSize: 20,
		color: '#333',
		marginBottom: 15,
		textAlign: 'center',
	},
	description: {
		fontSize: 16,
		color: '#666',
		marginBottom: 40,
		textAlign: 'center',
	},
	completeButton: {
		backgroundColor: '#007AFF',
		padding: 16,
		borderRadius: 8,
		alignItems: 'center',
	},
	completeText: {
		color: '#fff',
		fontSize: 18,
		fontWeight: '600',
	},
});

export default Fifth;
