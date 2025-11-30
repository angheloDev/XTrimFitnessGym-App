import FixedView from '@/components/FixedView';
import TabHeader from '@/components/TabHeader';
import { useAuth } from '@/contexts/AuthContext';
import {
	GET_COACH_SESSIONS_QUERY,
	GET_PENDING_COACH_REQUESTS_QUERY,
	GET_USERS_QUERY,
} from '@/graphql/queries';
import { formatTimeTo12Hour } from '@/utils/time-utils';
import { useQuery } from '@apollo/client/react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useEffect, useState } from 'react';
import {
	FlatList,
	RefreshControl,
	ScrollView,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';

const CoachDashboard = () => {
	const { user } = useAuth();
	const router = useRouter();
	const [refreshing, setRefreshing] = useState(false);

	const { data: sessionsData, loading: sessionsLoading, refetch: refetchSessions } = useQuery(
		GET_COACH_SESSIONS_QUERY,
		{
			variables: { coachId: user?.id || '' },
			skip: !user?.id,
			fetchPolicy: 'cache-and-network',
		}
	);

	const { data: clientsData, refetch: refetchClients } = useQuery(GET_USERS_QUERY, {
		variables: { role: 'member' },
		fetchPolicy: 'cache-and-network',
	});

	const { data: requestsData, refetch: refetchRequests } = useQuery(GET_PENDING_COACH_REQUESTS_QUERY, {
		fetchPolicy: 'network-only', // Always fetch from network for real-time updates
		pollInterval: 2000, // Poll every 2 seconds for real-time updates
		errorPolicy: 'all', // Allow partial data even if some fields fail
		notifyOnNetworkStatusChange: true,
	});

	// Refetch data when screen is mounted
	useEffect(() => {
		if (user?.id) {
			refetchSessions();
		}
		refetchClients();
		refetchRequests();
	}, [user?.id, refetchSessions, refetchClients, refetchRequests]);

	// Handle pull-to-refresh
	const onRefresh = async () => {
		setRefreshing(true);
		try {
			const promises = [];
			if (user?.id) {
				promises.push(refetchSessions());
			}
			promises.push(refetchClients());
			promises.push(refetchRequests());
			await Promise.all(promises);
		} finally {
			setRefreshing(false);
		}
	};

	// Memoize sessions to prevent creating new array on every render
	const sessions = useMemo(
		() => (sessionsData as any)?.getCoachSessions || [],
		[sessionsData]
	);

	// Filter to only show coach's own clients
	const allClients = (clientsData as any)?.getUsers || [];
	const clients = allClients.filter((client: any) =>
		user?.coachDetails?.clientsIds?.includes(client.id)
	);
	const upcomingSessions = sessions.filter(
		(s: any) => new Date(s.date) >= new Date() && s.status === 'scheduled'
	);

	const pendingRequests = useMemo(() => {
		const allRequests = (requestsData as any)?.getPendingCoachRequests || [];
		// Filter out requests with invalid client data
		return allRequests.filter(
			(request: any) => request && request.id && request.client && request.client.id
		);
	}, [requestsData]);

	// Calculate sessions this month
	const sessionsThisMonth = useMemo(() => {
		const now = new Date();
		const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
		return sessions.filter((s: any) => {
			const sessionDate = new Date(s.date);
			return sessionDate >= startOfMonth && sessionDate <= now;
		}).length;
	}, [sessions]);

	// Calculate completed sessions this month
	const completedThisMonth = useMemo(() => {
		const now = new Date();
		const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
		return sessions.filter((s: any) => {
			const sessionDate = new Date(s.date);
			return (
				sessionDate >= startOfMonth &&
				sessionDate <= now &&
				s.status === 'completed'
			);
		}).length;
	}, [sessions]);

	// Client capacity
	const clientCapacity = useMemo(() => {
		const currentClients = clients.length;
		const limit = user?.coachDetails?.clientLimit || 0;
		return {
			current: currentClients,
			limit,
			percentage: limit > 0 ? (currentClients / limit) * 100 : 0,
		};
	}, [clients.length, user?.coachDetails?.clientLimit]);

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		const today = new Date();
		const tomorrow = new Date(today);
		tomorrow.setDate(tomorrow.getDate() + 1);

		if (date.toDateString() === today.toDateString()) return 'Today';
		if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
		return date.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
		});
	};

	return (
		<FixedView className='flex-1 bg-bg-darker'>
			<TabHeader showCoachIcon={false} />
			<ScrollView
				className='flex-1'
				contentContainerClassName='p-5'
				showsVerticalScrollIndicator={false}
				refreshControl={
					<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor='#F9C513' />
				}
			>
				<View className='mb-6'>
					<Text className='text-3xl font-bold text-text-primary'>
						Dashboard
					</Text>
					<Text className='text-text-secondary mt-1'>
						Welcome back, Coach {user?.firstName}!
					</Text>
				</View>

				{/* Quick Stats */}
				<View className='flex-row gap-3 mb-6'>
					<View className='flex-1 bg-bg-primary rounded-xl p-4 border border-[#F9C513]/20'>
						<View className='flex-row items-center mb-2'>
							<Ionicons name='calendar' size={18} color='#F9C513' />
							<Text className='text-text-secondary text-xs ml-2'>Upcoming</Text>
						</View>
						<Text className='text-3xl font-bold text-[#F9C513]'>
							{upcomingSessions.length}
						</Text>
					</View>
					<View className='flex-1 bg-bg-primary rounded-xl p-4 border border-[#F9C513]/20'>
						<View className='flex-row items-center mb-2'>
							<Ionicons name='people' size={18} color='#F9C513' />
							<Text className='text-text-secondary text-xs ml-2'>Clients</Text>
						</View>
						<Text className='text-3xl font-bold text-[#F9C513]'>
							{clients.length}
						</Text>
					</View>
				</View>

				{/* Coach Performance Insights */}
				<View className='bg-bg-primary rounded-xl p-5 mb-6 border border-[#F9C513]/20'>
					<View className='flex-row items-center mb-4'>
						<View className='bg-[#F9C513]/20 rounded-lg p-2 mr-3'>
							<Ionicons name='stats-chart' size={24} color='#F9C513' />
						</View>
						<Text className='text-xl font-semibold text-text-primary'>
							Performance Insights
						</Text>
					</View>

					<View className='gap-4'>
						<View className='flex-row items-center justify-between pb-3 border-b border-bg-darker/50'>
							<View className='flex-row items-center flex-1'>
								<Ionicons
									name='checkmark-circle'
									size={18}
									color='#8E8E93'
									style={{ marginRight: 8 }}
								/>
								<Text className='text-text-secondary text-sm'>
									Sessions This Month
								</Text>
							</View>
							<Text className='text-text-primary font-semibold'>
								{sessionsThisMonth}
							</Text>
						</View>

						<View className='flex-row items-center justify-between pb-3 border-b border-bg-darker/50'>
							<View className='flex-row items-center flex-1'>
								<Ionicons
									name='trophy'
									size={18}
									color='#8E8E93'
									style={{ marginRight: 8 }}
								/>
								<Text className='text-text-secondary text-sm'>
									Completed This Month
								</Text>
							</View>
							<Text className='text-text-primary font-semibold'>
								{completedThisMonth}
							</Text>
						</View>

						{user?.coachDetails?.ratings && (
							<View className='flex-row items-center justify-between pb-3 border-b border-bg-darker/50'>
								<View className='flex-row items-center flex-1'>
									<Ionicons
										name='star'
										size={18}
										color='#8E8E93'
										style={{ marginRight: 8 }}
									/>
									<Text className='text-text-secondary text-sm'>
										Average Rating
									</Text>
								</View>
								<View className='flex-row items-center'>
									<Text className='text-text-primary font-semibold mr-2'>
										{user.coachDetails.ratings.toFixed(1)}
									</Text>
									<Ionicons name='star' size={16} color='#F9C513' />
								</View>
							</View>
						)}

						<View className='flex-row items-center justify-between'>
							<View className='flex-row items-center flex-1'>
								<Ionicons
									name='people-circle'
									size={18}
									color='#8E8E93'
									style={{ marginRight: 8 }}
								/>
								<Text className='text-text-secondary text-sm'>
									Client Capacity
								</Text>
							</View>
							<View className='flex-row items-center'>
								<Text className='text-text-primary font-semibold mr-2'>
									{clientCapacity.current}
									{clientCapacity.limit > 0 ? ` / ${clientCapacity.limit}` : ''}
								</Text>
								{clientCapacity.limit > 0 && (
									<View className='w-fit bg-bg-darker rounded-full h-2'>
										<View
											className={`h-2 rounded-full ${
												clientCapacity.percentage >= 90
													? 'bg-red-500'
													: clientCapacity.percentage >= 70
														? 'bg-yellow-500'
														: 'bg-green-500'
											}`}
											style={{
												width: `${Math.min(100, clientCapacity.percentage)}%`,
											}}
										/>
									</View>
								)}
							</View>
						</View>
					</View>
				</View>

				{/* Specializations */}
				{user?.coachDetails?.specialization &&
					user.coachDetails.specialization.length > 0 && (
						<View className='bg-bg-primary rounded-xl p-5 mb-6 border border-[#F9C513]/20'>
							<View className='flex-row items-center mb-4'>
								<View className='bg-[#F9C513]/20 rounded-lg p-2 mr-3'>
									<Ionicons name='fitness' size={24} color='#F9C513' />
								</View>
								<Text className='text-xl font-semibold text-text-primary'>
									Specializations
								</Text>
							</View>
							<View className='flex-row flex-wrap gap-2'>
								{user.coachDetails.specialization.map(
									(spec: string, index: number) => (
										<View
											key={index}
											className='bg-[#F9C513]/10 px-3 py-2 rounded-full border border-[#F9C513]/30'
										>
											<Text className='text-[#F9C513] text-sm font-medium'>
												{spec}
											</Text>
										</View>
									)
								)}
							</View>
						</View>
					)}

				{/* Pending Requests */}
				{pendingRequests.length > 0 && (
					<View className='mb-6'>
						<View className='flex-row justify-between items-center mb-4'>
							<View className='flex-row items-center'>
								<View className='bg-[#F9C513]/20 rounded-lg p-2 mr-2'>
									<Ionicons name='mail' size={24} color='#F9C513' />
								</View>
								<Text className='text-xl font-semibold text-text-primary'>
									Pending Requests
								</Text>
							</View>
							<View className='bg-red-500/20 px-3 py-1 rounded-full border border-red-500/30'>
								<Text className='text-red-400 text-xs font-semibold'>
									{pendingRequests.length} NEW
								</Text>
							</View>
						</View>
						<TouchableOpacity
							onPress={() => router.push('/(coach)/requests')}
							className='bg-bg-primary rounded-xl p-4 border border-[#F9C513]/20'
						>
							<Text className='text-text-primary font-semibold mb-1'>
								You have {pendingRequests.length} pending client request
								{pendingRequests.length !== 1 ? 's' : ''}
							</Text>
							<Text className='text-[#F9C513] text-sm font-medium'>
								Tap to review →
							</Text>
						</TouchableOpacity>
					</View>
				)}

				{/* Upcoming Sessions */}
				<View className='mb-6'>
					<View className='flex-row justify-between items-center mb-4'>
						<View className='flex-row items-center'>
							<View className='bg-[#F9C513]/20 rounded-lg p-2 mr-2'>
								<Ionicons name='calendar' size={24} color='#F9C513' />
							</View>
							<Text className='text-xl font-semibold text-text-primary'>
								Upcoming Sessions
							</Text>
						</View>
						<TouchableOpacity onPress={() => router.push('/(coach)/schedule')}>
							<Text className='text-[#F9C513] font-semibold'>View All</Text>
						</TouchableOpacity>
					</View>

					{sessionsLoading ? (
						<View className='items-center justify-center py-10 bg-bg-primary rounded-xl border border-[#F9C513]/20'>
							<Text className='text-text-secondary'>Loading...</Text>
						</View>
					) : upcomingSessions.length === 0 ? (
						<View className='bg-bg-primary rounded-xl p-6 items-center border border-[#F9C513]/20'>
							<Ionicons name='calendar-outline' size={48} color='#8E8E93' />
							<Text className='text-text-secondary mt-4 text-center'>
								No upcoming sessions
							</Text>
						</View>
					) : (
						<FlatList
							data={upcomingSessions.slice(0, 3)}
							keyExtractor={(item) => item.id}
							scrollEnabled={false}
							renderItem={({ item }) => (
								<View className='bg-bg-primary rounded-xl p-4 mb-3 flex-row border border-[#F9C513]/20'>
									<View className='bg-bg-darker rounded-lg p-3 mr-3 items-center justify-center min-w-[80] border border-[#F9C513]/10'>
										<Text className='text-[#F9C513] font-bold text-lg'>
											{formatTimeTo12Hour(item.startTime)}
										</Text>
										<Text className='text-text-secondary text-xs mt-1'>
											{formatDate(item.date)}
										</Text>
									</View>
									<View className='flex-1'>
										<Text className='text-text-primary font-semibold text-base mb-1'>
											{item.name}
										</Text>
										<View className='flex-row items-center mb-1'>
											<Ionicons name='location' size={14} color='#8E8E93' />
											<Text className='text-text-secondary text-sm ml-1'>
												{item.gymArea}
											</Text>
										</View>
										<View className='flex-row items-center'>
											<Ionicons name='people' size={14} color='#8E8E93' />
											<Text className='text-text-secondary text-sm ml-1'>
												{String(item.clients?.length || 0)} client
												{item.clients?.length !== 1 ? 's' : ''}
											</Text>
										</View>
									</View>
								</View>
							)}
						/>
					)}
				</View>

				{/* Quick Actions */}
				<View className='mb-6'>
					<Text className='text-xl font-semibold text-text-primary mb-4'>
						Quick Actions
					</Text>
					<View className='flex-row gap-3 flex-wrap'>
						<TouchableOpacity
							onPress={() => router.push('/(coach)/schedule')}
							className='flex-1 min-w-[45%] bg-bg-primary rounded-xl p-4 items-center border border-[#F9C513]/20'
						>
							<Ionicons name='calendar' size={32} color='#F9C513' />
							<Text className='text-text-primary font-semibold mt-2'>
								Schedule
							</Text>
						</TouchableOpacity>
						<TouchableOpacity
							onPress={() => router.push('/(coach)/progress')}
							className='flex-1 min-w-[45%] bg-bg-primary rounded-xl p-4 items-center border border-[#F9C513]/20'
						>
							<Ionicons name='trending-up' size={32} color='#F9C513' />
							<Text className='text-text-primary font-semibold mt-2'>
								Progress
							</Text>
						</TouchableOpacity>
					</View>
				</View>
			</ScrollView>
		</FixedView>
	);
};

export default CoachDashboard;
