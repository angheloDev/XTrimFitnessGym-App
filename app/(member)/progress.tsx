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
} from '@/graphql/queries';
import { useMutation, useQuery } from '@apollo/client/react';
import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
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
				await refetchGoals();
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
					<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor='#F9C513' />
				}
			>
				<View className='flex-row justify-between items-center mb-6'>
					<View>
						<Text className='text-3xl font-bold text-text-primary'>
							Progress
						</Text>
						<Text className='text-text-secondary mt-1'>
							Track your fitness goals
						</Text>
					</View>
					<TouchableOpacity
						onPress={() => {
							resetForm();
							setShowCreateModal(true);
						}}
						className='bg-[#F9C513] rounded-full p-3'
					>
						<Ionicons name='add' size={24} color='#000' />
					</TouchableOpacity>
				</View>

				{goals.length === 0 ? (
					<View className='bg-bg-primary rounded-xl p-6 items-center'>
						<Ionicons name='flag-outline' size={48} color='#8E8E93' />
						<Text className='text-text-secondary mt-4 text-center text-base'>
							No goals yet
						</Text>
						<Text className='text-text-secondary mt-2 text-center text-sm'>
							Create a goal to start tracking your progress
						</Text>
						<GradientButton
							onPress={() => {
								resetForm();
								setShowCreateModal(true);
							}}
							className='mt-4'
						>
							Create Goal
						</GradientButton>
					</View>
				) : (
					<FlatList
						data={goals}
						keyExtractor={(item) => item.id}
						scrollEnabled={false}
						renderItem={({ item }) => (
							<View className='bg-bg-primary rounded-xl p-4 mb-3'>
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
								</View>
							</View>
						)}
					/>
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
					<View className='bg-bg-primary rounded-t-3xl p-6 max-h-[90%]'>
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
					<View className='bg-bg-primary rounded-2xl p-6 max-h-[80%]'>
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
						<ScrollView>{renderWeightChart()}</ScrollView>
					</View>
				</View>
			</Modal>
		</FixedView>
	);
};

export default MemberProgress;
