import FixedView from '@/components/FixedView';
import GradientButton from '@/components/GradientButton';
import TimePicker from '@/components/TimePicker';
import Select from '@/components/Select';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';

const fitnessGoalOptions = [
	{ label: 'Weight loss', value: 'Weight loss' },
	{ label: 'Muscle building', value: 'Muscle building' },
	{ label: 'General fitness', value: 'General fitness' },
	{ label: 'Strength training', value: 'Strength training' },
	{ label: 'Endurance', value: 'Endurance' },
];

const physiqueGoalTypeOptions = [
	{ label: 'Ectomorph (lean build, hard to gain muscle)', value: 'Ectomorph' },
	{ label: 'Mesomorph (naturally athletic, builds muscle easily)', value: 'Mesomorph' },
	{ label: 'Endomorph (bulky build, gains weight easily)', value: 'Endomorph' },
];

const Second = () => {
	const router = useRouter();
	const { data, updateData } = useOnboarding();

	const [fitnessGoal, setFitnessGoal] = useState<string[]>(
		data.fitnessGoal || []
	);
	const [physiqueGoalType, setPhysiqueGoalType] = useState(
		data.physiqueGoalType || ''
	);
	
	// Parse existing workout time if available
	const parseWorkoutTime = (timeStr?: string[]) => {
		if (!timeStr || timeStr.length === 0) {
			// Default: 8 AM start, 6 PM end
			const startDate = new Date();
			startDate.setHours(8, 0, 0, 0);
			const endDate = new Date();
			endDate.setHours(18, 0, 0, 0);
			return { start: startDate, end: endDate };
		}
		const timeRange = timeStr[0];
		if (timeRange.includes('-')) {
			const [start, end] = timeRange.split('-');
			// Convert 24h format to Date objects
			const startHour = parseInt(start);
			const endHour = parseInt(end);
			const startDate = new Date();
			startDate.setHours(startHour, 0, 0, 0);
			const endDate = new Date();
			endDate.setHours(endHour, 0, 0, 0);
			return { start: startDate, end: endDate };
		}
		// Default: 8 AM start, 6 PM end
		const startDate = new Date();
		startDate.setHours(8, 0, 0, 0);
		const endDate = new Date();
		endDate.setHours(18, 0, 0, 0);
		return { start: startDate, end: endDate };
	};
	
	const initialWorkoutTime = parseWorkoutTime(data.workOutTime);
	const [workOutTimeStart, setWorkOutTimeStart] = useState<Date | undefined>(
		initialWorkoutTime.start
	);
	const [workOutTimeEnd, setWorkOutTimeEnd] = useState<Date | undefined>(
		initialWorkoutTime.end
	);

	const [errors, setErrors] = useState<Record<string, string>>({});

	const toggleFitnessGoal = (value: string) => {
		setFitnessGoal((prev) => {
			if (prev.includes(value)) {
				return prev.filter((goal) => goal !== value);
			} else {
				return [...prev, value];
			}
		});
		setErrors({ ...errors, fitnessGoal: '' });
	};

	const validateForm = () => {
		const newErrors: Record<string, string> = {};

		if (fitnessGoal.length === 0) {
			newErrors.fitnessGoal = 'Please select at least one fitness goal';
		}

		if (!physiqueGoalType) {
			newErrors.physiqueGoalType = 'Physique goal type is required';
		}

		if (!workOutTimeStart || !workOutTimeEnd) {
			newErrors.workOutTime = 'Workout time range is required';
		} else {
			const startHours = workOutTimeStart.getHours() * 60 + workOutTimeStart.getMinutes();
			const endHours = workOutTimeEnd.getHours() * 60 + workOutTimeEnd.getMinutes();
			if (startHours >= endHours) {
				newErrors.workOutTime = 'End time must be after start time';
			}
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleContinue = () => {
		if (validateForm() && workOutTimeStart && workOutTimeEnd) {
			// Convert time to 24-hour format string for storage
			const startHour = workOutTimeStart.getHours();
			const endHour = workOutTimeEnd.getHours();
			updateData({
				fitnessGoal,
				physiqueGoalType,
				workOutTime: [`${startHour}-${endHour}`],
			});
			router.push('/(auth)/(onboarding)/fourth');
		}
	};

	return (
		<FixedView className='flex-1 bg-bg-darker'>
			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				className='flex-1'
				keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
			>
				<ScrollView
					contentContainerClassName='flex-grow px-5 py-8'
					keyboardShouldPersistTaps='handled'
					showsVerticalScrollIndicator={false}
				>
				<Text className='text-3xl font-bold mb-2 text-text-primary'>
					Fitness Goals
				</Text>
				<Text className='text-base text-text-secondary mb-8'>
					Tell us about your fitness objectives
				</Text>

				<View className='gap-4'>
					<View>
						<Text className='text-text-primary text-sm font-medium mb-2'>
							Fitness Goals (Select all that apply)
						</Text>
						<View className='gap-2'>
							{fitnessGoalOptions.map((option) => (
								<TouchableOpacity
									key={option.value}
									onPress={() => toggleFitnessGoal(option.value)}
									className={`border-2 rounded-lg p-4 ${
										fitnessGoal.includes(option.value)
											? 'border-[#F9C513] bg-[#2a2a2a]'
											: 'border-input bg-input'
									}`}
								>
									<Text
										className={`text-base ${
											fitnessGoal.includes(option.value)
												? 'text-[#F9C513] font-semibold'
												: 'text-text-primary'
										}`}
									>
										{option.label}
										{fitnessGoal.includes(option.value) && ' ✓'}
									</Text>
								</TouchableOpacity>
							))}
						</View>
						{errors.fitnessGoal && (
							<Text className='text-red-500 text-sm mt-1'>
								{errors.fitnessGoal}
							</Text>
						)}
					</View>

					<Select
						label='Physique Goal Type'
						options={physiqueGoalTypeOptions}
						value={physiqueGoalType}
						onChange={(value) => {
							setPhysiqueGoalType(value);
							setErrors({ ...errors, physiqueGoalType: '' });
						}}
						placeholder='Select your physique goal type'
						error={errors.physiqueGoalType}
					/>

					<View className='mb-4'>
						<Text className='text-text-primary text-sm font-medium mb-2'>
							Preferred Workout Time
						</Text>
						<View className='flex-row gap-3'>
							<View className='flex-1'>
								<TimePicker
									label='Start Time'
									value={workOutTimeStart}
									onChange={(date) => {
										setWorkOutTimeStart(date);
										setErrors({ ...errors, workOutTime: '' });
									}}
									placeholder='Select start time'
									error={errors.workOutTime}
									containerClassName='mb-0'
								/>
							</View>
							<View className='flex-1'>
								<TimePicker
									label='End Time'
									value={workOutTimeEnd}
									onChange={(date) => {
										setWorkOutTimeEnd(date);
										setErrors({ ...errors, workOutTime: '' });
									}}
									placeholder='Select end time'
									containerClassName='mb-0'
								/>
							</View>
						</View>
					</View>

					<View className='flex-row gap-3 mt-4'>
						<GradientButton
							onPress={() => router.back()}
							className='flex-1'
							variant='secondary'
						>
							Back
						</GradientButton>
						<GradientButton onPress={handleContinue} className='flex-1'>
							Continue
						</GradientButton>
					</View>
				</View>
			</ScrollView>
			</KeyboardAvoidingView>
		</FixedView>
	);
};

export default Second;
