import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const MemberLayout = () => {
	const insets = useSafeAreaInsets();
	const tabbarHeight =
		Platform.OS === 'android'
			? 75 + Math.max(insets.bottom, 12) - 8
			: 60 + Math.max(insets.bottom, 12) - 8;
	return (
		<ProtectedRoute allowedRoles={['member']}>
			<Tabs
				screenOptions={{
					headerShown: false,
					tabBarHideOnKeyboard: true,
					tabBarActiveTintColor: '#F9C513',
					tabBarInactiveTintColor: '#8E8E93',
					tabBarStyle: {
						backgroundColor: '#1C1C1E',
						borderTopColor: '#2C2C2E',
						borderTopWidth: 1,
						paddingTop: 8,
						paddingBottom: Math.max(insets.bottom, 12),
						height: tabbarHeight,
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
						tabBarIcon: ({ color, size, focused }) => (
							<Ionicons
								name={focused ? 'stats-chart' : 'stats-chart-outline'}
								size={size}
								color={color}
							/>
						),
					}}
				/>
				<Tabs.Screen
					name='workouts'
					options={{
						title: 'Workouts',
						tabBarIcon: ({ color, size, focused }) => (
							<Ionicons
								name={focused ? 'barbell' : 'barbell-outline'}
								size={size}
								color={color}
							/>
						),
					}}
				/>
				<Tabs.Screen
					name='schedule'
					options={{
						title: 'Schedule',
						tabBarIcon: ({ color, size, focused }) => (
							<Ionicons
								name={focused ? 'calendar' : 'calendar-outline'}
								size={size}
								color={color}
							/>
						),
					}}
				/>
				<Tabs.Screen
					name='progress'
					options={{
						title: 'Progress',
						tabBarIcon: ({ color, size, focused }) => (
							<Ionicons
								name={focused ? 'trending-up' : 'trending-up-outline'}
								size={size}
								color={color}
							/>
						),
					}}
				/>

				<Tabs.Screen
					name='subscription'
					options={{
						title: 'Subscription',
						tabBarIcon: ({ color, size, focused }) => (
							<Ionicons
								name={focused ? 'card' : 'card-outline'}
								size={size}
								color={color}
							/>
						),
					}}
				/>
				<Tabs.Screen
					name='profile'
					options={{
						href: null,
					}}
				/>
				<Tabs.Screen
					name='coaches'
					options={{
						href: null,
					}}
				/>
				<Tabs.Screen
					name='session-logs'
					options={{
						href: null,
					}}
				/>
			</Tabs>
		</ProtectedRoute>
	);
};

export default MemberLayout;
