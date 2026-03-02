import { ProtectedRoute } from '@/components/ProtectedRoute';
import { TourOverlay } from '@/components/TourOverlay';
import {
	TourProvider,
	useTour,
	type TourStepConfig,
} from '@/contexts/TourContext';
import { Ionicons } from '@expo/vector-icons';
import { Tabs, useRouter, useSegments } from 'expo-router';
import React, { useEffect } from 'react';
import { Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const COACH_TOUR_STEPS: TourStepConfig[] = [
	{
		id: 'welcome',
		title: 'Welcome, Coach',
		body: "Here's a quick tour of your coach app. You can skip anytime.",
		targetKey: null,
		tab: 'dashboard',
	},
	{
		id: 'header_notifications',
		title: 'Notifications',
		body: 'Tap the bell to see notifications and pending client requests.',
		targetKey: 'header_notifications',
		tab: 'dashboard',
	},
	{
		id: 'header_profile',
		title: 'Profile',
		body: 'Tap your avatar for profile, settings, and logout.',
		targetKey: 'header_profile',
		tab: 'dashboard',
	},
	{
		id: 'tabs',
		title: 'Navigation Tabs',
		body: 'Use these tabs: Dashboard, Progress, Clients, and Schedule to manage your coaching.',
		targetKey: null,
		tab: 'dashboard',
	},
	{
		id: 'dashboard',
		title: 'Dashboard',
		body: 'Your overview: performance insights, upcoming sessions, and quick actions.',
		targetKey: 'dashboard',
		tab: 'dashboard',
	},
	{
		id: 'quickstats',
		title: 'Stats & Sessions',
		body: 'See upcoming sessions, client count, and session charts.',
		targetKey: 'quickstats',
		tab: 'dashboard',
	},
	{
		id: 'dashboard_quick_schedule',
		title: 'Quick Action: Schedule',
		body: 'Jump to Schedule to create and manage sessions.',
		targetKey: 'dashboard_quick_schedule',
		tab: 'dashboard',
	},
	{
		id: 'dashboard_quick_progress',
		title: 'Quick Action: Progress',
		body: 'Jump to Progress to view client goals and logs.',
		targetKey: 'dashboard_quick_progress',
		tab: 'dashboard',
	},
	{
		id: 'progress',
		title: 'Progress',
		body: 'View client goals and progress. Track weight and session logs.',
		targetKey: 'progress',
		tab: 'progress',
	},
	{
		id: 'clients',
		title: 'Clients',
		body: 'Manage your clients, view their details, and accept new coach requests.',
		targetKey: 'clients',
		tab: 'clients',
	},
	{
		id: 'clients_search',
		title: 'Search Clients',
		body: 'Search clients by name or email.',
		targetKey: 'clients_search',
		tab: 'clients',
	},
	{
		id: 'schedule',
		title: 'Schedule',
		body: 'Create and manage sessions. Set up templates and complete session logs.',
		targetKey: 'schedule',
		tab: 'schedule',
	},
	{
		id: 'schedule_create',
		title: 'Create Session',
		body: 'Tap to create a new session with your clients.',
		targetKey: 'schedule_create',
		tab: 'schedule',
	},
	{
		id: 'subscription',
		title: 'Subscription',
		body: 'Manage your coach subscription and plan details.',
		targetKey: 'subscription',
		tab: 'subscription',
	},
	{
		id: 'end',
		title: "You're All Set",
		body: 'Tap any tab to explore. Good luck with your clients!',
		targetKey: null,
		tab: 'dashboard',
	},
];

const CoachLayoutContent = () => {
	const insets = useSafeAreaInsets();
	const tour = useTour();
	const router = useRouter();
	const segments = useSegments();

	useEffect(() => {
		if (!tour?.isActive || !tour.currentStep?.tab) return;
		const currentTab = (segments as string[])[
			(segments as string[]).length - 1
		];
		const tab = tour.currentStep!.tab;
		if (currentTab === tab) return;
		router.replace(`/(coach)/${tab}` as any);
	}, [tour?.isActive, tour?.currentStep?.tab, segments, router]);

	const tabbarHeight =
		Platform.OS === 'android'
			? 75 + Math.max(insets.bottom, 12) - 8
			: 60 + Math.max(insets.bottom, 12) - 8;

	return (
		<View style={{ flex: 1 }}>
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
						tabBarIcon: ({ color, size }) => (
							<Ionicons name='stats-chart' size={size} color={color} />
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
					name='clients'
					options={{
						title: 'Clients',
						tabBarIcon: ({ color, size }) => (
							<Ionicons name='people' size={size} color={color} />
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
				<Tabs.Screen name='subscription' options={{ href: null }} />
				<Tabs.Screen name='profile' options={{ href: null }} />
				<Tabs.Screen name='sessions' options={{ href: null }} />
				<Tabs.Screen name='completed-sessions' options={{ href: null }} />
				<Tabs.Screen name='attendance' options={{ href: null }} />
			</Tabs>
			<TourOverlay />
		</View>
	);
};

const CoachLayout = () => {
	return (
		<ProtectedRoute allowedRoles={['coach']}>
			<TourProvider steps={COACH_TOUR_STEPS} role='coach'>
				<CoachLayoutContent />
			</TourProvider>
		</ProtectedRoute>
	);
};

export default CoachLayout;
