import FixedView from '@/components/FixedView';
import TabHeader from '@/components/TabHeader';
import { useAuth } from '@/contexts/AuthContext';
import { GET_CLIENT_SESSIONS_QUERY } from '@/graphql/queries';
import { COMPLETE_SESSION_MUTATION } from '@/graphql/mutations';
import { useQuery, useMutation } from '@apollo/client/react';
import React, { useState } from 'react';
import {
	ScrollView,
	Text,
	View,
	FlatList,
	TouchableOpacity,
	Modal,
	Alert,
	TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GradientButton from '@/components/GradientButton';

const MemberSchedule = () => {
	const { user } = useAuth();
	const [selectedSession, setSelectedSession] = useState<any>(null);
	const [showWeightModal, setShowWeightModal] = useState(false);
	const [weight, setWeight] = useState('');
	const [weightError, setWeightError] = useState('');

	const { data, refetch, loading } = useQuery(GET_CLIENT_SESSIONS_QUERY, {
		variables: {
			clientId: user?.id,
			status: 'scheduled',
		},
		fetchPolicy: 'cache-and-network',
	});

	const [completeSession, { loading: completing }] = useMutation(
		COMPLETE_SESSION_MUTATION,
		{
			onCompleted: () => {
				setShowWeightModal(false);
				setWeight('');
				refetch();
				Alert.alert(
					'Success',
					'Weight entered! Waiting for coach confirmation.'
				);
			},
			onError: (error) => {
				Alert.alert('Error', error.message);
			},
		}
	);

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

	const handleCompleteSession = (session: any) => {
		setSelectedSession(session);
		setShowWeightModal(true);
	};

	const handleSubmitWeight = () => {
		if (!weight.trim()) {
			setWeightError('Weight is required');
			return;
		}

		const weightNum = parseFloat(weight);
		if (isNaN(weightNum) || weightNum <= 0) {
			setWeightError('Please enter a valid weight');
			return;
		}

		setWeightError('');

		completeSession({
			variables: {
				input: {
					sessionId: selectedSession.id,
					weight: weightNum,
				},
			},
		});
	};

	const sessions = data?.getClientSessions || [];

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
						Upcoming Sessions
					</Text>
					<Text className='text-text-secondary mt-1'>
						Your scheduled workouts
					</Text>
				</View>

				{loading ? (
					<View className='items-center justify-center py-20'>
						<Text className='text-text-secondary'>Loading...</Text>
					</View>
				) : sessions.length === 0 ? (
					<View className='bg-bg-primary rounded-xl p-6 items-center'>
						<Ionicons name='calendar-outline' size={48} color='#8E8E93' />
						<Text className='text-text-secondary mt-4 text-center text-base'>
							No upcoming sessions
						</Text>
						<Text className='text-text-secondary mt-2 text-center text-sm'>
							Your coach will schedule sessions for you
						</Text>
					</View>
				) : (
					<FlatList
						data={sessions}
						keyExtractor={(item) => item.id}
						scrollEnabled={false}
						renderItem={({ item }) => (
							<View className='bg-bg-primary rounded-xl p-4 mb-3'>
								<View className='flex-row'>
									<View className='bg-bg-darker rounded-lg p-3 mr-3 items-center justify-center min-w-[80]'>
										<Text className='text-[#F9C513] font-bold text-lg'>
											{item.startTime}
										</Text>
										<Text className='text-text-secondary text-xs mt-1'>
											{formatDate(item.date)}
										</Text>
									</View>
									<View className='flex-1'>
										<Text className='text-text-primary font-semibold text-base mb-2'>
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
								{new Date(item.date) <= new Date() && (
									<GradientButton
										onPress={() => handleCompleteSession(item)}
										className='mt-3'
									>
										Complete Session
									</GradientButton>
								)}
							</View>
						)}
					/>
				)}
			</ScrollView>

			{/* Weight Input Modal */}
			<Modal
				visible={showWeightModal}
				animationType='slide'
				transparent
				onRequestClose={() => {
					setShowWeightModal(false);
					setWeight('');
					setWeightError('');
				}}
			>
				<View className='flex-1 bg-bg-darker justify-center px-5'>
					<View className='bg-bg-primary rounded-2xl p-6'>
						<Text className='text-2xl font-bold text-text-primary mb-2'>
							Enter Current Weight
						</Text>
						<Text className='text-text-secondary mb-4'>
							Enter your weight at the end of this session (kg)
						</Text>

						<View className='mb-4'>
							<Text className='text-text-primary font-semibold mb-2'>
								Weight (kg)
							</Text>
							<TextInput
								className='bg-bg-darker rounded-lg p-4 text-text-primary text-lg'
								placeholder='Enter weight'
								placeholderTextColor='#8E8E93'
								value={weight}
								onChangeText={(text) => {
									setWeight(text);
									setWeightError('');
								}}
								keyboardType='decimal-pad'
							/>
							{weightError ? (
								<Text className='text-red-500 text-sm mt-1'>{weightError}</Text>
							) : null}
						</View>

						<View className='flex-row gap-3'>
							<GradientButton
								onPress={() => {
									setShowWeightModal(false);
									setWeight('');
									setWeightError('');
								}}
								className='flex-1'
								variant='secondary'
							>
								Cancel
							</GradientButton>
							<GradientButton
								onPress={handleSubmitWeight}
								loading={completing}
								className='flex-1'
							>
								Submit
							</GradientButton>
						</View>
					</View>
				</View>
			</Modal>
		</FixedView>
	);
};

export default MemberSchedule;

