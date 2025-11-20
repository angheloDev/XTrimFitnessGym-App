import { useAuth } from '@/contexts/AuthContext';
import { Redirect, Stack, useSegments } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

const AuthLayout = () => {
	const { isAuthenticated, isLoading, user, onboardingStatus } = useAuth();
	const segments = useSegments();

	// Show loading screen while checking auth
	if (isLoading) {
		return (
			<View className='flex-1 justify-center items-center'>
				<ActivityIndicator size='large' />
				<Text className='mt-2.5 text-base text-gray-600'>Loading...</Text>
			</View>
		);
	}

	// If authenticated and onboarding is complete, redirect to appropriate dashboard
	if (isAuthenticated && onboardingStatus === 'completed') {
		if (user?.role === 'coach') {
			return <Redirect href='/(coach)/dashboard' />;
		} else if (user?.role === 'member') {
			return <Redirect href='/(member)/dashboard' />;
		}
	}

	// Allow access to auth routes (login and onboarding) if not authenticated or onboarding not complete
	return (
		<Stack
			screenOptions={{
				headerShown: false,
			}}
		>
			<Stack.Screen name='login' />
			<Stack.Screen name='(onboarding)' options={{ headerShown: false }} />
		</Stack>
	);
};

export default AuthLayout;
