import { Stack } from 'expo-router';
import React from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';

const CoachLayout = () => {
	return (
		<ProtectedRoute allowedRoles={['coach']}>
			<Stack
				screenOptions={{
					headerShown: false,
				}}
			>
				<Stack.Screen name='dashboard' />
				<Stack.Screen name='clients' />
				<Stack.Screen name='sessions' />
				<Stack.Screen name='profile' />
			</Stack>
		</ProtectedRoute>
	);
};

export default CoachLayout;

