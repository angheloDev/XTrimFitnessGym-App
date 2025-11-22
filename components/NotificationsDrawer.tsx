import { useAuth } from '@/contexts/AuthContext';
import { UPDATE_COACH_REQUEST_MUTATION } from '@/graphql/mutations';
import {
	GET_PENDING_COACH_REQUESTS_QUERY,
	GET_UPCOMING_SESSIONS_QUERY,
} from '@/graphql/queries';
import { useMutation, useQuery } from '@apollo/client/react';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
	Alert,
	Animated,
	Modal,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface NotificationsDrawerProps {
	visible: boolean;
	onClose: () => void;
}

interface Notification {
	id: string;
	type: 'session' | 'membership' | 'progress' | 'coachRequest';
	title: string;
	message: string;
	time: string;
	read: boolean;
	requestId?: string; // For coach requests
	coachRequest?: any; // Full request data
}

const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
	visible,
	onClose,
}) => {
	const insets = useSafeAreaInsets();
	const { user } = useAuth();
	const [slideAnim] = useState(new Animated.Value(0));
	const [notifications, setNotifications] = useState<Notification[]>([]);

	const { data: sessionsData } = useQuery(GET_UPCOMING_SESSIONS_QUERY, {
		skip: !visible,
		fetchPolicy: 'cache-and-network',
	});

	const { data: coachRequestsData, refetch: refetchRequests } = useQuery(
		GET_PENDING_COACH_REQUESTS_QUERY,
		{
			skip: !visible || user?.role !== 'coach',
			fetchPolicy: 'cache-and-network',
		}
	);

	const [updateCoachRequest] = useMutation(UPDATE_COACH_REQUEST_MUTATION, {
		onCompleted: () => {
			refetchRequests();
			Alert.alert('Success', 'Request updated successfully');
		},
		onError: (error) => {
			Alert.alert('Error', error.message);
		},
	});

	useEffect(() => {
		if (visible) {
			Animated.spring(slideAnim, {
				toValue: 1,
				useNativeDriver: true,
				tension: 50,
				friction: 7,
			}).start();
		} else {
			Animated.spring(slideAnim, {
				toValue: 0,
				useNativeDriver: true,
				tension: 50,
				friction: 7,
			}).start();
		}
	}, [visible, slideAnim]);

	useEffect(() => {
		if (
			sessionsData &&
			Array.isArray((sessionsData as any).getUpcomingSessions)
		) {
			const sessionNotifications: Notification[] = (
				sessionsData as any
			).getUpcomingSessions
				.slice(0, 5)
				.map((session: any, index: number) => {
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

			// Add membership due notification (example)
			const membershipNotification: Notification = {
				id: 'membership-1',
				type: 'membership',
				title: 'Membership Renewal',
				message: 'Your membership will expire in 7 days',
				time: '2 days ago',
				read: false,
			};

			// Add progress notification (example)
			const progressNotification: Notification = {
				id: 'progress-1',
				type: 'progress',
				title: 'Progress Update',
				message: "You've completed 5 sessions this month!",
				time: '1 week ago',
				read: false,
			};

			setNotifications([
				...sessionNotifications,
				membershipNotification,
				progressNotification,
			]);
		}
	}, [sessionsData]);

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
			default:
				return '#8E8E93';
		}
	};

	const handleApproveRequest = (requestId: string) => {
		Alert.alert('Approve Request', 'Approve this client request?', [
			{ text: 'Cancel', style: 'cancel' },
			{
				text: 'Approve',
				onPress: () => {
					updateCoachRequest({
						variables: {
							id: requestId,
							input: { status: 'approved' },
						},
					});
				},
			},
		]);
	};

	const handleDenyRequest = (requestId: string) => {
		Alert.alert('Deny Request', 'Deny this client request?', [
			{ text: 'Cancel', style: 'cancel' },
			{
				text: 'Deny',
				style: 'destructive',
				onPress: () => {
					updateCoachRequest({
						variables: {
							id: requestId,
							input: { status: 'denied' },
						},
					});
				},
			},
		]);
	};

	const translateX = slideAnim.interpolate({
		inputRange: [0, 1],
		outputRange: [300, 0],
	});

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
					<TouchableOpacity activeOpacity={1}>
						<View className='flex-row items-center justify-between px-5 mb-6'>
							<Text className='text-2xl font-bold text-text-primary'>
								Notifications
							</Text>
							<TouchableOpacity onPress={onClose}>
								<Ionicons name='close' size={28} color='#8E8E93' />
							</TouchableOpacity>
						</View>

						<ScrollView
							showsVerticalScrollIndicator={false}
							className='flex-1 px-5'
						>
							{notifications.length === 0 ? (
								<View className='items-center justify-center py-20'>
									<Ionicons
										name='notifications-off-outline'
										size={64}
										color='#8E8E93'
									/>
									<Text className='text-text-secondary mt-4 text-center'>
										No notifications
									</Text>
								</View>
							) : (
								notifications.map((notification) => (
									<TouchableOpacity
										key={notification.id}
										className='bg-bg-darker rounded-xl p-4 mb-3 flex-row'
									>
										<View
											className='rounded-full p-3 mr-3'
											style={{
												backgroundColor: `${getNotificationColor(notification.type)}20`,
											}}
										>
											<Ionicons
												name={getNotificationIcon(notification.type) as any}
												size={24}
												color={getNotificationColor(notification.type)}
											/>
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
											<Text className='text-text-secondary text-xs'>
												{notification.time}
											</Text>
										</View>
									</TouchableOpacity>
								))
							)}
						</ScrollView>
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
		shadowOffset: {
			width: -2,
			height: 0,
		},
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
	},
});

export default NotificationsDrawer;
