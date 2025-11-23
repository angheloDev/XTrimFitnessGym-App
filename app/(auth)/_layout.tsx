import { useAuth } from '@/contexts/AuthContext';
import { useAppSelector } from '@/store/hooks';
import { Redirect, Stack } from 'expo-router';
import React from 'react';

const AuthLayout = () => {
	const { isAuthenticated } = useAuth();
	const user = useAppSelector((state) => state.user.user);

	// If authenticated, redirect to appropriate dashboard
	if (isAuthenticated && user) {
		if (user.role === 'coach') {
			return <Redirect href='/(coach)/dashboard' />;
		} else if (user.role === 'member') {
			return <Redirect href='/(member)/dashboard' />;
		}
	}

	// Allow access to auth routes (login and onboarding) if not authenticated
	return (
		<Stack
			screenOptions={{
				headerShown: false,
			}}
		>
			<Stack.Screen name='login' options={{ animation: 'slide_from_left' }} />
			<Stack.Screen name='signup' options={{ animation: 'slide_from_right' }} />
			<Stack.Screen name='(onboarding)' options={{ headerShown: false }} />
		</Stack>
	);
};

export default AuthLayout;
