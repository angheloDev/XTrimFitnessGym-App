import FixedView from '@/components/FixedView';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import React from 'react';
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';

const MemberDashboard = () => {
	const { user, logout } = useAuth();
	const router = useRouter();

	const handleLogout = async () => {
		await logout();
		router.replace('/(auth)/login');
	};

	return (
		<FixedView className="flex-1 p-4">
			<View style={styles.container}>
				<Text style={styles.title}>Member Dashboard</Text>
				<Text style={styles.subtitle}>
					Welcome, {user?.firstName} {user?.lastName}!
				</Text>
				<Text style={styles.role}>Role: {user?.role}</Text>

				<View style={styles.menu}>
					<TouchableOpacity
						style={styles.menuItem}
						onPress={() => router.push('/(member)/workouts')}
					>
						<Text style={styles.menuText}>My Workouts</Text>
					</TouchableOpacity>

					<TouchableOpacity
						style={styles.menuItem}
						onPress={() => router.push('/(member)/coaches')}
					>
						<Text style={styles.menuText}>My Coaches</Text>
					</TouchableOpacity>

					<TouchableOpacity
						style={styles.menuItem}
						onPress={() => router.push('/(member)/profile')}
					>
						<Text style={styles.menuText}>Profile</Text>
					</TouchableOpacity>

					<TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
						<Text style={styles.logoutText}>Logout</Text>
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
	},
	title: {
		fontSize: 28,
		fontWeight: 'bold',
		marginBottom: 10,
	},
	subtitle: {
		fontSize: 18,
		marginBottom: 5,
	},
	role: {
		fontSize: 16,
		color: '#666',
		marginBottom: 30,
	},
	menu: {
		gap: 15,
	},
	menuItem: {
		backgroundColor: '#007AFF',
		padding: 15,
		borderRadius: 8,
		alignItems: 'center',
	},
	menuText: {
		color: '#fff',
		fontSize: 16,
		fontWeight: '600',
	},
	logoutButton: {
		backgroundColor: '#FF3B30',
		padding: 15,
		borderRadius: 8,
		alignItems: 'center',
		marginTop: 20,
	},
	logoutText: {
		color: '#fff',
		fontSize: 16,
		fontWeight: '600',
	},
});

export default MemberDashboard;

