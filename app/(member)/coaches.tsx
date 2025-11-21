import FixedView from '@/components/FixedView';
import Input from '@/components/Input';
import { useAuth } from '@/contexts/AuthContext';
import { GET_USERS_QUERY } from '@/graphql/queries';
import { useQuery } from '@apollo/client/react';
import { useRouter } from 'expo-router';
import React, { useState, useMemo } from 'react';
import {
	ScrollView,
	Text,
	View,
	FlatList,
	TouchableOpacity,
	Modal,
	Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TabHeader from '@/components/TabHeader';

const MemberCoaches = () => {
	const { user } = useAuth();
	const router = useRouter();
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedCoach, setSelectedCoach] = useState<any>(null);
	const [showProfileModal, setShowProfileModal] = useState(false);

	const { data: coachesData, loading } = useQuery(GET_USERS_QUERY, {
		variables: { role: 'coach' },
		fetchPolicy: 'cache-and-network',
	});

	const coaches = coachesData?.getUsers || [];

	// Filter and sort coaches based on user's fitness goals
	const { recommendedCoaches, otherCoaches } = useMemo(() => {
		if (!coaches.length || !user?.membershipDetails?.fitnessGoal) {
			return {
				recommendedCoaches: [],
				otherCoaches: coaches,
			};
		}

		const userGoals = user.membershipDetails.fitnessGoal || [];
		const recommended: any[] = [];
		const other: any[] = [];

		coaches.forEach((coach: any) => {
			const coachSpecializations =
				coach.coachDetails?.specialization || [];
			const hasMatchingSpecialization = userGoals.some((goal: string) =>
				coachSpecializations.includes(goal)
			);

			// Check if coach is at client limit
			const currentClients =
				coach.coachDetails?.clientsIds?.length || 0;
			const clientLimit = coach.coachDetails?.clientLimit || 999; // Default to high number if no limit set
			const isAtLimit = currentClients >= clientLimit;

			const coachWithStatus = {
				...coach,
				isAtLimit,
				matchScore: hasMatchingSpecialization ? 1 : 0,
			};

			if (hasMatchingSpecialization) {
				recommended.push(coachWithStatus);
			} else {
				other.push(coachWithStatus);
			}
		});

		// Sort recommended by match score and ratings
		recommended.sort((a, b) => {
			if (a.matchScore !== b.matchScore) {
				return b.matchScore - a.matchScore;
			}
			return (b.coachDetails?.ratings || 0) - (a.coachDetails?.ratings || 0);
		});

		return { recommendedCoaches: recommended, otherCoaches: other };
	}, [coaches, user]);

	// Filter coaches by search query
	const filteredRecommended = useMemo(() => {
		if (!searchQuery.trim()) return recommendedCoaches;
		const query = searchQuery.toLowerCase();
		return recommendedCoaches.filter(
			(coach: any) =>
				coach.firstName.toLowerCase().includes(query) ||
				coach.lastName.toLowerCase().includes(query) ||
				coach.coachDetails?.specialization?.some((spec: string) =>
					spec.toLowerCase().includes(query)
				)
		);
	}, [recommendedCoaches, searchQuery]);

	const filteredOther = useMemo(() => {
		if (!searchQuery.trim()) return otherCoaches;
		const query = searchQuery.toLowerCase();
		return otherCoaches.filter(
			(coach: any) =>
				coach.firstName.toLowerCase().includes(query) ||
				coach.lastName.toLowerCase().includes(query) ||
				coach.coachDetails?.specialization?.some((spec: string) =>
					spec.toLowerCase().includes(query)
				)
		);
	}, [otherCoaches, searchQuery]);

	const handleCoachPress = (coach: any) => {
		setSelectedCoach(coach);
		setShowProfileModal(true);
	};

	const renderCoachCard = ({ item }: { item: any }) => (
		<TouchableOpacity
			onPress={() => handleCoachPress(item)}
			className='bg-bg-primary rounded-xl p-4 mb-3'
			disabled={item.isAtLimit}
		>
			<View className='flex-row'>
				<View className='bg-[#F9C513] rounded-full w-16 h-16 items-center justify-center mr-4'>
					<Text className='text-bg-darker font-bold text-xl'>
						{item.firstName.charAt(0)}
						{item.lastName.charAt(0)}
					</Text>
				</View>
				<View className='flex-1'>
					<View className='flex-row items-center justify-between mb-1'>
						<Text className='text-text-primary font-semibold text-lg'>
							Coach {item.firstName} {item.lastName}
						</Text>
						{item.isAtLimit && (
							<View className='bg-red-500/20 px-2 py-1 rounded'>
								<Text className='text-red-500 text-xs font-semibold'>
									Full
								</Text>
							</View>
						)}
					</View>
					{item.coachDetails?.specialization && (
						<View className='flex-row flex-wrap mb-2'>
							{item.coachDetails.specialization
								.slice(0, 3)
								.map((spec: string, index: number) => (
									<View
										key={index}
										className='bg-bg-darker px-2 py-1 rounded mr-2 mb-1'
									>
										<Text className='text-text-secondary text-xs'>
											{spec}
										</Text>
									</View>
								))}
						</View>
					)}
					<View className='flex-row items-center'>
						<Ionicons name='star' size={16} color='#F9C513' />
						<Text className='text-text-secondary text-sm ml-1'>
							{item.coachDetails?.ratings?.toFixed(1) || 'N/A'}
						</Text>
						{item.coachDetails?.yearsOfExperience && (
							<>
								<Text className='text-text-secondary text-sm mx-2'>•</Text>
								<Text className='text-text-secondary text-sm'>
									{item.coachDetails.yearsOfExperience} years exp.
								</Text>
							</>
						)}
					</View>
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
			>
				<View className='flex-row items-center justify-between mb-6'>
					<View>
						<Text className='text-3xl font-bold text-text-primary'>
							Find a Coach
						</Text>
						<Text className='text-text-secondary mt-1'>
							Choose the perfect coach for you
						</Text>
					</View>
				</View>

				{/* Search Bar */}
				<View className='mb-6'>
					<Input
						placeholder='Search coaches by name or specialization...'
						value={searchQuery}
						onChangeText={setSearchQuery}
						className='bg-bg-primary'
					/>
				</View>

				{loading ? (
					<View className='items-center justify-center py-20'>
						<Text className='text-text-secondary'>Loading coaches...</Text>
					</View>
				) : (
					<>
						{/* Recommended Coaches */}
						{filteredRecommended.length > 0 && (
							<View className='mb-6'>
								<Text className='text-xl font-semibold text-text-primary mb-4'>
									Recommended for You
								</Text>
								<FlatList
									data={filteredRecommended}
									keyExtractor={(item) => item.id}
									renderItem={renderCoachCard}
									scrollEnabled={false}
								/>
							</View>
						)}

						{/* All Coaches */}
						<View>
							<Text className='text-xl font-semibold text-text-primary mb-4'>
								All Coaches
							</Text>
							{filteredOther.length === 0 ? (
								<View className='bg-bg-primary rounded-xl p-6 items-center'>
									<Ionicons
										name='people-outline'
										size={48}
										color='#8E8E93'
									/>
									<Text className='text-text-secondary mt-4 text-center'>
										No coaches found
									</Text>
								</View>
							) : (
								<FlatList
									data={filteredOther}
									keyExtractor={(item) => item.id}
									renderItem={renderCoachCard}
									scrollEnabled={false}
								/>
							)}
						</View>
					</>
				)}
			</ScrollView>

			{/* Coach Profile Modal */}
			<Modal
				visible={showProfileModal}
				animationType='slide'
				transparent
				onRequestClose={() => {
					setShowProfileModal(false);
					setSelectedCoach(null);
				}}
			>
				<View className='flex-1 bg-black/50 justify-end'>
					<View className='bg-bg-primary rounded-t-3xl p-6 max-h-[90%]'>
						<ScrollView showsVerticalScrollIndicator={false}>
							<View className='flex-row justify-between items-center mb-6'>
								<Text className='text-2xl font-bold text-text-primary'>
									Coach Profile
								</Text>
								<TouchableOpacity
									onPress={() => {
										setShowProfileModal(false);
										setSelectedCoach(null);
									}}
								>
									<Ionicons name='close' size={28} color='#8E8E93' />
								</TouchableOpacity>
							</View>

							{selectedCoach && (
								<>
									<View className='items-center mb-6'>
										<View className='bg-[#F9C513] rounded-full w-24 h-24 items-center justify-center mb-4'>
											<Text className='text-bg-darker font-bold text-3xl'>
												{selectedCoach.firstName.charAt(0)}
												{selectedCoach.lastName.charAt(0)}
											</Text>
										</View>
										<Text className='text-2xl font-bold text-text-primary mb-1'>
											Coach {selectedCoach.firstName}{' '}
											{selectedCoach.lastName}
										</Text>
										<View className='flex-row items-center'>
											<Ionicons name='star' size={20} color='#F9C513' />
											<Text className='text-text-primary font-semibold ml-1 text-lg'>
												{selectedCoach.coachDetails?.ratings?.toFixed(1) ||
													'N/A'}
											</Text>
										</View>
									</View>

									{selectedCoach.coachDetails?.specialization && (
										<View className='mb-6'>
											<Text className='text-text-primary font-semibold mb-3 text-lg'>
												Specializations
											</Text>
											<View className='flex-row flex-wrap'>
												{selectedCoach.coachDetails.specialization.map(
													(spec: string, index: number) => (
														<View
															key={index}
															className='bg-bg-darker px-3 py-2 rounded-lg mr-2 mb-2'
														>
															<Text className='text-text-primary'>
																{spec}
															</Text>
														</View>
													)
												)}
											</View>
										</View>
									)}

									{selectedCoach.coachDetails?.yearsOfExperience && (
										<View className='mb-6'>
											<Text className='text-text-primary font-semibold mb-2 text-lg'>
												Experience
											</Text>
											<Text className='text-text-secondary'>
												{selectedCoach.coachDetails.yearsOfExperience} years
												of experience
											</Text>
										</View>
									)}

									{selectedCoach.coachDetails?.moreDetails && (
										<View className='mb-6'>
											<Text className='text-text-primary font-semibold mb-2 text-lg'>
												About
											</Text>
											<Text className='text-text-secondary'>
												{selectedCoach.coachDetails.moreDetails}
											</Text>
										</View>
									)}

									<View className='mb-6'>
										<Text className='text-text-primary font-semibold mb-2 text-lg'>
											Availability
										</Text>
										{selectedCoach.coachDetails?.teachingDate && (
											<Text className='text-text-secondary mb-1'>
												Days:{' '}
												{selectedCoach.coachDetails.teachingDate.join(', ')}
											</Text>
										)}
										{selectedCoach.coachDetails?.teachingTime && (
											<Text className='text-text-secondary'>
												Times:{' '}
												{selectedCoach.coachDetails.teachingTime.join(', ')}
											</Text>
										)}
									</View>

									<View className='mb-6'>
										<Text className='text-text-primary font-semibold mb-2 text-lg'>
											Client Capacity
										</Text>
										<Text className='text-text-secondary'>
											{selectedCoach.coachDetails?.clientsIds?.length || 0} /{' '}
											{selectedCoach.coachDetails?.clientLimit || 'Unlimited'}{' '}
											clients
										</Text>
										{selectedCoach.isAtLimit && (
											<Text className='text-red-500 mt-2'>
												This coach is currently at full capacity
											</Text>
										)}
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

export default MemberCoaches;
