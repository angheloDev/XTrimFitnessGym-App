import FixedView from '@/components/FixedView';
import { useRouter } from 'expo-router';
import React from 'react';
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';

const CoachSessions = () => {
	const router = useRouter();

	return (
		<FixedView className="flex-1 p-4">
			<View style={styles.container}>
				<TouchableOpacity
					style={styles.backButton}
					onPress={() => router.back()}
				>
					<Text style={styles.backText}>← Back</Text>
				</TouchableOpacity>
				<Text style={styles.title}>Sessions</Text>
				<Text style={styles.subtitle}>
					View and manage your training sessions
				</Text>
			</View>
		</FixedView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
	},
	backButton: {
		marginBottom: 20,
	},
	backText: {
		fontSize: 16,
		color: '#007AFF',
	},
	title: {
		fontSize: 28,
		fontWeight: 'bold',
		marginBottom: 10,
	},
	subtitle: {
		fontSize: 16,
		color: '#666',
	},
});

export default CoachSessions;

