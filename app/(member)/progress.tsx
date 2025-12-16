import DatePicker from '@/components/DatePicker';
import FixedView from '@/components/FixedView';
import GradientButton from '@/components/GradientButton';
import Input from '@/components/Input';
import Select from '@/components/Select';
import TabHeader from '@/components/TabHeader';
import { useAuth } from '@/contexts/AuthContext';
import {
	GetGoalsQuery,
	GetGoalsQueryVariables,
	GetWeightProgressChartQuery,
	GetWeightProgressChartQueryVariables,
} from '@/graphql/generated/types';
import {
	CREATE_GOAL_MUTATION,
	DELETE_GOAL_MUTATION,
} from '@/graphql/mutations';
import {
	GET_GOALS_QUERY,
	GET_WEIGHT_PROGRESS_CHART_QUERY,
	GET_PROGRESS_RATINGS_QUERY,
	GET_CLIENT_SESSIONS_QUERY,
	GET_SESSION_LOGS_QUERY,
} from '@/graphql/queries';
import { useMutation, useQuery } from '@apollo/client/react';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { Image as ExpoImage } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
	Alert,
	Dimensions,
	FlatList,
	Modal,
	RefreshControl,
	ScrollView,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';

const { width } = Dimensions.get('window');

interface WorkoutExercise {
	id: string;
	name: string;
	bodyPart: string;
	target: string;
	equipment?: string;
	gifUrl?: string;
	sets: number;
	reps: number;
}

const goalTypeOptions = [
	{ label: 'Weight Loss', value: 'WEIGHT_LOSS' },
	{ label: 'Muscle Building', value: 'MUSCLE_BUILDING' },
	{ label: 'General Fitness', value: 'GENERAL_FITNESS' },
	{ label: 'Strength Training', value: 'STRENGTH_TRAINING' },
	{ label: 'Endurance', value: 'ENDURANCE' },
	{ label: 'Flexibility', value: 'FLEXIBILITY' },
	{ label: 'Athletic Performance', value: 'ATHLETIC_PERFORMANCE' },
	{ label: 'Rehabilitation', value: 'REHABILITATION' },
];

