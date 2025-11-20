import FixedView from '@/components/FixedView';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';

const First = () => {
	const { user, updateUser } = useAuth();
	const router = useRouter();
	const [selectedRole, setSelectedRole] = useState<UserRole | null>(user?.role || null);

	const handleRoleSelection = async (role: UserRole) => {
		setSelectedRole(role);
		if (user) {
			await updateUser({ role });
		}
	};

	const handleContinue = () => {
		if (selectedRole) {
			router.push('/(auth)/(onboarding)/second');
		}
	};

	return (
		<FixedView className="flex-1 p-4">
			<View style={styles.container}>
				<Text style={styles.title}>Welcome to XTrimFit Gym!</Text>
				<Text style={styles.subtitle}>
					Let's get started. First, tell us who you are:
				</Text>

				<View style={styles.roleContainer}>
					<TouchableOpacity
						style={[
							styles.roleButton,
							selectedRole === 'member' && styles.roleButtonSelected,
						]}
						onPress={() => handleRoleSelection('member')}
					>
						<Text
							style={[
								styles.roleText,
								selectedRole === 'member' && styles.roleTextSelected,
							]}
						>
							Member
						</Text>
						<Text style={styles.roleDescription}>
							I want to work out and get fit
						</Text>
					</TouchableOpacity>

					<TouchableOpacity
						style={[
							styles.roleButton,
							selectedRole === 'coach' && styles.roleButtonSelected,
						]}
						onPress={() => handleRoleSelection('coach')}
					>
						<Text
							style={[
								styles.roleText,
								selectedRole === 'coach' && styles.roleTextSelected,
							]}
						>
							Coach
						</Text>
						<Text style={styles.roleDescription}>
							I want to train and guide members
						</Text>
					</TouchableOpacity>
				</View>

				<TouchableOpacity
					style={[
						styles.continueButton,
						!selectedRole && styles.continueButtonDisabled,
					]}
					onPress={handleContinue}
					disabled={!selectedRole}
				>
					<Text style={styles.continueText}>Continue</Text>
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
		marginBottom: 10,
		textAlign: 'center',
	},
	subtitle: {
		fontSize: 18,
		color: '#666',
		marginBottom: 40,
		textAlign: 'center',
	},
	roleContainer: {
		gap: 20,
		marginBottom: 40,
	},
	roleButton: {
		borderWidth: 2,
		borderColor: '#ddd',
		borderRadius: 12,
		padding: 20,
		backgroundColor: '#fff',
	},
	roleButtonSelected: {
		borderColor: '#007AFF',
		backgroundColor: '#E3F2FD',
	},
	roleText: {
		fontSize: 24,
		fontWeight: '600',
		marginBottom: 8,
		color: '#333',
	},
	roleTextSelected: {
		color: '#007AFF',
	},
	roleDescription: {
		fontSize: 16,
		color: '#666',
	},
	continueButton: {
		backgroundColor: '#007AFF',
		padding: 16,
		borderRadius: 8,
		alignItems: 'center',
	},
	continueButtonDisabled: {
		backgroundColor: '#ccc',
	},
	continueText: {
		color: '#fff',
		fontSize: 18,
		fontWeight: '600',
	},
});

export default First;
