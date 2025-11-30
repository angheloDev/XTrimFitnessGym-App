import { useAuth } from '@/contexts/AuthContext';
import {
	GET_CLIENT_REQUESTS_QUERY,
	GET_PENDING_COACH_REQUESTS_QUERY,
} from '@/graphql/queries';
import { useQuery } from '@apollo/client/react';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import NotificationsDrawer from './NotificationsDrawer';
import ProfileDropdown from './ProfileDropdown';

interface TabHeaderProps {
	showCoachIcon?: boolean;
}

const TabHeader: React.FC<TabHeaderProps> = ({ showCoachIcon = false }) => {
	const { user } = useAuth();
	const router = useRouter();
	const [showNotifications, setShowNotifications] = useState(false);
	const [showProfileDropdown, setShowProfileDropdown] = useState(false);
	const shakeAnim = useRef(new Animated.Value(0)).current;
	const previousRequestCountRef = useRef(0);

	// Query for pending coach requests (only for coaches) - Real-time polling
	const { data: coachRequestsData } = useQuery(GET_PENDING_COACH_REQUESTS_QUERY, {
		skip: user?.role !== 'coach',
		fetchPolicy: 'network-only', // Always fetch from network for real-time updates
		pollInterval: user?.role === 'coach' ? 2000 : 0, // Poll every 2 seconds for real-time updates
		errorPolicy: 'all', // Allow partial data even if some fields fail
		notifyOnNetworkStatusChange: true, // Notify on network changes
	});

	// Query for client requests to get status updates (only for members) - Real-time polling
	const { data: clientRequestsData } = useQuery(GET_CLIENT_REQUESTS_QUERY, {
		skip: !user?.id || user?.role !== 'member',
		variables: { clientId: user?.id || '' },
		fetchPolicy: 'cache-and-network',
		pollInterval: user?.role === 'member' ? 2000 : 0, // Poll every 2 seconds for real-time updates
		errorPolicy: 'all', // Allow partial data even if some fields fail
		notifyOnNetworkStatusChange: true, // Notify on network changes
	});

	// Get pending requests and filter out invalid data
	const pendingRequests = (coachRequestsData as any)?.getPendingCoachRequests;
	const validPendingRequests = Array.isArray(pendingRequests)
		? pendingRequests.filter(
				(request: any) => request && request.id && request.client && request.client.id
		  )
		: [];
	const pendingRequestCount = validPendingRequests.length;

	// Count new status updates for members (accepted/rejected in last 24 hours)
	const newStatusUpdatesCount = React.useMemo(() => {
		if (user?.role !== 'member' || !clientRequestsData) return 0;
		const clientRequests = (clientRequestsData as any).getClientRequests || [];
		const now = new Date();
		return clientRequests.filter((request: any) => {
			if (!request || !request.id) return false;
			if (request.status !== 'approved' && request.status !== 'denied') return false;
			// Check if coach data is valid
			if (!request.coach || !request.coach.id) return false;
			const updatedAt = new Date(request.updatedAt);
			const hoursSinceUpdate = (now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60);
			return hoursSinceUpdate < 24; // Count requests updated in last 24 hours
		}).length;
	}, [clientRequestsData, user?.role]);

	const totalNotificationCount =
		user?.role === 'coach' ? pendingRequestCount : newStatusUpdatesCount;

	// Trigger shake animation when new notifications arrive
	useEffect(() => {
		if (totalNotificationCount > previousRequestCountRef.current) {
			// Shake animation sequence
			Animated.sequence([
				Animated.timing(shakeAnim, {
					toValue: 10,
					duration: 50,
					useNativeDriver: true,
				}),
				Animated.timing(shakeAnim, {
					toValue: -10,
					duration: 50,
					useNativeDriver: true,
				}),
				Animated.timing(shakeAnim, {
					toValue: 10,
					duration: 50,
					useNativeDriver: true,
				}),
				Animated.timing(shakeAnim, {
					toValue: 0,
					duration: 50,
					useNativeDriver: true,
				}),
			]).start();
		}
		previousRequestCountRef.current = totalNotificationCount;
	}, [totalNotificationCount, shakeAnim]);

	const handleCoachPress = () => {
		if (showCoachIcon) {
			router.push('/(member)/coaches');
		}
	};

	return (
		<>
			<View
				style={[
					styles.header,
					{
						paddingTop: 20,
						paddingBottom: 25,
					},
				]}
				className='bg-bg-darker border-b border-bg-primary'
			>
				<View className='flex-row items-center justify-between px-5'>
					{/* Left side - Coach icon (only for members) */}
					<View className='flex-1'>
						{showCoachIcon ? (
							<TouchableOpacity
								onPress={handleCoachPress}
								className='flex-row items-center'
							>
								<View className='bg-bg-primary rounded-full p-1'>
									<Ionicons name='people' size={20} color='#F9C513' />
								</View>
								<Text className='text-text-primary font-semibold'>Coaches</Text>
							</TouchableOpacity>
						) : (
							<View />
						)}
					</View>

					{/* Center - App Logo */}
					<View className='flex-1 items-center'>
						<Image
							source={require('@/assets/logos/XTFG_logo.PNG')}
							style={{ width: 120, height: 40 }}
							contentFit='contain'
						/>
					</View>

					{/* Right side - Notifications and Profile */}
					<View className='flex-1 flex-row items-center justify-end gap-3'>
						<TouchableOpacity
							onPress={() => setShowNotifications(true)}
							className='relative'
						>
							<Animated.View
								style={{
									transform: [{ translateX: shakeAnim }],
								}}
							>
								<Ionicons name='notifications-outline' size={24} color='#F9C513' />
							</Animated.View>
							{/* Notification badge - show count for coaches and members with notifications */}
							{totalNotificationCount > 0 && (
								<View className='absolute -top-1 -right-1 bg-red-500 rounded-full min-w-[18px] h-[18px] items-center justify-center px-1'>
									<Text className='text-white text-xs font-bold'>
										{totalNotificationCount > 9 ? '9+' : totalNotificationCount}
									</Text>
								</View>
							)}
						</TouchableOpacity>

						<TouchableOpacity
							onPress={() => setShowProfileDropdown(!showProfileDropdown)}
							className='relative'
						>
							{user?.firstName ? (
								<View className='bg-[#F9C513] rounded-full w-8 h-8 items-center justify-center'>
									<Text className='text-bg-darker font-bold text-sm'>
										{user.firstName.charAt(0).toUpperCase() +
											user?.lastName?.charAt(0).toUpperCase() || ''}
									</Text>
								</View>
							) : (
								<Ionicons
									name='person-circle-outline'
									size={32}
									color='#F9C513'
								/>
							)}
						</TouchableOpacity>
					</View>
				</View>
			</View>

			{/* Notifications Drawer */}
			<NotificationsDrawer
				visible={showNotifications}
				onClose={() => setShowNotifications(false)}
			/>

			{/* Profile Dropdown */}
			<ProfileDropdown
				visible={showProfileDropdown}
				onClose={() => setShowProfileDropdown(false)}
			/>
		</>
	);
};

const styles = StyleSheet.create({
	header: {
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.1,
		shadowRadius: 3.84,
		elevation: 5,
	},
});

export default TabHeader;
