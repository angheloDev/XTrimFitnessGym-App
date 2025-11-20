import FixedView from '@/components/FixedView';
import { useRouter } from 'expo-router';
import React from 'react';
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';

const Second = () => {
	const router = useRouter();

	return (
		<FixedView className="flex-1 p-4">
			<View style={styles.container}>
				<Text style={styles.title}>Onboarding Step 2</Text>
				<Text style={styles.subtitle}>
					This is the second step of your onboarding process.
				</Text>

				<View style={styles.buttonContainer}>
					<TouchableOpacity
						style={styles.backButton}
						onPress={() => router.back()}
					>
						<Text style={styles.backText}>Back</Text>
					</TouchableOpacity>

					<TouchableOpacity
						style={styles.nextButton}
						onPress={() => router.push('/(auth)/(onboarding)/third')}
					>
						<Text style={styles.nextText}>Next</Text>
					</TouchableOpacity>
				</View>
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
		fontSize: 28,
		fontWeight: 'bold',
		marginBottom: 10,
		textAlign: 'center',
	},
	subtitle: {
		fontSize: 18,
		color: '#666',
		marginBottom: 40,
		textAlign: 'center',
	},
	buttonContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		gap: 15,
	},
	backButton: {
		flex: 1,
		backgroundColor: '#f0f0f0',
		padding: 16,
		borderRadius: 8,
		alignItems: 'center',
	},
	backText: {
		color: '#333',
		fontSize: 16,
		fontWeight: '600',
	},
	nextButton: {
		flex: 1,
		backgroundColor: '#007AFF',
		padding: 16,
		borderRadius: 8,
		alignItems: 'center',
	},
	nextText: {
		color: '#fff',
		fontSize: 16,
		fontWeight: '600',
	},
});

export default Second;
