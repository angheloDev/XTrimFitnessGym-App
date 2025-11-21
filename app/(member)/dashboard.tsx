import FixedView from '@/components/FixedView';
import { useAuth } from '@/contexts/AuthContext';
import { GET_UPCOMING_SESSIONS_QUERY } from '@/graphql/queries';
import { useQuery } from '@apollo/client/react';
import React from 'react';
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

	const sessions = sessionsData?.getUpcomingSessions || [];

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

	const handleLogout = async () => {
		await logout();
		router.replace('/(auth)/login');
	};

	return (
		<FixedView className='flex-1 bg-bg-darker'>
			<ScrollView
				className='flex-1'
				contentContainerClassName='p-5'
				showsVerticalScrollIndicator={false}
			>
				<View className='flex-row justify-between items-center mb-6'>
					<View>
						<Text className='text-3xl font-bold text-text-primary'>
							Dashboard
						</Text>
						<Text className='text-text-secondary mt-1'>
							Welcome back, {user?.firstName}!
						</Text>
					</View>
					<TouchableOpacity
						onPress={handleLogout}
						className='p-2'
					>
						<Ionicons name='log-out-outline' size={28} color='#FF3B30' />
					</TouchableOpacity>
				</View>

				{/* Quick Stats */}
				<View className='flex-row gap-3 mb-6'>
					<View className='flex-1 bg-bg-primary rounded-xl p-4'>
						<Text className='text-text-secondary text-sm mb-1'>
							Upcoming Sessions
						</Text>
						<Text className='text-3xl font-bold text-[#F9C513]'>
							{sessions.length}
						</Text>
					</View>
					<View className='flex-1 bg-bg-primary rounded-xl p-4'>
						<Text className='text-text-secondary text-sm mb-1'>
							This Week
						</Text>
						<Text className='text-3xl font-bold text-[#F9C513]'>
							{sessions.filter((s: any) => {
								const sessionDate = new Date(s.date);
								const today = new Date();
								const weekEnd = new Date(today);
								weekEnd.setDate(weekEnd.getDate() + 7);
								return sessionDate >= today && sessionDate <= weekEnd;
							}).length}
						</Text>
					</View>
				</View>

				{/* Upcoming Sessions */}
				<View className='mb-6'>
					<View className='flex-row justify-between items-center mb-4'>
						<View className='flex-row items-center'>
							<View className='bg-[#F9C513]/20 rounded-lg p-2 mr-2'>
								<Ionicons name='checkmark-circle' size={24} color='#F9C513' />
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
						<View className='items-center justify-center py-10'>
							<Text className='text-text-secondary'>Loading...</Text>
						</View>
					) : sessions.length === 0 ? (
						<View className='bg-bg-primary rounded-xl p-6 items-center'>
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
								<View className='bg-bg-primary rounded-xl p-4 mb-3 flex-row'>
									<View className='bg-bg-darker rounded-lg p-3 mr-3 items-center justify-center min-w-[80]'>
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
							className='flex-1 bg-bg-primary rounded-xl p-4 items-center'
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
							className='flex-1 bg-bg-primary rounded-xl p-4 items-center'
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
