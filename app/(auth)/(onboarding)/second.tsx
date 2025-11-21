import FixedView from '@/components/FixedView';
import GradientButton from '@/components/GradientButton';
import Input from '@/components/Input';
import Select from '@/components/Select';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

const fitnessGoalOptions = [
	{ label: 'Weight loss', value: 'Weight loss' },
	{ label: 'Muscle building', value: 'Muscle building' },
	{ label: 'General fitness', value: 'General fitness' },
	{ label: 'Strength training', value: 'Strength training' },
	{ label: 'Endurance', value: 'Endurance' },
];

const physiqueGoalTypeOptions = [
	{ label: 'Ectomorph', value: 'Ectomorph' },
	{ label: 'Endomorph', value: 'Endomorph' },
	{ label: 'Mesomorph', value: 'Mesomorph' },
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
	const [workOutTimeStart, setWorkOutTimeStart] = useState('');
	const [workOutTimeEnd, setWorkOutTimeEnd] = useState('');

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
			const start = parseInt(workOutTimeStart);
			const end = parseInt(workOutTimeEnd);
			if (start >= end) {
				newErrors.workOutTime = 'End time must be after start time';
			}
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleContinue = () => {
		if (validateForm()) {
			updateData({
				fitnessGoal,
				physiqueGoalType,
				workOutTime: [`${workOutTimeStart}-${workOutTimeEnd}`],
			});
			router.push('/(auth)/(onboarding)/third');
		}
	};

	return (
		<FixedView className='flex-1 bg-bg-darker'>
			<ScrollView
				contentContainerClassName='flex-grow px-5 py-8'
				keyboardShouldPersistTaps='handled'
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

					<View>
						<Text className='text-text-primary text-sm font-medium mb-2'>
							Preferred Workout Time
						</Text>
						<View className='flex-row gap-3'>
							<View className='flex-1'>
								<Input
									label='Start Time (24h format)'
									placeholder='e.g., 08'
									value={workOutTimeStart}
									onChangeText={(text) => {
										setWorkOutTimeStart(text.replace(/\D/g, '').slice(0, 2));
										setErrors({ ...errors, workOutTime: '' });
									}}
									keyboardType='number-pad'
								/>
							</View>
							<View className='flex-1'>
								<Input
									label='End Time (24h format)'
									placeholder='e.g., 10'
									value={workOutTimeEnd}
									onChangeText={(text) => {
										setWorkOutTimeEnd(text.replace(/\D/g, '').slice(0, 2));
										setErrors({ ...errors, workOutTime: '' });
									}}
									keyboardType='number-pad'
								/>
							</View>
						</View>
						{errors.workOutTime && (
							<Text className='text-red-500 text-sm mt-1'>
								{errors.workOutTime}
							</Text>
						)}
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
		</FixedView>
	);
};

export default Second;
