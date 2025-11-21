import DatePicker from '@/components/DatePicker';
import FixedView from '@/components/FixedView';
import GradientButton from '@/components/GradientButton';
import Input from '@/components/Input';
import Select from '@/components/Select';
import TabHeader from '@/components/TabHeader';
import { useAuth } from '@/contexts/AuthContext';
import {
	CANCEL_SESSION_MUTATION,
	CREATE_SESSION_MUTATION,
} from '@/graphql/mutations';
import {
	GET_COACH_SESSIONS_QUERY,
	GET_UPCOMING_SESSIONS_QUERY,
} from '@/graphql/queries';
import { useMutation, useQuery } from '@apollo/client/react';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
	Alert,
	FlatList,
	Modal,
	ScrollView,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';

const gymAreas = [
	{ label: 'Main Training Area', value: 'Main Training Area' },
	{ label: 'Cardio Zone', value: 'Cardio Zone' },
	{ label: 'Free Weights Area', value: 'Free Weights Area' },
	{ label: 'Group Fitness Studio', value: 'Group Fitness Studio' },
	{ label: 'Yoga Room', value: 'Yoga Room' },
];

const CoachSchedule = () => {
	const { user } = useAuth();
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [selectedClients, setSelectedClients] = useState<string[]>([]);
	const [sessionName, setSessionName] = useState('');
	const [date, setDate] = useState<Date | undefined>();
	const [startTime, setStartTime] = useState('');
	const [endTime, setEndTime] = useState('');
	const [gymArea, setGymArea] = useState('');
	const [note, setNote] = useState('');
	const [errors, setErrors] = useState<Record<string, string>>({});

	const { data: sessionsData, refetch } = useQuery(GET_COACH_SESSIONS_QUERY, {
		variables: { coachId: user?.id },
		fetchPolicy: 'cache-and-network',
	});

	const { data: clientsData } = useQuery(GET_UPCOMING_SESSIONS_QUERY, {
		skip: true, // TODO: Add query to get coach's clients
	});

	const [createSession, { loading: creating }] = useMutation(
		CREATE_SESSION_MUTATION,
		{
			onCompleted: () => {
				setShowCreateModal(false);
				resetForm();
				refetch();
				Alert.alert('Success', 'Session created successfully!');
			},
			onError: (error) => {
				Alert.alert('Error', error.message);
			},
		}
	);

	const [cancelSession] = useMutation(CANCEL_SESSION_MUTATION, {
		onCompleted: () => {
			refetch();
			Alert.alert('Success', 'Session cancelled');
		},
		onError: (error) => {
			Alert.alert('Error', error.message);
		},
	});

	const resetForm = () => {
		setSessionName('');
		setDate(undefined);
		setStartTime('');
		setEndTime('');
		setGymArea('');
		setNote('');
		setSelectedClients([]);
		setErrors({});
	};

	const validateForm = () => {
		const newErrors: Record<string, string> = {};
		if (!sessionName.trim()) newErrors.sessionName = 'Workout name is required';
		if (!date) newErrors.date = 'Date is required';
		if (!startTime.trim()) newErrors.startTime = 'Start time is required';
		if (!gymArea) newErrors.gymArea = 'Gym area is required';
		if (selectedClients.length === 0)
			newErrors.clients = 'Select at least one client';

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleCreateSession = () => {
		if (!validateForm()) return;

		createSession({
			variables: {
				input: {
					clientsIds: selectedClients,
					name: sessionName.trim(),
					date: date?.toISOString(),
					startTime,
					endTime: endTime || undefined,
					gymArea,
					note: note || undefined,
				},
			},
		});
	};

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

	const sessions = sessionsData?.getCoachSessions || [];

	return (
		<FixedView className='flex-1 bg-bg-darker'>
			<TabHeader showCoachIcon={false} />
			<ScrollView
				className='flex-1'
				contentContainerClassName='p-5'
				showsVerticalScrollIndicator={false}
			>
				<View className='flex-row justify-between items-center mb-6'>
					<Text className='text-3xl font-bold text-text-primary'>Schedule</Text>
					<GradientButton
						onPress={() => setShowCreateModal(true)}
						className='px-4 py-2 h-17 w-30'
					>
						<Ionicons name='add' size={30} color='#fff' />
					</GradientButton>
				</View>

				<View className='mb-4'>
					<Text className='text-xl font-semibold text-text-primary mb-4'>
						Upcoming Sessions
					</Text>
					{sessions.length === 0 ? (
						<View className='bg-bg-primary rounded-xl p-6 items-center'>
							<Ionicons name='calendar-outline' size={48} color='#8E8E93' />
							<Text className='text-text-secondary mt-2 text-center'>
								No upcoming sessions
							</Text>
						</View>
					) : (
						<FlatList
							data={sessions.slice(0, 5)}
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
											<Ionicons name='location' size={14} color='#8E8E93' />
											<Text className='text-text-secondary text-sm ml-1'>
												{item.gymArea}
											</Text>
										</View>
										<Text className='text-text-secondary text-sm'>
											{item.clients?.length || 0} client(s)
										</Text>
									</View>
									<TouchableOpacity
										onPress={() => {
											Alert.alert(
												'Cancel Session',
												'Are you sure you want to cancel this session?',
												[
													{ text: 'No', style: 'cancel' },
													{
														text: 'Yes',
														style: 'destructive',
														onPress: () =>
															cancelSession({
																variables: { id: item.id },
															}),
													},
												]
											);
										}}
										className='p-2'
									>
										<Ionicons name='close-circle' size={24} color='#FF3B30' />
									</TouchableOpacity>
								</View>
							)}
						/>
					)}
				</View>
			</ScrollView>

			{/* Create Session Modal */}
			<Modal
				visible={showCreateModal}
				animationType='slide'
				transparent
				onRequestClose={() => setShowCreateModal(false)}
			>
				<View className='flex-1 bg-black/50 justify-end'>
					<View className='bg-bg-primary rounded-t-3xl p-5 max-h-[90%]'>
						<ScrollView showsVerticalScrollIndicator={false}>
							<View className='flex-row justify-between items-center mb-6'>
								<Text className='text-2xl font-bold text-text-primary'>
									Create Session
								</Text>
								<TouchableOpacity
									onPress={() => {
										setShowCreateModal(false);
										resetForm();
									}}
								>
									<Ionicons name='close' size={28} color='#8E8E93' />
								</TouchableOpacity>
							</View>

							<Input
								label='Workout Name'
								placeholder='e.g., Chest, Back, Leg Day'
								value={sessionName}
								onChangeText={(text) => {
									setSessionName(text);
									setErrors({ ...errors, sessionName: '' });
								}}
								error={errors.sessionName}
							/>

							<DatePicker
								label='Date'
								value={date}
								onChange={setDate}
								minimumDate={new Date()}
								error={errors.date}
							/>

							<Input
								label='Start Time'
								placeholder='e.g., 6:00 PM'
								value={startTime}
								onChangeText={(text) => {
									setStartTime(text);
									setErrors({ ...errors, startTime: '' });
								}}
								error={errors.startTime}
							/>

							<Input
								label='End Time (Optional)'
								placeholder='e.g., 7:30 PM'
								value={endTime}
								onChangeText={setEndTime}
							/>

							<Select
								label='Gym Area'
								options={gymAreas}
								value={gymArea}
								onChange={(value) => {
									setGymArea(value);
									setErrors({ ...errors, gymArea: '' });
								}}
								placeholder='Select gym area'
								error={errors.gymArea}
							/>

							{/* TODO: Multi-select for clients */}
							<View className='mb-4'>
								<Text className='text-text-primary font-semibold mb-2'>
									Select Clients
								</Text>
								<Text className='text-text-secondary text-sm'>
									Client selection feature coming soon
								</Text>
							</View>

							<Input
								label='Notes (Optional)'
								placeholder='Additional notes...'
								value={note}
								onChangeText={setNote}
								multiline
								numberOfLines={3}
							/>

							<GradientButton
								onPress={handleCreateSession}
								loading={creating}
								className='mt-4'
							>
								Create Session
							</GradientButton>
						</ScrollView>
					</View>
				</View>
			</Modal>
		</FixedView>
	);
};

export default CoachSchedule;
