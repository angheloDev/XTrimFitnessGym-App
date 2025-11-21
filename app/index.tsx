import FixedView from '@/components/FixedView';
import { useAuth } from '@/contexts/AuthContext';
import { Redirect } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

export default function Index() {
	const { isAuthenticated, isLoading, user, onboardingStatus } = useAuth();

	// Show loading screen while checking auth (only during initial load)
	// Note: isLoading is false after Redux Persist rehydrates
	if (isLoading) {
		return (
			<FixedView className='flex-1 bg-bg-darker'>
				<View className='flex-1 justify-center items-center'>
					<ActivityIndicator size='large' />
					<Text className='mt-2.5 text-base text-text-secondary'>
						Loading...
					</Text>
				</View>
			</FixedView>
		);
	}

	// Redirect based on authentication
	if (!isAuthenticated || !user) {
		return <Redirect href='/(auth)/login' />;
	}

	// For authenticated users, check onboarding status
	// Only redirect to onboarding if they haven't completed it
	// Note: Users who have logged in before should have completed onboarding
	if (onboardingStatus !== 'completed') {
		// Check if user has basic required fields
		// If they have a role set, they likely completed onboarding
		if (user.role === 'coach' || user.role === 'member') {
			// User has a role, so they've completed onboarding
			// Redirect to their dashboard
			if (user.role === 'coach') {
				return <Redirect href='/(coach)/dashboard' />;
			} else if (user.role === 'member') {
				return <Redirect href='/(member)/dashboard' />;
			}
		}
		// Otherwise, redirect to onboarding
		return <Redirect href='/(auth)/(onboarding)/first' />;
	}

	// Redirect to appropriate dashboard based on role
	if (user.role === 'coach') {
		return <Redirect href='/(coach)/dashboard' />;
	} else if (user.role === 'member') {
		return <Redirect href='/(member)/dashboard' />;
	}

	// Fallback to login
	return <Redirect href='/(auth)/login' />;
}
