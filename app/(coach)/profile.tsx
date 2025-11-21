import FixedView from '@/components/FixedView';
import TabHeader from '@/components/TabHeader';
import { useAuth } from '@/contexts/AuthContext';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';

const CoachProfile = () => {
	const { user } = useAuth();

	return (
		<FixedView className='flex-1 bg-bg-darker'>
			<TabHeader showCoachIcon={false} />
			<ScrollView
				className='flex-1'
				contentContainerClassName='p-5'
				showsVerticalScrollIndicator={false}
			>
				<View className='items-center mb-6'>
					<View className='bg-[#F9C513] rounded-full w-24 h-24 items-center justify-center mb-4'>
						<Text className='text-bg-darker font-bold text-3xl'>
							{user?.firstName?.charAt(0)}
							{user?.lastName?.charAt(0)}
						</Text>
					</View>
					<Text className='text-2xl font-bold text-text-primary'>
						Coach {user?.firstName} {user?.lastName}
					</Text>
					<Text className='text-text-secondary mt-1'>{user?.email}</Text>
				</View>

				<View className='bg-bg-primary rounded-xl p-5 mb-4'>
					<Text className='text-xl font-semibold text-text-primary mb-4'>
						Personal Information
					</Text>
					<View className='mb-3'>
						<Text className='text-text-secondary text-sm mb-1'>Phone</Text>
						<Text className='text-text-primary font-medium'>
							{user?.phoneNumber || 'Not provided'}
						</Text>
					</View>
					<View className='mb-3'>
						<Text className='text-text-secondary text-sm mb-1'>
							Date of Birth
						</Text>
						<Text className='text-text-primary font-medium'>
							{user?.dateOfBirth
								? new Date(user.dateOfBirth).toLocaleDateString()
								: 'Not provided'}
						</Text>
					</View>
					<View>
						<Text className='text-text-secondary text-sm mb-1'>Gender</Text>
						<Text className='text-text-primary font-medium'>
							{user?.gender || 'Not provided'}
						</Text>
					</View>
				</View>

				{user?.coachDetails && (
					<View className='bg-bg-primary rounded-xl p-5'>
						<Text className='text-xl font-semibold text-text-primary mb-4'>
							Coach Details
						</Text>
						{user.coachDetails.specialization &&
							user.coachDetails.specialization.length > 0 && (
								<View className='mb-4'>
									<Text className='text-text-secondary text-sm mb-2'>
										Specializations
									</Text>
									<View className='flex-row flex-wrap'>
										{user.coachDetails.specialization.map(
											(spec: string, index: number) => (
												<View
													key={index}
													className='bg-bg-darker px-3 py-2 rounded-lg mr-2 mb-2'
												>
													<Text className='text-text-primary'>{spec}</Text>
												</View>
											)
										)}
									</View>
								</View>
							)}
						{user.coachDetails.yearsOfExperience && (
							<View className='mb-4'>
								<Text className='text-text-secondary text-sm mb-1'>
									Years of Experience
								</Text>
								<Text className='text-text-primary font-medium'>
									{user.coachDetails.yearsOfExperience} years
								</Text>
							</View>
						)}
						{user.coachDetails.ratings && (
							<View>
								<Text className='text-text-secondary text-sm mb-1'>
									Rating
								</Text>
								<Text className='text-text-primary font-medium'>
									{user.coachDetails.ratings.toFixed(1)} / 5.0
								</Text>
							</View>
						)}
					</View>
				)}
			</ScrollView>
		</FixedView>
	);
};

export default CoachProfile;
