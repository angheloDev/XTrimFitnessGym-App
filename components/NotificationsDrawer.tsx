import { useAuth } from '@/contexts/AuthContext';
import { UPDATE_COACH_REQUEST_MUTATION } from '@/graphql/mutations';
import {
	GET_CLIENT_REQUESTS_QUERY,
	GET_PENDING_COACH_REQUESTS_QUERY,
	GET_UPCOMING_SESSIONS_QUERY,
	GET_USER_QUERY,
	GET_USERS_QUERY,
} from '@/graphql/queries';
import { useAppDispatch } from '@/store/hooks';
import { updateUser } from '@/store/slices/userSlice';
import { useLazyQuery, useMutation, useQuery } from '@apollo/client/react';
import { Ionicons } from '@expo/vector-icons';
import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import {
	Alert,
	Animated,
	FlatList,
	Modal,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface NotificationsDrawerProps {
	visible: boolean;
	onClose: () => void;
}

interface Notification {
	id: string;
	type:
		| 'session'
		| 'membership'
		| 'progress'
		| 'coachRequest'
		| 'requestStatus'
		| 'coachRemoved';
	title: string;
	message: string;
	time: string;
	read: boolean;
	requestId?: string;
	coachRequest?: any;
}

// Swipeable notification item component
const SwipeableNotificationItem = React.memo<{
	notification: Notification;
	onApprove?: (requestId: string) => void;
	onReject?: (requestId: string) => void;
	onDismiss: (id: string) => void;
}>(({ notification, onApprove, onReject, onDismiss }) => {
	const swipeableRef = useRef<Swipeable>(null);

	const getNotificationIcon = (type: string) => {
		switch (type) {
			case 'session':
				return 'calendar';
			case 'membership':
				return 'card';
			case 'progress':
				return 'trending-up';
			case 'coachRequest':
				return 'person-add';
			case 'requestStatus':
				return 'checkmark-circle';
			case 'coachRemoved':
				return 'person-remove';
			default:
				return 'notifications';
		}
	};

	const getNotificationColor = (type: string) => {
		switch (type) {
			case 'session':
				return '#F9C513';
			case 'membership':
				return '#E41E26';
			case 'progress':
				return '#34C759';
			case 'coachRequest':
				return '#007AFF';
			case 'requestStatus':
				return '#34C759';
			case 'coachRemoved':
				return '#FF3B30';
			default:
				return '#8E8E93';
		}
	};

	const iconColor = getNotificationColor(notification.type);
	const iconName = getNotificationIcon(notification.type);

	// Render left actions (appears when swiping right)
	const renderLeftActions = (
		_progress: Animated.AnimatedInterpolation<string | number>,
		dragX: Animated.AnimatedInterpolation<string | number>
	) => {
		const scale = dragX.interpolate({
			inputRange: [0, 100],
			outputRange: [0, 1],
			extrapolate: 'clamp',
		});

		return (
			<View className='flex-row items-center justify-start bg-red-500 rounded-xl mb-3 px-6'>
				<Animated.View style={{ transform: [{ scale }] }}>
					<Ionicons name='trash-outline' size={28} color='#fff' />
				</Animated.View>
				<Text className='text-white font-semibold ml-2'>Delete</Text>
			</View>
		);
	};

	const handleSwipeableOpen = () => {
		// Auto-dismiss after swipe
		setTimeout(() => {
			onDismiss(notification.id);
			swipeableRef.current?.close();
		}, 300);
	};

	return (
		<Swipeable
			ref={swipeableRef}
			renderLeftActions={renderLeftActions}
			onSwipeableOpen={handleSwipeableOpen}
			leftThreshold={40}
			friction={2}
		>
			<View className='bg-bg-darker rounded-xl p-4 mb-3'>
				<View className='flex-row'>
					<View
						className='rounded-full mr-3 items-center justify-center'
						style={{
							backgroundColor: `${iconColor}20`,
							width: 48,
							height: 48,
						}}
					>
						<Ionicons name={iconName as any} size={24} color={iconColor} />
					</View>
					<View className='flex-1'>
						<View className='flex-row items-center justify-between mb-1'>
							<Text className='text-text-primary font-semibold text-base'>
								{notification.title}
							</Text>
							{!notification.read && (
								<View className='bg-[#F9C513] rounded-full w-2 h-2' />
							)}
						</View>
						<Text className='text-text-secondary text-sm mb-1'>
							{notification.message}
						</Text>
						<Text className='text-text-secondary text-xs mb-2'>
							{notification.time}
						</Text>
						{notification.type === 'coachRequest' &&
							notification.requestId &&
							onApprove &&
							onReject && (
								<View className='flex-row gap-2 mt-2'>
									<TouchableOpacity
										onPress={() => onApprove(notification.requestId!)}
										className='flex-1 bg-[#34C759] rounded-lg py-2 px-4 items-center'
									>
										<Text className='text-white font-semibold text-sm'>
											Accept
										</Text>
									</TouchableOpacity>
									<TouchableOpacity
										onPress={() => onReject(notification.requestId!)}
										className='flex-1 bg-[#FF3B30] rounded-lg py-2 px-4 items-center'
									>
										<Text className='text-white font-semibold text-sm'>
											Reject
										</Text>
									</TouchableOpacity>
								</View>
							)}
					</View>
				</View>
			</View>
		</Swipeable>
	);
});

SwipeableNotificationItem.displayName = 'SwipeableNotificationItem';

const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
	visible,
	onClose,
}) => {
	const insets = useSafeAreaInsets();
	const { user } = useAuth();
	const dispatch = useAppDispatch();
	const translateX = useRef(new Animated.Value(300)).current;
	const [dismissedNotifications, setDismissedNotifications] = useState<
		Set<string>
	>(new Set());

	// Animate drawer when visible changes
	useEffect(() => {
		if (visible) {
			Animated.spring(translateX, {
				toValue: 0,
				useNativeDriver: true,
				tension: 50,
				friction: 7,
			}).start();
		} else {
			Animated.spring(translateX, {
				toValue: 300,
				useNativeDriver: true,
				tension: 50,
				friction: 7,
			}).start();
		}
	}, [visible, translateX]);

	// Query for sessions (members) - Real-time polling
	const { data: sessionsData } = useQuery(GET_UPCOMING_SESSIONS_QUERY, {
		skip: !visible || user?.role !== 'member',
		fetchPolicy: 'cache-and-network',
		pollInterval: user?.role === 'member' && visible ? 2000 : 0, // Poll every 2 seconds for real-time updates
		notifyOnNetworkStatusChange: true,
	});

	// Query for pending coach requests (coaches) - Real-time polling
	// Note: Polling should work even when drawer is not visible to update badge
	const { data: coachRequestsData, refetch: refetchCoachRequests } = useQuery(
		GET_PENDING_COACH_REQUESTS_QUERY,
		{
			skip: user?.role !== 'coach', // Only skip if not a coach, not based on visibility
			fetchPolicy: 'network-only', // Always fetch from network for real-time updates
			pollInterval: user?.role === 'coach' ? 2000 : 0, // Poll every 2 seconds for real-time updates (even when drawer closed)
			errorPolicy: 'all', // Allow partial data even if some fields fail
			notifyOnNetworkStatusChange: true,
		}
	);

	// Query for client requests to get accepted/rejected status (members) - Real-time polling
	const { data: clientRequestsData, refetch: refetchClientRequests } = useQuery(
		GET_CLIENT_REQUESTS_QUERY,
		{
			skip: !visible || !user?.id || user?.role !== 'member',
			variables: { clientId: user?.id || '' },
			fetchPolicy: 'cache-and-network',
			pollInterval: user?.role === 'member' && visible ? 2000 : 0, // Poll every 2 seconds for real-time updates
			errorPolicy: 'all', // Allow partial data even if some fields fail
			notifyOnNetworkStatusChange: true,
		}
	);

	// Query coaches to detect removals (members) - Real-time polling
	const { data: coachesData } = useQuery(GET_USERS_QUERY, {
		skip: !visible || user?.role !== 'member',
		variables: { role: 'coach' },
		fetchPolicy: 'cache-and-network',
		pollInterval: user?.role === 'member' && visible ? 2000 : 0, // Poll every 2 seconds to detect removals
		notifyOnNetworkStatusChange: true,
	});

	// Query current user in real-time to detect coach removals (members)
	const { data: currentUserData } = useQuery(GET_USER_QUERY, {
		skip: !visible || !user?.id || user?.role !== 'member',
		variables: { id: user?.id || '' },
		fetchPolicy: 'cache-and-network',
		pollInterval: user?.role === 'member' && visible ? 2000 : 0, // Poll every 2 seconds for real-time updates
		notifyOnNetworkStatusChange: true,
	});

	// Lazy query to refetch current user after mutations
	const [refetchCurrentUser] = useLazyQuery(GET_USER_QUERY, {
		fetchPolicy: 'network-only', // Always fetch fresh data
	});

	// Track previous coachesIds to detect removals
	const previousCoachesIdsRef = useRef<string[]>([]);
	const [removedCoaches, setRemovedCoaches] = useState<string[]>([]);

	// Use currentUserData if available, otherwise fall back to user from context
	const userToCheck = (currentUserData as any)?.getUser || user;

	useEffect(() => {
		if (
			userToCheck?.role === 'member' &&
			userToCheck?.membershipDetails?.coachesIds
		) {
			const currentCoachesIds = (userToCheck.membershipDetails.coachesIds || [])
				.filter((id: any) => id != null)
				.map((id: any) => String(id));
			const previous = previousCoachesIdsRef.current;

			// Find coaches that were removed (only if we had previous data)
			if (previous.length > 0) {
				const removed = previous.filter(
					(id) => !currentCoachesIds.includes(id)
				);

				if (removed.length > 0) {
					setRemovedCoaches((prev) => {
						// Avoid duplicates
						const newRemoved = removed.filter((id) => !prev.includes(id));
						return [...prev, ...newRemoved];
					});
					// Update Redux store with latest user data
					const latestUser = (currentUserData as any)?.getUser;
					if (latestUser) {
						dispatch(updateUser(latestUser));
					}
				}
			}

			// Update previous coachesIds
			previousCoachesIdsRef.current = currentCoachesIds;
		}
	}, [
		userToCheck?.membershipDetails?.coachesIds,
		userToCheck?.role,
		currentUserData,
		dispatch,
	]);

	const [updateCoachRequest] = useMutation(UPDATE_COACH_REQUEST_MUTATION, {
		onCompleted: async () => {
			refetchCoachRequests();
			// Refetch client requests to show status updates
			if (user?.role === 'member') {
				refetchClientRequests();
			}
			// Refetch current user to update Redux store with latest data
			if (user?.id) {
				try {
					const result = await refetchCurrentUser({
						variables: { id: user.id },
					});
					const userData = (result.data as any)?.getUser;
					if (userData) {
						dispatch(updateUser(userData));
					}
				} catch (error) {
					console.error('Error refetching user:', error);
				}
			}
		},
		onError: (error) => {
			Alert.alert('Error', error.message);
		},
	});

	const formatTimeAgo = useCallback((dateString: string) => {
		const date = new Date(dateString);
		const now = new Date();
		const diffInMs = now.getTime() - date.getTime();
		const diffInMins = Math.floor(diffInMs / (1000 * 60));
		const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
		const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

		if (diffInMins < 1) return 'Just now';
		if (diffInMins < 60)
			return `${diffInMins} min${diffInMins !== 1 ? 's' : ''} ago`;
		if (diffInHours < 24)
			return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
		if (diffInDays < 7)
			return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
		return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
	}, []);

	// Memoize notifications array for better performance
	const notifications = useMemo(() => {
		const allNotifications: Notification[] = [];

		// Session notifications for members
		if (
			sessionsData &&
			Array.isArray((sessionsData as any).getUpcomingSessions) &&
			user?.role === 'member'
		) {
			const sessionNotifications: Notification[] = (
				sessionsData as any
			).getUpcomingSessions
				.slice(0, 5)
				.map((session: any) => {
					const sessionDate = new Date(session.date);
					const now = new Date();
					const hoursUntil = Math.floor(
						(sessionDate.getTime() - now.getTime()) / (1000 * 60 * 60)
					);
					return {
						id: `session-${session.id}`,
						type: 'session' as const,
						title: 'Upcoming Session',
						message: `${session.name} with Coach ${session.coach?.firstName || ''} at ${session.startTime}`,
						time: hoursUntil > 0 ? `In ${hoursUntil} hours` : 'Today',
						read: false,
					};
				});
			allNotifications.push(...sessionNotifications);
		}

		// Coach request notifications for coaches (pending requests)
		if (user?.role === 'coach') {
			// Check if coachRequestsData exists and has the expected structure
			const pendingRequests = (coachRequestsData as any)
				?.getPendingCoachRequests;

			if (pendingRequests && Array.isArray(pendingRequests)) {
				const coachRequestNotifications: Notification[] = pendingRequests
					.filter((request: any) => {
						// Filter out requests with invalid client data
						return request && request.id && request.client && request.client.id;
					})
					.map((request: any) => {
						const clientName = request.client
							? `${request.client.firstName || ''} ${request.client.lastName || ''}`.trim() ||
								'A member'
							: 'A member';
						return {
							id: `coachRequest-${request.id}`,
							type: 'coachRequest' as const,
							title: 'New Coach Request',
							message: `${clientName} wants to be your client`,
							time: formatTimeAgo(request.createdAt),
							read: false,
							requestId: request.id,
							coachRequest: request,
						};
					});
				allNotifications.push(...coachRequestNotifications);
			}
		}

		// Client request status notifications (accepted/rejected) for members
		if (
			clientRequestsData &&
			Array.isArray((clientRequestsData as any).getClientRequests) &&
			user?.role === 'member'
		) {
			const clientRequests = (clientRequestsData as any).getClientRequests;
			// Filter for recently accepted or rejected requests (within last 24 hours)
			// Also filter out requests with invalid coach data
			const recentStatusUpdates = clientRequests.filter((request: any) => {
				if (!request || !request.id) return false;
				if (request.status !== 'approved' && request.status !== 'denied')
					return false;
				// Check if coach data is valid
				if (!request.coach || !request.coach.id) return false;
				const updatedAt = new Date(request.updatedAt);
				const now = new Date();
				const hoursSinceUpdate =
					(now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60);
				return hoursSinceUpdate < 24; // Show notifications for requests updated in last 24 hours
			});

			const statusNotifications: Notification[] = recentStatusUpdates.map(
				(request: any) => {
					const coachName = request.coach
						? `${request.coach.firstName || ''} ${request.coach.lastName || ''}`.trim() ||
							'Coach'
						: 'Coach';
					const isApproved = request.status === 'approved';
					return {
						id: `requestStatus-${request.id}`,
						type: 'requestStatus' as const,
						title: isApproved ? 'Request Accepted!' : 'Request Rejected',
						message: isApproved
							? `${coachName} has accepted your coach request. You are now their client!`
							: `${coachName} has rejected your coach request.`,
						time: formatTimeAgo(request.updatedAt),
						read: false,
						requestId: request.id,
						coachRequest: request,
					};
				}
			);
			allNotifications.push(...statusNotifications);
		}

		// Coach removal notifications for members
		if (user?.role === 'member' && removedCoaches.length > 0 && coachesData) {
			const coaches = (coachesData as any)?.getUsers || [];
			const removalNotifications = removedCoaches
				.map((removedCoachId: string) => {
					const coach = coaches.find((c: any) => c && c.id === removedCoachId);
					if (!coach) return null;
					const coachName =
						`${coach.firstName || ''} ${coach.lastName || ''}`.trim() ||
						'Your coach';
					return {
						id: `coachRemoved-${removedCoachId}`,
						type: 'coachRemoved' as const,
						title: 'Coach Removed',
						message: `${coachName} has removed you as their client.`,
						time: 'Just now',
						read: false,
					} as Notification;
				})
				.filter((n): n is Notification => n !== null);
			allNotifications.push(...removalNotifications);
		}

		// Example notifications for members
		if (user?.role === 'member') {
			allNotifications.push(
				{
					id: 'membership-1',
					type: 'membership',
					title: 'Membership Renewal',
					message: 'Your membership will expire in 7 days',
					time: '2 days ago',
					read: false,
				},
				{
					id: 'progress-1',
					type: 'progress',
					title: 'Progress Update',
					message: "You've completed 5 sessions this month!",
					time: '1 week ago',
					read: false,
				}
			);
		}

		// Filter out dismissed notifications
		return allNotifications.filter(
			(notification) => !dismissedNotifications.has(notification.id)
		);
	}, [
		sessionsData,
		coachRequestsData,
		clientRequestsData,
		coachesData,
		removedCoaches,
		user?.role,
		formatTimeAgo,
		dismissedNotifications,
	]);

	const handleDismiss = useCallback((id: string) => {
		setDismissedNotifications((prev) => new Set([...prev, id]));
	}, []);

	const handleApproveRequest = useCallback(
		(requestId: string) => {
			Alert.alert('Approve Request', 'Approve this client request?', [
				{ text: 'Cancel', style: 'cancel' },
				{
					text: 'Approve',
					onPress: () => {
						updateCoachRequest({
							variables: { id: requestId, input: { status: 'approved' } },
						});
					},
				},
			]);
		},
		[updateCoachRequest]
	);

	const handleRejectRequest = useCallback(
		(requestId: string) => {
			Alert.alert('Deny Request', 'Deny this client request?', [
				{ text: 'Cancel', style: 'cancel' },
				{
					text: 'Deny',
					style: 'destructive',
					onPress: () => {
						updateCoachRequest({
							variables: { id: requestId, input: { status: 'denied' } },
						});
					},
				},
			]);
		},
		[updateCoachRequest]
	);

	const renderItem = useCallback(
		({ item }: { item: Notification }) => (
			<SwipeableNotificationItem
				notification={item}
				onApprove={handleApproveRequest}
				onReject={handleRejectRequest}
				onDismiss={handleDismiss}
			/>
		),
		[handleApproveRequest, handleRejectRequest, handleDismiss]
	);

	const keyExtractor = useCallback((item: Notification) => item.id, []);

	const renderEmpty = useCallback(
		() => (
			<View className='items-center justify-center py-20'>
				<Ionicons name='notifications-off-outline' size={64} color='#8E8E93' />
				<Text className='text-text-secondary mt-4 text-center'>
					No notifications
				</Text>
			</View>
		),
		[]
	);

	if (!visible) return null;

	return (
		<Modal
			visible={visible}
			transparent
			animationType='none'
			onRequestClose={onClose}
		>
			<TouchableOpacity
				style={styles.overlay}
				activeOpacity={1}
				onPress={onClose}
			>
				<Animated.View
					style={[
						styles.drawer,
						{
							transform: [{ translateX }],
							paddingTop: insets.top + 20,
							paddingBottom: insets.bottom + 20,
						},
					]}
				>
					<TouchableOpacity
						activeOpacity={1}
						onPress={(e) => e.stopPropagation()}
					>
						<View className='flex-row items-center justify-between px-5 mb-6'>
							<Text className='text-2xl font-bold text-text-primary'>
								Notifications
							</Text>
							<TouchableOpacity onPress={onClose}>
								<Ionicons name='close' size={28} color='#8E8E93' />
							</TouchableOpacity>
						</View>

						<FlatList
							data={notifications}
							renderItem={renderItem}
							keyExtractor={keyExtractor}
							ListEmptyComponent={renderEmpty}
							showsVerticalScrollIndicator={false}
							contentContainerStyle={styles.listContent}
							removeClippedSubviews={true}
							maxToRenderPerBatch={10}
							updateCellsBatchingPeriod={50}
							initialNumToRender={10}
							windowSize={10}
						/>
					</TouchableOpacity>
				</Animated.View>
			</TouchableOpacity>
		</Modal>
	);
};

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		flexDirection: 'row',
		justifyContent: 'flex-end',
	},
	drawer: {
		width: '85%',
		height: '100%',
		backgroundColor: '#1C1C1E',
		shadowColor: '#000',
		shadowOffset: { width: -2, height: 0 },
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
	},
	listContent: {
		paddingHorizontal: 20,
		paddingBottom: 20,
	},
});

export default NotificationsDrawer;
