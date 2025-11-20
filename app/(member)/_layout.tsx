import { Stack } from 'expo-router';
import React from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';

const MemberLayout = () => {
	return (
		<ProtectedRoute allowedRoles={['member']}>
			<Stack
				screenOptions={{
					headerShown: false,
				}}
			>
				<Stack.Screen name='dashboard' />
				<Stack.Screen name='workouts' />
				<Stack.Screen name='coaches' />
				<Stack.Screen name='profile' />
			</Stack>
		</ProtectedRoute>
	);
};

export default MemberLayout;

