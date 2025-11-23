import { useAuth } from '@/contexts/AuthContext';
import { useAppSelector } from '@/store/hooks';
import { Stack, useRouter, useSegments } from 'expo-router';
import React, { useEffect, useRef } from 'react';

const AuthLayout = () => {
	const { isAuthenticated } = useAuth();
	const user = useAppSelector((state) => state.user.user);
	const router = useRouter();
	const segments = useSegments();
	const navigationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const lastUserRef = useRef<string | null>(null);

	// Handle navigation based on authentication state
	useEffect(() => {
		// Clear any pending navigation
		if (navigationTimeoutRef.current) {
			clearTimeout(navigationTimeoutRef.current);
			navigationTimeoutRef.current = null;
		}

		// Don't navigate if not authenticated or no user
		if (!isAuthenticated || !user) {
			lastUserRef.current = null;
			return;
		}

		// Create a unique key for this user state to prevent duplicate navigations
		const userKey = `${user.id}-${user.role}-${user.membershipDetails?.hasEnteredDetails ?? false}`;
		
		// Skip if we already handled navigation for this user state
		if (lastUserRef.current === userKey) {
			return;
		}

		const currentRoute = segments.join('/');
		const isInOnboarding = currentRoute.includes('(onboarding)') || 
			segments.includes('(onboarding)') ||
			segments.includes('first') ||
			segments.includes('second') ||
			segments.includes('third') ||
			segments.includes('fourth');
		
		// Determine target route based on user role and onboarding status
		let targetRoute: string | null = null;
		
		if (user.role === 'coach') {
			// Coaches go to coach dashboard
			if (!currentRoute.includes('(coach)')) {
				targetRoute = '/(coach)/dashboard';
			}
		} else if (user.role === 'member') {
			const hasEnteredDetails =
				user.membershipDetails?.hasEnteredDetails ?? false;
			if (hasEnteredDetails) {
				// Members with completed onboarding go to member dashboard
				// Always navigate to dashboard if we're in onboarding and onboarding is complete
				if (isInOnboarding || !currentRoute.includes('(member)')) {
					targetRoute = '/(member)/dashboard';
				}
			} else {
				// Members without onboarding go to onboarding
				if (!isInOnboarding) {
					targetRoute = '/(auth)/(onboarding)/first';
				}
			}
		}

		// Navigate only if target route is different from current route
		if (targetRoute) {
			lastUserRef.current = userKey;
			// Use setTimeout to ensure navigation happens after render cycle
			navigationTimeoutRef.current = setTimeout(() => {
				try {
					router.replace(targetRoute as any);
				} catch (error) {
					console.error('Navigation error:', error);
					lastUserRef.current = null; // Reset on error
				}
			}, 150);
		} else {
			// We're already on the correct route
			lastUserRef.current = userKey;
		}

		// Cleanup function
		return () => {
			if (navigationTimeoutRef.current) {
				clearTimeout(navigationTimeoutRef.current);
				navigationTimeoutRef.current = null;
			}
		};
	}, [isAuthenticated, user, segments, router]);

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
