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

const MEMBER_TOUR_STEPS: TourStepConfig[] = [
	{
		id: 'welcome',
		title: 'Welcome to XTrim Fit Gym',
		body: "Here's a quick tour of your app. You can skip anytime.",
		targetKey: null,
		tab: 'dashboard',
	},
	{
		id: 'header_coaches',
		title: 'Coaches',
		body: 'Tap here to browse coaches and send a coach request.',
		targetKey: 'header_coaches',
		tab: 'dashboard',
	},
	{
		id: 'header_notifications',
		title: 'Notifications',
		body: 'Tap the bell to see notifications and request updates.',
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
		body: 'Use these tabs: Dashboard, Workouts, Schedule, Progress, and Subscription to move around the app.',
		targetKey: null,
		tab: 'dashboard',
	},
	{
		id: 'dashboard',
		title: 'Dashboard',
		body: 'Your overview: upcoming sessions, goals, membership, and quick actions live here.',
		targetKey: 'dashboard',
		tab: 'dashboard',
	},
	{
		id: 'quickstats',
		title: 'Quick Stats & Content',
		body: 'See your upcoming sessions count and completed sessions this month.',
		targetKey: 'quickstats',
		tab: 'dashboard',
	},
	{
		id: 'dashboard_view_goals',
		title: 'View All Goals',
		body: 'Tap View All to see and manage all your active goals on the Progress tab.',
		targetKey: 'dashboard_view_goals',
		tab: 'dashboard',
	},
	{
		id: 'dashboard_quick_progress',
		title: 'Quick Action: Progress',
		body: 'Jump straight to your progress and goals.',
		targetKey: 'dashboard_quick_progress',
		tab: 'dashboard',
	},
	{
		id: 'dashboard_quick_subscription',
		title: 'Quick Action: Subscription',
		body: 'Jump to your membership and subscription details.',
		targetKey: 'dashboard_quick_subscription',
		tab: 'dashboard',
	},
	{
		id: 'workouts',
		title: 'Workouts',
		body: 'Browse exercises and build your routine.',
		targetKey: 'workouts',
		tab: 'workouts',
	},
	{
		id: 'workouts_search',
		title: 'Search Workouts',
		body: 'Search by name, body part, or target muscle to find exercises.',
		targetKey: 'workouts_search',
		tab: 'workouts',
	},
	{
		id: 'schedule',
		title: 'Schedule',
		body: 'View and manage your sessions with coaches. Complete sessions and rate your experience.',
		targetKey: 'schedule',
		tab: 'schedule',
	},
	{
		id: 'progress',
		title: 'Progress',
		body: 'Track your goals, weight, and session logs.',
		targetKey: 'progress',
		tab: 'progress',
	},
	{
		id: 'progress_add_goal',
		title: 'Add Goal',
		body: 'Tap to create a new fitness goal and track your progress.',
		targetKey: 'progress_add_goal',
		tab: 'progress',
	},
	{
		id: 'progress_session_logs',
		title: 'Session Logs',
		body: 'View your completed session logs and history.',
		targetKey: 'progress_session_logs',
		tab: 'progress',
	},
	{
		id: 'subscription',
		title: 'Subscription',
		body: 'Manage your membership and view your plan.',
		targetKey: 'subscription',
		tab: 'subscription',
	},
	{
		id: 'end',
		title: "You're All Set",
		body: 'Tap any tab to explore. Enjoy your fitness journey!',
		targetKey: null,
		tab: 'dashboard',
	},
];

const MemberLayoutContent = () => {
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
		router.replace(`/(member)/${tab}` as any);
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
				<Tabs.Screen name='profile' options={{ href: null }} />
				<Tabs.Screen name='coaches' options={{ href: null }} />
				<Tabs.Screen name='session-logs' options={{ href: null }} />
				<Tabs.Screen name='attendance' options={{ href: null }} />
			</Tabs>
			<TourOverlay />
		</View>
	);
};

const MemberLayout = () => {
	return (
		<ProtectedRoute allowedRoles={['member']}>
			<TourProvider steps={MEMBER_TOUR_STEPS} role='member'>
				<MemberLayoutContent />
			</TourProvider>
		</ProtectedRoute>
	);
};

export default MemberLayout;
