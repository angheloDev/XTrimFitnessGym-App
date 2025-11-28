import FixedView from '@/components/FixedView';
import TabHeader from '@/components/TabHeader';
import { useAuth } from '@/contexts/AuthContext';
import {
	GetUsersQuery,
	GetUsersQueryVariables,
	GetWeightProgressChartQuery,
	GetWeightProgressChartQueryVariables,
} from '@/graphql/generated/types';
import {
	GET_USERS_QUERY,
	GET_WEIGHT_PROGRESS_CHART_QUERY,
} from '@/graphql/queries';
import { useQuery } from '@apollo/client/react';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState, useEffect } from 'react';
import {
	FlatList,
	Modal,
	RefreshControl,
	ScrollView,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';

const CoachProgress = () => {
	const [selectedClient, setSelectedClient] = useState<any>(null);
	const [showClientProgress, setShowClientProgress] = useState(false);
	const [refreshing, setRefreshing] = useState(false);

	const { user } = useAuth();
	const { data: clientsData, refetch: refetchClients } = useQuery<GetUsersQuery, GetUsersQueryVariables>(
		GET_USERS_QUERY,
		{
			variables: { role: 'member' },
			fetchPolicy: 'cache-and-network',
		}
	);

	// Refetch data when screen is mounted
	useEffect(() => {
		refetchClients();
	}, [refetchClients]);

	// Handle pull-to-refresh
	const onRefresh = async () => {
		setRefreshing(true);
		try {
			await refetchClients();
		} finally {
			setRefreshing(false);
		}
	};

	// Filter clients to only show coach's clients
	const clients = useMemo(() => {
		if (!clientsData?.getUsers || !user?.coachDetails?.clientsIds) {
			return [];
		}
		const coachClientIds = user.coachDetails.clientsIds;
		return clientsData.getUsers.filter((client: any) =>
			coachClientIds.includes(client.id)
		);
	}, [clientsData, user]);

	const { data: progressData } = useQuery<
		GetWeightProgressChartQuery,
		GetWeightProgressChartQueryVariables
	>(GET_WEIGHT_PROGRESS_CHART_QUERY, {
		variables: { clientId: selectedClient?.id || '' },
		skip: !selectedClient || !showClientProgress,
	});

	const progressPoints = progressData?.getWeightProgressChart || [];

	const renderWeightChart = (clientProgress: any[]) => {
		if (clientProgress.length === 0) {
			return (
				<View className='items-center justify-center py-10'>
					<Text className='text-text-secondary'>
						No weight data available yet
					</Text>
				</View>
			);
		}

		const weights = clientProgress.map((p: any) => p.weight);
		const minWeight = Math.min(...weights);
		const maxWeight = Math.max(...weights);
		const range = maxWeight - minWeight || 1;
		const chartHeight = 200;
		const chartWidth = 300;

		return (
			<View className='mt-4'>
				<View
					className='border-l-2 border-b-2 border-text-secondary'
					style={{ height: chartHeight, width: chartWidth }}
				>
					{clientProgress.map((point: any, index: number) => {
						const normalizedWeight = (point.weight - minWeight) / range;
						const y = chartHeight - normalizedWeight * chartHeight;
						const x = (index / (clientProgress.length - 1 || 1)) * chartWidth;

						return (
							<View
								key={index}
								className='absolute bg-[#F9C513] rounded-full'
								style={{
									left: x - 4,
									top: y - 4,
									width: 8,
									height: 8,
								}}
							/>
						);
					})}
				</View>
				<View className='flex-row justify-between mt-2'>
					<Text className='text-text-secondary text-xs'>
						{new Date(clientProgress[0]?.date).toLocaleDateString()}
					</Text>
					<Text className='text-text-secondary text-xs'>
						{new Date(
							clientProgress[clientProgress.length - 1]?.date
						).toLocaleDateString()}
					</Text>
				</View>
			</View>
		);
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
				<View className='flex-row justify-between items-center mb-6'>
					<View>
						<Text className='text-3xl font-bold text-text-primary'>
							Client Progress
						</Text>
						<Text className='text-text-secondary mt-1'>
							Track your clients&apos; progress
						</Text>
					</View>
					<Ionicons name='trending-up' size={32} color='#F9C513' />
				</View>

				{clients.length === 0 ? (
					<View className='bg-bg-primary rounded-xl p-6 items-center'>
						<Ionicons name='people-outline' size={48} color='#8E8E93' />
						<Text className='text-text-secondary mt-4 text-center text-base'>
							No clients yet
						</Text>
						<Text className='text-text-secondary mt-2 text-center text-sm'>
							Client progress will appear here
						</Text>
					</View>
				) : (
					<FlatList
						data={clients}
						keyExtractor={(item) => item?.id || ''}
						scrollEnabled={false}
						renderItem={({ item }) => {
							if (!item) return null;
							return (
								<TouchableOpacity
									onPress={() => {
										setSelectedClient(item);
										setShowClientProgress(true);
									}}
									className='bg-bg-primary rounded-xl p-4 mb-3'
								>
									<View className='flex-row items-center justify-between'>
										<View className='flex-1'>
											<Text className='text-text-primary font-semibold text-lg mb-1'>
												{item.firstName} {item.lastName}
											</Text>
											<Text className='text-text-secondary text-sm'>
												{item.email}
											</Text>
										</View>
										<Ionicons
											name='chevron-forward'
											size={24}
											color='#8E8E93'
										/>
									</View>
								</TouchableOpacity>
							);
						}}
					/>
				)}
			</ScrollView>

			{/* Client Progress Modal */}
			<Modal
				visible={showClientProgress}
				animationType='slide'
				transparent
				onRequestClose={() => {
					setShowClientProgress(false);
					setSelectedClient(null);
				}}
			>
				<View className='flex-1 bg-bg-darker justify-center px-5'>
					<View className='bg-bg-primary rounded-2xl p-6 max-h-[80%]'>
						<View className='flex-row justify-between items-center mb-4'>
							<Text className='text-2xl font-bold text-text-primary'>
								{selectedClient?.firstName} {selectedClient?.lastName}&apos;s
								Progress
							</Text>
							<TouchableOpacity
								onPress={() => {
									setShowClientProgress(false);
									setSelectedClient(null);
								}}
							>
								<Ionicons name='close' size={28} color='#8E8E93' />
							</TouchableOpacity>
						</View>
						<ScrollView>
							{renderWeightChart(progressPoints)}
							{progressPoints.length > 0 && (
								<View className='mt-6'>
									<Text className='text-text-primary font-semibold mb-3'>
										Recent Weight Entries
									</Text>
									{progressPoints.slice(-5).map((point: any, index: number) => (
										<View
											key={index}
											className='bg-bg-darker rounded-lg p-3 mb-2'
										>
											<View className='flex-row justify-between items-center'>
												<Text className='text-text-primary font-semibold'>
													{point.weight} kg
												</Text>
												<Text className='text-text-secondary text-sm'>
													{new Date(point.date).toLocaleDateString()}
												</Text>
											</View>
										</View>
									))}
								</View>
							)}
						</ScrollView>
					</View>
				</View>
			</Modal>
		</FixedView>
	);
};

export default CoachProgress;
