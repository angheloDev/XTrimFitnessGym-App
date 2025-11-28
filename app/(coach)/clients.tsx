import FixedView from '@/components/FixedView';
import Input from '@/components/Input';
import TabHeader from '@/components/TabHeader';
import { useAuth } from '@/contexts/AuthContext';
import {
	GetUsersQuery,
	GetUsersQueryVariables,
} from '@/graphql/generated/types';
import { GET_USERS_QUERY } from '@/graphql/queries';
import { useQuery } from '@apollo/client/react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
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

const CoachClients = () => {
	const { user } = useAuth();
	const router = useRouter();
	const [refreshing, setRefreshing] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedClient, setSelectedClient] = useState<any>(null);
	const [showProfileModal, setShowProfileModal] = useState(false);

	const { data: clientsData, loading, refetch: refetchClients } = useQuery<
		GetUsersQuery,
		GetUsersQueryVariables
	>(GET_USERS_QUERY, {
		variables: { role: 'member' },
		fetchPolicy: 'cache-and-network',
	});

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
	const allClients = useMemo(() => {
		if (!clientsData?.getUsers || !user?.coachDetails?.clientsIds) {
			return [];
		}
		const coachClientIds = user.coachDetails.clientsIds;
		return clientsData.getUsers.filter((client: any) =>
			coachClientIds.includes(client.id)
		);
	}, [clientsData, user]);

	// Filter clients by search query
	const filteredClients = useMemo(() => {
		if (!searchQuery.trim()) return allClients;
		const query = searchQuery.toLowerCase();
		return allClients.filter(
			(client: any) =>
				client.firstName.toLowerCase().includes(query) ||
				client.lastName.toLowerCase().includes(query) ||
				client.email.toLowerCase().includes(query)
		);
	}, [allClients, searchQuery]);

	const handleClientPress = (client: any) => {
		setSelectedClient(client);
		setShowProfileModal(true);
	};

	const renderClientCard = ({ item }: { item: any }) => (
		<TouchableOpacity
			onPress={() => handleClientPress(item)}
			className='bg-bg-primary rounded-xl p-4 mb-3 border border-[#F9C513]/20'
		>
			<View className='flex-row'>
				<View className='bg-[#F9C513] rounded-full w-16 h-16 items-center justify-center mr-4 border-2 border-bg-darker/30'>
					<Text className='text-bg-darker font-bold text-xl'>
						{item.firstName.charAt(0)}
						{item.lastName.charAt(0)}
					</Text>
				</View>
				<View className='flex-1'>
					<View className='flex-row items-center justify-between mb-1'>
						<Text className='text-text-primary font-semibold text-lg'>
							{item.firstName} {item.lastName}
						</Text>
					</View>
					<View className='flex-row items-center mb-2'>
						<Ionicons name='mail' size={14} color='#8E8E93' />
						<Text
							className='text-text-secondary text-sm ml-1'
							numberOfLines={1}
						>
							{item.email}
						</Text>
					</View>
					{item.membershipDetails?.fitnessGoal &&
						item.membershipDetails.fitnessGoal.length > 0 && (
							<View className='flex-row flex-wrap mt-1'>
								{item.membershipDetails.fitnessGoal
									.slice(0, 2)
									.map((goal: string, index: number) => (
										<View
											key={index}
											className='bg-bg-darker px-2 py-1 rounded mr-2 mb-1 border border-[#F9C513]/30'
										>
											<Text className='text-text-secondary text-xs'>
												{goal}
											</Text>
										</View>
									))}
							</View>
						)}
				</View>
			</View>
		</TouchableOpacity>
	);

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
				<View className='flex-row items-center justify-between mb-6'>
					<View>
						<Text className='text-3xl font-bold text-text-primary'>
							My Clients
						</Text>
						<Text className='text-text-secondary mt-1'>
							Manage your client relationships
						</Text>
					</View>
				</View>

				{/* Search Bar */}
				<View className='mb-6'>
					<Input
						placeholder='Search clients by name or email...'
						value={searchQuery}
						onChangeText={setSearchQuery}
						className='bg-bg-primary border border-[#F9C513]/20'
					/>
				</View>

				{/* Client Stats */}
				<View className='flex-row gap-3 mb-6'>
					<View className='flex-1 bg-bg-primary rounded-xl p-4 border border-[#F9C513]/20'>
						<View className='flex-row items-center mb-2'>
							<Ionicons name='people' size={18} color='#F9C513' />
							<Text className='text-text-secondary text-xs ml-2'>Total</Text>
						</View>
						<Text className='text-3xl font-bold text-[#F9C513]'>
							{allClients.length}
						</Text>
					</View>
					<View className='flex-1 bg-bg-primary rounded-xl p-4 border border-[#F9C513]/20'>
						<View className='flex-row items-center mb-2'>
							<Ionicons name='search' size={18} color='#F9C513' />
							<Text className='text-text-secondary text-xs ml-2'>Showing</Text>
						</View>
						<Text className='text-3xl font-bold text-[#F9C513]'>
							{filteredClients.length}
						</Text>
					</View>
				</View>

				{loading ? (
					<View className='items-center justify-center py-20 bg-bg-primary rounded-xl border border-[#F9C513]/20'>
						<Text className='text-text-secondary'>Loading clients...</Text>
					</View>
				) : filteredClients.length === 0 ? (
					<View className='bg-bg-primary rounded-xl p-6 items-center border border-[#F9C513]/20'>
						<Ionicons name='people-outline' size={48} color='#8E8E93' />
						<Text className='text-text-secondary mt-4 text-center'>
							{allClients.length === 0
								? 'No clients yet'
								: 'No clients found matching your search'}
						</Text>
					</View>
				) : (
					<FlatList
						data={filteredClients}
						keyExtractor={(item) => item?.id || ''}
						renderItem={renderClientCard}
						scrollEnabled={false}
					/>
				)}
			</ScrollView>

			{/* Client Profile Modal */}
			<Modal
				visible={showProfileModal}
				animationType='slide'
				transparent={false}
				onRequestClose={() => {
					setShowProfileModal(false);
					setSelectedClient(null);
				}}
			>
				<View className='flex-1 bg-bg-darker justify-end'>
					<View className='bg-bg-primary rounded-t-3xl p-6 max-h-[90%] border-t-2 border-[#F9C513]/30'>
						<ScrollView showsVerticalScrollIndicator={false}>
							<View className='flex-row justify-between items-center mb-6 pb-4 border-b border-bg-darker/30'>
								<Text className='text-2xl font-bold text-text-primary'>
									Client Profile
								</Text>
								<TouchableOpacity
									onPress={() => {
										setShowProfileModal(false);
										setSelectedClient(null);
									}}
									className='p-2 rounded-full border border-bg-darker/30'
								>
									<Ionicons name='close' size={28} color='#8E8E93' />
								</TouchableOpacity>
							</View>

							{selectedClient && (
								<>
									<View className='items-center mb-6 pb-6 border-b border-bg-darker/30'>
										<View className='bg-[#F9C513] rounded-full w-24 h-24 items-center justify-center mb-4 border-2 border-bg-darker/30'>
											<Text className='text-bg-darker font-bold text-3xl'>
												{selectedClient.firstName.charAt(0)}
												{selectedClient.lastName.charAt(0)}
											</Text>
										</View>
										<Text className='text-2xl font-bold text-text-primary mb-1'>
											{selectedClient.firstName} {selectedClient.lastName}
										</Text>
										<View className='flex-row items-center mt-2'>
											<Ionicons name='mail' size={16} color='#8E8E93' />
											<Text className='text-text-secondary ml-1'>
												{selectedClient.email}
											</Text>
										</View>
									</View>

									{selectedClient.phoneNumber && (
										<View className='mb-6 pb-6 border-b border-bg-darker/30'>
											<Text className='text-text-primary font-semibold mb-2 text-lg'>
												Contact
											</Text>
											<View className='flex-row items-center'>
												<Ionicons name='call' size={16} color='#8E8E93' />
												<Text className='text-text-secondary ml-2'>
													{selectedClient.phoneNumber}
												</Text>
											</View>
										</View>
									)}

									{selectedClient.membershipDetails?.physiqueGoalType && (
										<View className='mb-6 pb-6 border-b border-bg-darker/30'>
											<Text className='text-text-primary font-semibold mb-2 text-lg'>
												Physique Goal
											</Text>
											<View className='bg-bg-darker px-3 py-2 rounded-lg border border-[#F9C513]/30'>
												<Text className='text-text-primary'>
													{selectedClient.membershipDetails.physiqueGoalType}
												</Text>
											</View>
										</View>
									)}

									{selectedClient.membershipDetails?.fitnessGoal &&
										selectedClient.membershipDetails.fitnessGoal.length > 0 && (
											<View className='mb-6 pb-6 border-b border-bg-darker/30'>
												<Text className='text-text-primary font-semibold mb-3 text-lg'>
													Fitness Goals
												</Text>
												<View className='flex-row flex-wrap'>
													{selectedClient.membershipDetails.fitnessGoal.map(
														(goal: string, index: number) => (
															<View
																key={index}
																className='bg-bg-darker px-3 py-2 rounded-lg mr-2 mb-2 border border-[#F9C513]/30'
															>
																<Text className='text-text-primary'>
																	{goal}
																</Text>
															</View>
														)
													)}
												</View>
											</View>
										)}

									{selectedClient.membershipDetails?.workOutTime &&
										selectedClient.membershipDetails.workOutTime.length > 0 && (
											<View className='mb-6 pb-6 border-b border-bg-darker/30'>
												<Text className='text-text-primary font-semibold mb-2 text-lg'>
													Preferred Workout Time
												</Text>
												<View className='bg-bg-darker px-3 py-2 rounded-lg border border-[#F9C513]/30'>
													<Text className='text-text-primary'>
														{selectedClient.membershipDetails.workOutTime[0]}
													</Text>
												</View>
											</View>
										)}

									<View className='mt-4'>
										<TouchableOpacity
											onPress={() => {
												setShowProfileModal(false);
												router.push({
													pathname: '/(coach)/progress',
													params: { clientId: selectedClient.id },
												});
											}}
											className='bg-[#F9C513] rounded-xl p-4 items-center border-2 border-bg-darker/30'
										>
											<View className='flex-row items-center'>
												<Ionicons
													name='trending-up'
													size={20}
													color='#1C1C1E'
												/>
												<Text className='text-bg-darker font-semibold text-lg ml-2'>
													View Progress
												</Text>
											</View>
										</TouchableOpacity>
									</View>
								</>
							)}
						</ScrollView>
					</View>
				</View>
			</Modal>
		</FixedView>
	);
};

export default CoachClients;
