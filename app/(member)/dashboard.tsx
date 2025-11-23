import FixedView from '@/components/FixedView';
import TabHeader from '@/components/TabHeader';
import { useAuth } from '@/contexts/AuthContext';
import {
	GET_UPCOMING_SESSIONS_QUERY,
	GET_GOALS_QUERY,
	GET_CLIENT_SESSIONS_QUERY,
	GET_CURRENT_MEMBERSHIP_QUERY,
} from '@/graphql/queries';
import { useQuery } from '@apollo/client/react';
import React, { useMemo } from 'react';
import {
	ScrollView,
	Text,
	View,
	FlatList,
	TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const MemberDashboard = () => {
	const { user, logout } = useAuth();
	const router = useRouter();

	const { data: sessionsData, loading } = useQuery(
		GET_UPCOMING_SESSIONS_QUERY,
		{
			fetchPolicy: 'cache-and-network',
		}
	);

	const { data: goalsData } = useQuery(GET_GOALS_QUERY, {
		variables: { clientId: user?.id || '', status: 'active' },
		skip: !user?.id,
		fetchPolicy: 'cache-and-network',
	});

	const { data: allSessionsData } = useQuery(GET_CLIENT_SESSIONS_QUERY, {
		variables: { clientId: user?.id || '' },
		skip: !user?.id,
		fetchPolicy: 'cache-and-network',
	});

	const { data: membershipData } = useQuery(GET_CURRENT_MEMBERSHIP_QUERY, {
		fetchPolicy: 'cache-and-network',
	});

	const sessions = sessionsData?.getUpcomingSessions || [];
	const activeGoals = goalsData?.getGoals || [];
	const allSessions = allSessionsData?.getClientSessions || [];
	const currentMembership = membershipData?.getCurrentMembership;

	// Calculate completed sessions this month
	const completedThisMonth = useMemo(() => {
		const now = new Date();
		const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
		return allSessions.filter((s: any) => {
			const sessionDate = new Date(s.date);
			return (
				sessionDate >= startOfMonth &&
				sessionDate <= now &&
				s.status === 'completed'
			);
		}).length;
	}, [allSessions]);

	// Parse workout time
	const workoutTime = useMemo(() => {
		const timeStr = user?.membershipDetails?.workOutTime?.[0];
		if (timeStr && timeStr.includes('-') && !timeStr.includes(' ')) {
			const [start, end] = timeStr.split('-');
			const startHour = parseInt(start);
			const endHour = parseInt(end);
			const formatHour = (hour: number) => {
				const period = hour >= 12 ? 'PM' : 'AM';
				const displayHour = hour % 12 || 12;
				return `${displayHour}:00 ${period}`;
			};
			return `${formatHour(startHour)} - ${formatHour(endHour)}`;
		}
		return 'Not set';
	}, [user?.membershipDetails?.workOutTime]);

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
			<TabHeader showCoachIcon={true} />
			<ScrollView
				className='flex-1'
				contentContainerClassName='p-5'
				showsVerticalScrollIndicator={false}
			>
				<View className='mb-6'>
					<Text className='text-3xl font-bold text-text-primary'>
						Dashboard
					</Text>
					<Text className='text-text-secondary mt-1'>
						Welcome back, {user?.firstName}!
					</Text>
				</View>

				{/* Quick Stats */}
				<View className='flex-row gap-3 mb-6'>
					<View className='flex-1 bg-bg-primary rounded-xl p-4 border border-[#F9C513]/20'>
						<View className='flex-row items-center mb-2'>
							<Ionicons name='calendar' size={18} color='#F9C513' />
							<Text className='text-text-secondary text-xs ml-2'>
								Upcoming Sessions
							</Text>
						</View>
						<Text className='text-3xl font-bold text-[#F9C513]'>
							{sessions.length}
						</Text>
					</View>
					<View className='flex-1 bg-bg-primary rounded-xl p-4 border border-[#F9C513]/20'>
						<View className='flex-row items-center mb-2'>
							<Ionicons name='checkmark-circle' size={18} color='#F9C513' />
							<Text className='text-text-secondary text-xs ml-2'>
								This Month
							</Text>
						</View>
						<Text className='text-3xl font-bold text-[#F9C513]'>
							{completedThisMonth}
						</Text>
					</View>
				</View>

				{/* Fitness Insights */}
				<View className='bg-bg-primary rounded-xl p-5 mb-6 border border-[#F9C513]/20'>
					<View className='flex-row items-center mb-4'>
						<View className='bg-[#F9C513]/20 rounded-lg p-2 mr-3'>
							<Ionicons name='fitness' size={24} color='#F9C513' />
						</View>
						<Text className='text-xl font-semibold text-text-primary'>
							Your Fitness Profile
						</Text>
					</View>

					<View className='gap-4'>
						{user?.membershipDetails?.physiqueGoalType && (
							<View className='flex-row items-center justify-between pb-3 border-b border-bg-darker/50'>
								<View className='flex-row items-center flex-1'>
									<Ionicons
										name='body'
										size={18}
										color='#8E8E93'
										style={{ marginRight: 8 }}
									/>
									<Text className='text-text-secondary text-sm'>
										Physique Type
									</Text>
								</View>
								<Text className='text-text-primary font-semibold'>
									{user.membershipDetails.physiqueGoalType}
								</Text>
							</View>
						)}

						{user?.membershipDetails?.fitnessGoal &&
							user.membershipDetails.fitnessGoal.length > 0 && (
								<View className='pb-3 border-b border-bg-darker/50'>
									<View className='flex-row items-center mb-2'>
										<Ionicons
											name='flag'
											size={18}
											color='#8E8E93'
											style={{ marginRight: 8 }}
										/>
										<Text className='text-text-secondary text-sm'>
											Fitness Goals
										</Text>
									</View>
									<View className='flex-row flex-wrap gap-2 mt-2'>
										{user.membershipDetails.fitnessGoal.map(
											(goal: string, index: number) => (
												<View
													key={index}
													className='bg-[#F9C513]/10 px-3 py-1 rounded-full border border-[#F9C513]/30'
												>
													<Text className='text-[#F9C513] text-xs font-medium'>
														{goal}
													</Text>
												</View>
											)
										)}
									</View>
								</View>
							)}

						<View className='flex-row items-center justify-between'>
							<View className='flex-row items-center flex-1'>
								<Ionicons
									name='time'
									size={18}
									color='#8E8E93'
									style={{ marginRight: 8 }}
								/>
								<Text className='text-text-secondary text-sm'>
									Preferred Workout Time
								</Text>
							</View>
							<Text className='text-text-primary font-semibold'>
								{workoutTime}
							</Text>
						</View>
					</View>
				</View>

				{/* Active Goals */}
				{activeGoals.length > 0 && (
					<View className='mb-6'>
						<View className='flex-row justify-between items-center mb-4'>
							<View className='flex-row items-center'>
								<View className='bg-[#F9C513]/20 rounded-lg p-2 mr-2'>
									<Ionicons name='trophy' size={24} color='#F9C513' />
								</View>
								<Text className='text-xl font-semibold text-text-primary'>
									Active Goals
								</Text>
							</View>
							<TouchableOpacity
								onPress={() => router.push('/(member)/progress')}
							>
								<Text className='text-[#F9C513] font-semibold'>View All</Text>
							</TouchableOpacity>
						</View>

						<View className='bg-bg-primary rounded-xl p-4 border border-[#F9C513]/20'>
							<FlatList
								data={activeGoals.slice(0, 2)}
								keyExtractor={(item) => item.id}
								scrollEnabled={false}
								renderItem={({ item }) => (
									<View className='mb-3 pb-3 border-b border-bg-darker/50 last:border-0 last:pb-0 last:mb-0'>
										<Text className='text-text-primary font-semibold mb-1'>
											{item.title}
										</Text>
										{item.targetWeight && item.currentWeight && (
											<View className='flex-row items-center mt-2'>
												<View className='flex-1 bg-bg-darker rounded-full h-2 mr-2'>
													<View
														className='bg-[#F9C513] h-2 rounded-full'
														style={{
															width: `${Math.min(100, Math.max(0, (item.currentWeight / item.targetWeight) * 100))}%`,
														}}
													/>
												</View>
												<Text className='text-text-secondary text-xs'>
													{item.currentWeight} / {item.targetWeight} kg
												</Text>
											</View>
										)}
									</View>
								)}
							/>
						</View>
					</View>
				)}

				{/* Membership Status */}
				{currentMembership && (
					<View className='bg-bg-primary rounded-xl p-5 mb-6 border border-[#F9C513]/20'>
						<View className='flex-row items-center justify-between mb-3'>
							<View className='flex-row items-center'>
								<View className='bg-[#F9C513]/20 rounded-lg p-2 mr-3'>
									<Ionicons name='card' size={24} color='#F9C513' />
								</View>
								<Text className='text-xl font-semibold text-text-primary'>
									Membership
								</Text>
							</View>
							<View
								className={`px-3 py-1 rounded-full ${
									currentMembership.status === 'active'
										? 'bg-green-500/20 border border-green-500/30'
										: 'bg-red-500/20 border border-red-500/30'
								}`}
							>
								<Text
									className={`text-xs font-semibold ${
										currentMembership.status === 'active'
											? 'text-green-400'
											: 'text-red-400'
									}`}
								>
									{currentMembership.status.toUpperCase()}
								</Text>
							</View>
						</View>
						<Text className='text-text-primary font-semibold mb-1'>
							{currentMembership.membership?.name}
						</Text>
						{currentMembership.expiresAt && (
							<Text className='text-text-secondary text-sm'>
								Expires:{' '}
								{new Date(currentMembership.expiresAt).toLocaleDateString()}
							</Text>
						)}
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
						<TouchableOpacity
							onPress={() => router.push('/(member)/schedule')}
						>
							<Text className='text-[#F9C513] font-semibold'>View All</Text>
						</TouchableOpacity>
					</View>

					{loading ? (
						<View className='items-center justify-center py-10 bg-bg-primary rounded-xl border border-[#F9C513]/20'>
							<Text className='text-text-secondary'>Loading...</Text>
						</View>
					) : sessions.length === 0 ? (
						<View className='bg-bg-primary rounded-xl p-6 items-center border border-[#F9C513]/20'>
							<Ionicons
								name='calendar-outline'
								size={48}
								color='#8E8E93'
							/>
							<Text className='text-text-secondary mt-4 text-center'>
								No upcoming sessions
							</Text>
						</View>
					) : (
						<FlatList
							data={sessions.slice(0, 3)}
							keyExtractor={(item) => item.id}
							scrollEnabled={false}
							renderItem={({ item }) => (
								<View className='bg-bg-primary rounded-xl p-4 mb-3 flex-row border border-[#F9C513]/20'>
									<View className='bg-bg-darker rounded-lg p-3 mr-3 items-center justify-center min-w-[80] border border-[#F9C513]/10'>
										<Text className='text-[#F9C513] font-bold text-lg'>
											{item.startTime}
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
											<Ionicons
												name='location'
												size={14}
												color='#8E8E93'
											/>
											<Text className='text-text-secondary text-sm ml-1'>
												{item.gymArea}
											</Text>
										</View>
										<View className='flex-row items-center'>
											<Ionicons
												name='person'
												size={14}
												color='#8E8E93'
											/>
											<Text className='text-text-secondary text-sm ml-1'>
												With Coach {item.coach?.firstName || ''}{' '}
												{item.coach?.lastName || ''}
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
					<View className='flex-row gap-3'>
						<TouchableOpacity
							onPress={() => router.push('/(member)/progress')}
							className='flex-1 bg-bg-primary rounded-xl p-4 items-center border border-[#F9C513]/20'
						>
							<Ionicons
								name='trending-up'
								size={32}
								color='#F9C513'
							/>
							<Text className='text-text-primary font-semibold mt-2'>
								Progress
							</Text>
						</TouchableOpacity>
						<TouchableOpacity
							onPress={() => router.push('/(member)/subscription')}
							className='flex-1 bg-bg-primary rounded-xl p-4 items-center border border-[#F9C513]/20'
						>
							<Ionicons name='card' size={32} color='#F9C513' />
							<Text className='text-text-primary font-semibold mt-2'>
								Subscription
							</Text>
						</TouchableOpacity>
					</View>
				</View>
			</ScrollView>
		</FixedView>
	);
};

export default MemberDashboard;
