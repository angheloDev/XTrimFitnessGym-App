import { Tabs } from 'expo-router';
import React from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Ionicons } from '@expo/vector-icons';

const CoachLayout = () => {
	return (
		<ProtectedRoute allowedRoles={['coach']}>
			<Tabs
				screenOptions={{
					headerShown: false,
					tabBarActiveTintColor: '#F9C513',
					tabBarInactiveTintColor: '#8E8E93',
					tabBarStyle: {
						backgroundColor: '#1C1C1E',
						borderTopColor: '#2C2C2E',
						borderTopWidth: 1,
					},
					tabBarLabelStyle: {
						fontSize: 12,
						fontWeight: '600',
					},
				}}
			>
				<Tabs.Screen
					name='dashboard'
					options={{
						title: 'Dashboard',
						tabBarIcon: ({ color, size }) => (
							<Ionicons name='stats-chart' size={size} color={color} />
						),
					}}
				/>
				<Tabs.Screen
					name='schedule'
					options={{
						title: 'Schedule',
						tabBarIcon: ({ color, size }) => (
							<Ionicons name='calendar' size={size} color={color} />
						),
					}}
				/>
				<Tabs.Screen
					name='progress'
					options={{
						title: 'Progress',
						tabBarIcon: ({ color, size }) => (
							<Ionicons name='trending-up' size={size} color={color} />
						),
					}}
				/>
				<Tabs.Screen
					name='subscription'
					options={{
						title: 'Subscription',
						tabBarIcon: ({ color, size }) => (
							<Ionicons name='card' size={size} color={color} />
						),
					}}
				/>
			</Tabs>
		</ProtectedRoute>
	);
};

export default CoachLayout;

