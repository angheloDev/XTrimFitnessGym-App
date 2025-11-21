import FixedView from '@/components/FixedView';
import TabHeader from '@/components/TabHeader';
import { useAuth } from '@/contexts/AuthContext';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const MemberProfile = () => {
	const { user } = useAuth();

	return (
		<FixedView className='flex-1 bg-bg-darker'>
			<TabHeader showCoachIcon={true} />
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
						{user?.firstName} {user?.lastName}
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

				{user?.membershipDetails && (
					<View className='bg-bg-primary rounded-xl p-5'>
						<Text className='text-xl font-semibold text-text-primary mb-4'>
							Fitness Goals
						</Text>
						{user.membershipDetails.fitnessGoal &&
							user.membershipDetails.fitnessGoal.length > 0 && (
								<View className='flex-row flex-wrap'>
									{user.membershipDetails.fitnessGoal.map(
										(goal: string, index: number) => (
											<View
												key={index}
												className='bg-bg-darker px-3 py-2 rounded-lg mr-2 mb-2'
											>
												<Text className='text-text-primary'>{goal}</Text>
											</View>
										)
									)}
								</View>
							)}
					</View>
				)}
			</ScrollView>
		</FixedView>
	);
};

export default MemberProfile;
