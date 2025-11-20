import FixedView from '@/components/FixedView';
import { Redirect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';

export default function Index() {
	const { isAuthenticated, isLoading, user, onboardingStatus } = useAuth();

	// Show loading screen while checking auth
	if (isLoading) {
		return (
			<FixedView className='flex-1 bg-bg-darker'>
				<View className='flex-1 justify-center items-center'>
					<ActivityIndicator size='large' />
					<Text className='mt-2.5 text-base text-text-secondary'>Loading...</Text>
				</View>
			</FixedView>
		);
	}

	// Redirect based on authentication and onboarding status
	if (!isAuthenticated) {
		return <Redirect href='/(auth)/login' />;
	}

	// Redirect to onboarding if not completed
	if (onboardingStatus !== 'completed') {
		return <Redirect href='/(auth)/(onboarding)/first' />;
	}

	// Redirect to appropriate dashboard based on role
	if (user?.role === 'coach') {
		return <Redirect href='/(coach)/dashboard' />;
	} else if (user?.role === 'member') {
		return <Redirect href='/(member)/dashboard' />;
	}

	// Fallback to login
	return <Redirect href='/(auth)/login' />;
}