const MemberProgress = () => {
	const { user } = useAuth();
	const router = useRouter();
	const [refreshing, setRefreshing] = useState(false);
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [selectedGoal, setSelectedGoal] = useState<any>(null);
	const [showWeightChart, setShowWeightChart] = useState(false);

	const [title, setTitle] = useState('');
	const [goalType, setGoalType] = useState('');
	const [description, setDescription] = useState('');
	const [targetWeight, setTargetWeight] = useState('');
	const [currentWeight, setCurrentWeight] = useState('');
	const [targetDate, setTargetDate] = useState<Date | undefined>();
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [selectedSession, setSelectedSession] = useState<any>(null);
	const [showWorkoutModal, setShowWorkoutModal] = useState(false);

	const apiKey =
		(Constants?.expoConfig as any)?.extra?.exerciseDbApiKey ??
		(Constants?.manifest as any)?.extra?.exerciseDbApiKey;

	const buildExerciseImageUrl = useCallback(
		(exerciseId: string) => {
			if (!apiKey) return null;
			return `https://exercisedb.p.rapidapi.com/image?exerciseId=${encodeURIComponent(
				exerciseId
			)}&resolution=360&rapidapi-key=${apiKey}`;
		},
		[apiKey]
	);

	// Parse workoutType JSON string to get exercises
	const parseWorkoutExercises = useCallback((workoutType: string | null | undefined): WorkoutExercise[] => {
		if (!workoutType) return [];
		try {
			const parsed = JSON.parse(workoutType);
			if (Array.isArray(parsed)) {
				return parsed.map((w: any) => ({
					id: String(w.id || ''),
					name: String(w.name || ''),
					bodyPart: String(w.bodyPart || ''),
					target: String(w.target || ''),
					equipment: w.equipment ? String(w.equipment) : undefined,
					gifUrl: w.gifUrl ? String(w.gifUrl) : undefined,
					sets: typeof w.sets === 'number' ? w.sets : parseInt(String(w.sets || '0'), 10) || 0,
					reps: typeof w.reps === 'number' ? w.reps : parseInt(String(w.reps || '0'), 10) || 0,
				}));
			}
			return [];
		} catch {
			return [];
		}
	}, []);

	const { data: goalsData, refetch: refetchGoals } = useQuery<
		GetGoalsQuery,
		GetGoalsQueryVariables
	>(GET_GOALS_QUERY, {
		variables: { clientId: user?.id || '', status: 'active' },
		fetchPolicy: 'cache-and-network',
		skip: !user?.id,
	});

	// Refetch data when screen is mounted
	useEffect(() => {
		if (user?.id) {
			refetchGoals();
		}
	}, [user?.id, refetchGoals]);

	// Handle pull-to-refresh
	const onRefresh = async () => {
		setRefreshing(true);
		try {
			if (user?.id) {
				await Promise.all([
					refetchGoals(),
					refetchSessions(),
					refetchSessionLogs(),
				]);
			}
		} finally {
			setRefreshing(false);
		}
	};

	const { data: progressData } = useQuery<
		GetWeightProgressChartQuery,
		GetWeightProgressChartQueryVariables
	>(GET_WEIGHT_PROGRESS_CHART_QUERY, {
		variables: { clientId: user?.id || '', goalId: selectedGoal?.id },
		skip: !selectedGoal || !showWeightChart || !user?.id,
	});

	// Query progress ratings for the selected goal
	const { data: ratingsData } = useQuery<any>(
		GET_PROGRESS_RATINGS_QUERY,
		{
			variables: {
				clientId: user?.id || '',
				goalId: selectedGoal?.id || '',
			},
			skip: !selectedGoal || !showWeightChart || !user?.id,
			fetchPolicy: 'cache-and-network',
		}
	);

	// Query upcoming sessions to show workouts
	const { data: sessionsData, refetch: refetchSessions } = useQuery(
		GET_CLIENT_SESSIONS_QUERY,
		{
			variables: { clientId: user?.id || '', status: 'UPCOMING' },
			fetchPolicy: 'cache-and-network',
			skip: !user?.id,
		}
	);

	// Query recent session logs to show completed workouts
	const { data: sessionLogsData, refetch: refetchSessionLogs } = useQuery(
		GET_SESSION_LOGS_QUERY,
		{
			variables: { clientId: user?.id || '' },
			fetchPolicy: 'cache-and-network',
			skip: !user?.id,
		}
	);

	// Get sessions with workouts
	const sessionsWithWorkouts = useMemo(() => {
		const upcoming = (sessionsData?.getClientSessions || []).filter((s: any) => {
			const exercises = parseWorkoutExercises(s.workoutType);
			return exercises.length > 0;
		});
		const completed = (sessionLogsData?.getSessionLogs || [])
			.filter((log: any) => {
				const exercises = parseWorkoutExercises(log.session?.workoutType);
				return exercises.length > 0;
			})
			.slice(0, 5); // Show only recent 5
		return { upcoming, completed };
	}, [sessionsData, sessionLogsData, parseWorkoutExercises]);

	const [createGoal, { loading: creating }] = useMutation(
		CREATE_GOAL_MUTATION,
		{
			onCompleted: () => {
				setShowCreateModal(false);
				resetForm();
				refetchGoals();
				Alert.alert('Success', 'Goal created successfully!');
			},
			onError: (error) => {
				Alert.alert('Error', error.message);
			},
		}
	);

	const [deleteGoal] = useMutation(DELETE_GOAL_MUTATION, {
		onCompleted: () => {
			refetchGoals();
			Alert.alert('Success', 'Goal deleted');
		},
		onError: (error) => {
			Alert.alert('Error', error.message);
		},
	});

	const resetForm = () => {
		setTitle('');
		setGoalType('');
		setDescription('');
		setTargetWeight('');
		setCurrentWeight('');
		setTargetDate(undefined);
		setErrors({});
	};

	const validateForm = () => {
		const newErrors: Record<string, string> = {};
		if (!title.trim()) newErrors.title = 'Title is required';
		if (!goalType) newErrors.goalType = 'Goal type is required';
		if (!targetDate) newErrors.targetDate = 'Target date is required';

		// Weight fields are required only for weight-related goal types
		const isWeightRelated =
			goalType === 'WEIGHT_LOSS' || goalType === 'MUSCLE_BUILDING';
		if (isWeightRelated) {
			if (!currentWeight.trim()) {
				newErrors.currentWeight =
					'Current weight is required for weight-related goals';
			} else if (
				isNaN(parseFloat(currentWeight)) ||
				parseFloat(currentWeight) <= 0
			) {
				newErrors.currentWeight = 'Please enter a valid current weight';
			}
			if (!targetWeight.trim()) {
				newErrors.targetWeight =
					'Target weight is required for weight-related goals';
			} else if (
				isNaN(parseFloat(targetWeight)) ||
				parseFloat(targetWeight) <= 0
			) {
				newErrors.targetWeight = 'Please enter a valid target weight';
			}
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = () => {
		if (!validateForm()) return;

		const input: any = {
			goalType,
			title: title.trim(),
			description: description.trim() || undefined,
			targetDate: targetDate?.toISOString(),
		};

		// Only include weight fields for weight-related goals
		const isWeightRelated =
			goalType === 'WEIGHT_LOSS' || goalType === 'MUSCLE_BUILDING';
		if (isWeightRelated) {
			input.currentWeight = parseFloat(currentWeight);
			input.targetWeight = parseFloat(targetWeight);
		}

		createGoal({ variables: { input } });
	};

	const goals = goalsData?.getGoals || [];
	const progressPoints = progressData?.getWeightProgressChart || [];

	// Simple weight chart visualization
	const renderWeightChart = () => {
		if (progressPoints.length === 0) {
			return (
				<View className='items-center justify-center py-10'>
					<Text className='text-text-secondary'>
						No weight data available yet
					</Text>
				</View>
			);
		}

		const weights = progressPoints.map((p: any) => p.weight);
		const minWeight = Math.min(...weights);
		const maxWeight = Math.max(...weights);
		const range = maxWeight - minWeight || 1;
		const chartHeight = 200;
		const chartWidth = width - 60;

		return (
			<View className='mt-4'>
				<Text className='text-text-primary font-semibold mb-4'>
					Weight Progress
				</Text>
				<View
					className='border-l-2 border-b-2 border-text-secondary'
					style={{ height: chartHeight, width: chartWidth }}
				>
					{progressPoints.map((point: any, index: number) => {
						const normalizedWeight = (point.weight - minWeight) / range;
						const y = chartHeight - normalizedWeight * chartHeight;
						const x = (index / (progressPoints.length - 1 || 1)) * chartWidth;

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
						{new Date(progressPoints[0]?.date).toLocaleDateString()}
					</Text>
					<Text className='text-text-secondary text-xs'>
						{new Date(
							progressPoints[progressPoints.length - 1]?.date
						).toLocaleDateString()}
					</Text>
				</View>
			</View>
		);
	};

	return (
		<FixedView className='flex-1 bg-bg-darker'>
			<TabHeader showCoachIcon={true} />
			<ScrollView
				className='flex-1'
				contentContainerClassName='p-5'
				showsVerticalScrollIndicator={false}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={onRefresh}
						tintColor='#F9C513'
					/>
				}
			>
				<View className='mb-6'>
					<View>
						<Text className='text-3xl font-bold text-text-primary'>
							Progress
						</Text>
						<Text className='text-text-secondary mt-1'>
							Track your fitness goals
						</Text>
					</View>
					<View className='flex-row gap-3 mt-4'>
						<GradientButton
						onPress={() => {
							resetForm();
							setShowCreateModal(true);
						}}
							className='flex-1'
						>
							Add Goal
						</GradientButton>
						<GradientButton
							onPress={() => router.push('/(member)/session-logs')}
							className='flex-1'
							variant='secondary'
					>
							<View className='flex-row items-center justify-center'>
								<Ionicons name='document-text' size={20} color='#F9C513' />
								<Text className='text-[#F9C513] font-semibold ml-2'>
									Session Logs
								</Text>
							</View>
						</GradientButton>
					</View>
				</View>

				{goals.length === 0 ? (
					<View
						className='bg-bg-primary rounded-xl p-6 items-center border border-[#F9C513]'
						style={{ borderWidth: 0.5 }}
					>
						<Ionicons name='flag-outline' size={48} color='#8E8E93' />
						<Text className='text-text-secondary mt-4 text-center text-base'>
							No goals yet
						</Text>
						<Text className='text-text-secondary mt-2 text-center text-sm'>
							Create a goal to start tracking your progress
						</Text>
					</View>
				) : (
					<>
						<FlatList
							data={goals}
							keyExtractor={(item) => item.id}
							scrollEnabled={false}
							renderItem={({ item }) => (
							<View
								className='bg-bg-primary rounded-xl p-4 mb-3 border border-[#F9C513]'
								style={{ borderWidth: 0.5 }}
							>
								<View className='flex-row justify-between items-start mb-2'>
									<View className='flex-1'>
										<Text className='text-text-primary font-semibold text-lg mb-1'>
											{item.title}
										</Text>
										<Text className='text-text-secondary text-sm'>
											{goalTypeOptions.find(
												(opt) => opt.value === item.goalType
											)?.label || item.goalType}
										</Text>
										{item.coach && (
											<View className='flex-row items-center mt-1'>
												<Ionicons name='person' size={14} color='#F9C513' />
												<Text className='text-[#F9C513] text-xs ml-1'>
													With Coach {item.coach.firstName}{' '}
													{item.coach.lastName}
												</Text>
											</View>
										)}
									</View>
									<TouchableOpacity
										onPress={() => {
											setSelectedGoal(item);
											setShowWeightChart(true);
										}}
									>
										<Ionicons name='stats-chart' size={24} color='#F9C513' />
									</TouchableOpacity>
								</View>
								{item.description && (
									<Text className='text-text-secondary text-sm mb-2'>
										{item.description}
									</Text>
								)}
								<View className='flex-row justify-between items-end mt-2'>
									{(item.targetWeight || item.currentWeight) && (
										<View className='flex-row gap-4'>
											{item.currentWeight && (
												<View>
													<Text className='text-text-secondary text-xs'>
														Current
													</Text>
													<Text className='text-text-primary font-semibold'>
														{item.currentWeight} kg
													</Text>
												</View>
											)}
											{item.targetWeight && (
												<View>
													<Text className='text-text-secondary text-xs'>
														Target
													</Text>
													<Text className='text-text-primary font-semibold'>
														{item.targetWeight} kg
													</Text>
												</View>
											)}
										</View>
									)}
									{!item.coachId && (
									<TouchableOpacity
										onPress={() => {
											Alert.alert('Delete Goal', 'Are you sure?', [
												{ text: 'Cancel', style: 'cancel' },
												{
													text: 'Delete',
													style: 'destructive',
													onPress: () =>
														deleteGoal({
															variables: { id: item.id },
														}),
												},
											]);
										}}
									>
										<Ionicons name='trash' size={24} color='#FF3B30' />
									</TouchableOpacity>
									)}
								</View>
							</View>
						)}
					/>

					{/* Workouts Section */}
					{(sessionsWithWorkouts.upcoming.length > 0 || sessionsWithWorkouts.completed.length > 0) && (
						<View className='mt-6'>
							<Text className='text-2xl font-bold text-text-primary mb-4'>
								Workouts
							</Text>
							<Text className='text-text-secondary mb-4'>
								Exercises from your sessions
							</Text>

							{/* Upcoming Sessions with Workouts */}
							{sessionsWithWorkouts.upcoming.length > 0 && (
								<View className='mb-4'>
									<Text className='text-lg font-semibold text-text-primary mb-3'>
										Upcoming Sessions
									</Text>
									{sessionsWithWorkouts.upcoming.map((session: any) => {
										const exercises = parseWorkoutExercises(session.workoutType);
										if (exercises.length === 0) return null;
										return (
											<TouchableOpacity
												key={session.id}
												onPress={() => {
													setSelectedSession(session);
													setShowWorkoutModal(true);
												}}
												className='bg-bg-primary rounded-xl p-4 mb-3 border border-[#F9C513]'
												style={{ borderWidth: 0.5 }}
											>
												<Text className='text-text-primary font-semibold text-base mb-2'>
													{session.name}
												</Text>
												<View className='flex-row items-center mb-2'>
													<Ionicons name='calendar' size={14} color='#8E8E93' />
													<Text className='text-text-secondary text-sm ml-1'>
														{new Date(session.date).toLocaleDateString('en-US', {
															month: 'short',
															day: 'numeric',
															year: 'numeric',
														})}
													</Text>
												</View>
												<View className='flex-row items-center'>
													<Ionicons name='barbell' size={14} color='#F9C513' />
													<Text className='text-[#F9C513] text-sm ml-1 font-semibold'>
														{exercises.length} Exercise{exercises.length !== 1 ? 's' : ''}
													</Text>
												</View>
											</TouchableOpacity>
										);
									})}
								</View>
							)}

							{/* Recent Completed Sessions with Workouts */}
							{sessionsWithWorkouts.completed.length > 0 && (
								<View>
									<Text className='text-lg font-semibold text-text-primary mb-3'>
										Recent Sessions
									</Text>
									{sessionsWithWorkouts.completed.map((log: any) => {
										const exercises = parseWorkoutExercises(log.session?.workoutType);
										if (exercises.length === 0) return null;
										return (
											<TouchableOpacity
												key={log.id}
												onPress={() => {
													setSelectedSession(log.session);
													setShowWorkoutModal(true);
												}}
												className='bg-bg-primary rounded-xl p-4 mb-3 border border-[#F9C513]'
												style={{ borderWidth: 0.5 }}
											>
												<Text className='text-text-primary font-semibold text-base mb-2'>
													{log.session?.name || 'Session'}
												</Text>
												<View className='flex-row items-center mb-2'>
													<Ionicons name='checkmark-circle' size={14} color='#4CAF50' />
													<Text className='text-text-secondary text-sm ml-1'>
														Completed{' '}
														{log.completedAt
															? new Date(log.completedAt).toLocaleDateString('en-US', {
																	month: 'short',
																	day: 'numeric',
																})
															: ''}
													</Text>
												</View>
												<View className='flex-row items-center'>
													<Ionicons name='barbell' size={14} color='#F9C513' />
													<Text className='text-[#F9C513] text-sm ml-1 font-semibold'>
														{exercises.length} Exercise{exercises.length !== 1 ? 's' : ''}
													</Text>
												</View>
											</TouchableOpacity>
										);
									})}
								</View>
							)}
						</View>
					)}
					</>
				)}
			</ScrollView>

			{/* Create/Edit Goal Modal */}
			<Modal
				visible={showCreateModal}
				animationType='slide'
				transparent={false}
				onRequestClose={() => {
					setShowCreateModal(false);
					resetForm();
				}}
			>
				<View className='flex-1 bg-bg-darker justify-end'>
					<View
						className='bg-bg-primary rounded-t-3xl p-6 max-h-[90%] border-t border-[#F9C513]'
						style={{ borderTopWidth: 0.5 }}
					>
						<ScrollView showsVerticalScrollIndicator={false}>
							<View className='flex-row justify-between items-center mb-6'>
								<Text className='text-2xl font-bold text-text-primary'>
									Create Goal
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

							<Select
								label='Goal Type *'
								options={goalTypeOptions}
								value={goalType}
								onChange={(value) => {
									setGoalType(value);
									setErrors({ ...errors, goalType: '' });
									// Clear weight fields when switching to non-weight-related goal
									if (value !== 'WEIGHT_LOSS' && value !== 'MUSCLE_BUILDING') {
										setCurrentWeight('');
										setTargetWeight('');
									}
								}}
								placeholder='Select goal type'
								error={errors.goalType}
							/>

							<Input
								label='Title *'
								placeholder='e.g., Lose 10kg in 3 months'
								value={title}
								onChangeText={(text) => {
									setTitle(text);
									setErrors({ ...errors, title: '' });
								}}
								error={errors.title}
							/>

							<Input
								label='Description (optional)'
								placeholder='Describe your goal...'
								value={description}
								onChangeText={setDescription}
								multiline
								numberOfLines={3}
							/>

							{(goalType === 'WEIGHT_LOSS' ||
								goalType === 'MUSCLE_BUILDING') && (
								<>
									<Input
										label='Current Weight (kg) *'
										placeholder='Enter current weight'
										value={currentWeight}
										onChangeText={(text) => {
											setCurrentWeight(text);
											setErrors({ ...errors, currentWeight: '' });
										}}
										keyboardType='decimal-pad'
										error={errors.currentWeight}
									/>

									<Input
										label='Target Weight (kg) *'
										placeholder='Enter target weight'
										value={targetWeight}
										onChangeText={(text) => {
											setTargetWeight(text);
											setErrors({ ...errors, targetWeight: '' });
										}}
										keyboardType='decimal-pad'
										error={errors.targetWeight}
									/>
								</>
							)}

							<DatePicker
								label='Target Date *'
								value={targetDate}
								onChange={(date) => {
									setTargetDate(date);
									setErrors({ ...errors, targetDate: '' });
								}}
								minimumDate={new Date()}
								error={errors.targetDate}
							/>

							<GradientButton
								onPress={handleSubmit}
								loading={creating}
								className='mt-4'
							>
								{creating ? 'Creating...' : 'Create Goal'}
							</GradientButton>
						</ScrollView>
					</View>
				</View>
			</Modal>

			{/* Weight Chart Modal */}
			<Modal
				visible={showWeightChart}
				animationType='slide'
				transparent={false}
				onRequestClose={() => {
					setShowWeightChart(false);
					setSelectedGoal(null);
				}}
			>
				<View className='flex-1 bg-bg-darker justify-center px-5'>
					<View
						className='bg-bg-primary rounded-2xl p-6 max-h-[80%] border border-[#F9C513]'
						style={{ borderWidth: 0.5 }}
					>
						<View className='flex-row justify-between items-center mb-4'>
							<Text className='text-2xl font-bold text-text-primary'>
								{selectedGoal?.title}
							</Text>
							<TouchableOpacity
								onPress={() => {
									setShowWeightChart(false);
									setSelectedGoal(null);
								}}
							>
								<Ionicons name='close' size={28} color='#8E8E93' />
							</TouchableOpacity>
						</View>
						<ScrollView>
							{renderWeightChart()}
							
							{/* Progress Ratings Section */}
							{selectedGoal?.coachId && (
								<View className='mt-6'>
									<Text className='text-xl font-bold text-text-primary mb-4'>
										Progress Ratings
									</Text>
									{ratingsData?.getProgressRatings &&
									ratingsData.getProgressRatings.length > 0 ? (
										ratingsData.getProgressRatings.map((rating: any) => {
											const startDate = new Date(rating.startDate);
											const endDate = new Date(rating.endDate);
											const verdictLabels: Record<string, string> = {
												PROGRESSIVE: 'Progressive',
												CLOSE_TO_ACHIEVEMENT: 'Close to Achievement',
												ACHIEVED: 'Achieved',
												REGRESSING: 'Regressing',
											};
											const verdictColors: Record<string, string> = {
												PROGRESSIVE: '#10B981', // green
												CLOSE_TO_ACHIEVEMENT: '#F59E0B', // amber
												ACHIEVED: '#3B82F6', // blue
												REGRESSING: '#EF4444', // red
											};

											return (
												<View
													key={rating.id}
													className='bg-bg-darker rounded-xl p-4 mb-3 border border-[#F9C513]'
													style={{ borderWidth: 0.5 }}
												>
													<View className='flex-row justify-between items-start mb-2'>
														<View className='flex-1'>
															<Text className='text-text-primary font-semibold text-base mb-1'>
																{startDate.toLocaleDateString()} -{' '}
																{endDate.toLocaleDateString()}
															</Text>
															{rating.coach && (
																<Text className='text-text-secondary text-sm'>
																	By Coach {rating.coach.firstName}{' '}
																	{rating.coach.lastName}
																</Text>
															)}
														</View>
														<View
															className='px-3 py-1 rounded-full'
															style={{
																backgroundColor:
																	verdictColors[rating.verdict] || '#8E8E93',
															}}
														>
															<Text className='text-white text-xs font-semibold'>
																{verdictLabels[rating.verdict] || rating.verdict}
															</Text>
														</View>
													</View>

													<View className='flex-row items-center mb-2'>
														<Text className='text-text-secondary text-sm mr-2'>
															Rating:
														</Text>
														<View className='flex-row items-center'>
															{Array.from({ length: 10 }).map((_, index) => (
																<Ionicons
																	key={index}
																	name={
																		index < rating.rating
																			? 'star'
																			: 'star-outline'
																	}
																	size={16}
																	color='#F9C513'
																/>
															))}
															<Text className='text-text-primary font-semibold ml-2'>
																{rating.rating}/10
															</Text>
														</View>
													</View>

													{rating.comment && (
														<View className='mt-2'>
															<Text className='text-text-secondary text-xs mb-1'>
																Comment:
															</Text>
															<Text className='text-text-primary text-sm'>
																{rating.comment}
															</Text>
														</View>
													)}

													<Text className='text-text-secondary text-xs mt-2'>
														Created:{' '}
														{new Date(rating.createdAt).toLocaleDateString()}
													</Text>
												</View>
											);
										})
									) : (
										<View className='items-center justify-center py-8 bg-bg-darker rounded-xl border border-[#F9C513]' style={{ borderWidth: 0.5 }}>
											<Ionicons name='star-outline' size={48} color='#8E8E93' />
											<Text className='text-text-secondary mt-4 text-center text-base'>
												No ratings yet
											</Text>
											<Text className='text-text-secondary mt-2 text-center text-sm'>
												Your coach hasn't rated your progress for this goal yet
											</Text>
										</View>
									)}
								</View>
							)}
						</ScrollView>
					</View>
				</View>
			</Modal>

			{/* Workout Exercises Modal */}
			<Modal
				visible={showWorkoutModal}
				animationType='slide'
				transparent={false}
				onRequestClose={() => {
					setShowWorkoutModal(false);
					setSelectedSession(null);
				}}
			>
				<View className='flex-1 bg-bg-darker justify-center px-5'>
					<View
						className='bg-bg-primary rounded-2xl p-6 max-h-[80%] border border-[#F9C513]'
						style={{ borderWidth: 0.5 }}
					>
						<View className='flex-row justify-between items-center mb-4'>
							<View className='flex-1'>
								<Text className='text-2xl font-bold text-text-primary'>
									{selectedSession?.name || 'Workout Exercises'}
								</Text>
								{selectedSession?.date && (
									<Text className='text-text-secondary text-sm mt-1'>
										{new Date(selectedSession.date).toLocaleDateString('en-US', {
											month: 'long',
											day: 'numeric',
											year: 'numeric',
										})}
									</Text>
								)}
							</View>
							<TouchableOpacity
								onPress={() => {
									setShowWorkoutModal(false);
									setSelectedSession(null);
								}}
							>
								<Ionicons name='close' size={28} color='#8E8E93' />
							</TouchableOpacity>
						</View>
						<ScrollView showsVerticalScrollIndicator={false}>
							{(() => {
								const exercises = parseWorkoutExercises(selectedSession?.workoutType);
								if (exercises.length === 0) {
									return (
										<View className='items-center justify-center py-10'>
											<Text className='text-text-secondary'>
												No exercises found for this session
											</Text>
										</View>
									);
								}
								
								return (
									<View className='space-y-3'>
										{exercises.map((exercise, index) => {
											const imageUrl = buildExerciseImageUrl(exercise.id);
											return (
												<View
													key={`${exercise.id}-${index}`}
													className='bg-bg-darker rounded-xl p-4 border border-[#F9C513]'
													style={{ borderWidth: 0.5 }}
												>
													<View className='flex-row'>
														{imageUrl && (
															<View className='mr-3'>
																<ExpoImage
																	source={{ uri: imageUrl }}
																	style={{
																		width: 80,
																		height: 80,
																		borderRadius: 8,
																		borderWidth: 0.5,
																		borderColor: '#F9C513',
																	}}
																	contentFit='cover'
																/>
															</View>
														)}
														<View className='flex-1'>
															<Text className='text-text-primary font-semibold text-base mb-1'>
																{exercise.name}
															</Text>
															<View className='flex-row items-center mb-1'>
																<Ionicons
																	name='body'
																	size={14}
																	color='#8E8E93'
																/>
																<Text className='text-text-secondary text-xs ml-1'>
																	{exercise.bodyPart}
																</Text>
															</View>
															{exercise.target && (
																<View className='flex-row items-center mb-1'>
																	<Ionicons
																		name='target'
																		size={14}
																		color='#8E8E93'
																	/>
																	<Text className='text-text-secondary text-xs ml-1'>
																		{exercise.target}
																	</Text>
																</View>
															)}
															{exercise.equipment && (
																<View className='flex-row items-center mb-2'>
																	<Ionicons
																		name='construct'
																		size={14}
																		color='#8E8E93'
																	/>
																	<Text className='text-text-secondary text-xs ml-1'>
																		{exercise.equipment}
																	</Text>
																</View>
															)}
															<View className='flex-row items-center'>
																<View className='bg-[#F9C513] px-2 py-1 rounded mr-2'>
																	<Text className='text-bg-darker font-semibold text-xs'>
																		{exercise.sets} Sets
																	</Text>
																</View>
																<View className='bg-[#F9C513] px-2 py-1 rounded'>
																	<Text className='text-bg-darker font-semibold text-xs'>
																		{exercise.reps} Reps
																	</Text>
																</View>
															</View>
														</View>
													</View>
												</View>
											);
										})}
									</View>
								);
							})()}
						</ScrollView>
					</View>
				</View>
			</Modal>
		</FixedView>
	);
};

export default MemberProgress;
