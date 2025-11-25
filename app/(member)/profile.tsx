import DatePicker from '@/components/DatePicker';
import FixedView from '@/components/FixedView';
import GradientButton from '@/components/GradientButton';
import Input from '@/components/Input';
import Select from '@/components/Select';
import TabHeader from '@/components/TabHeader';
import TimePicker from '@/components/TimePicker';
import { useAuth } from '@/contexts/AuthContext';
import { UPDATE_USER_MUTATION } from '@/graphql/mutations';
import { useAppDispatch } from '@/store/hooks';
import { setUser } from '@/store/slices/userSlice';
import { convertGraphQLUser } from '@/utils/graphql-utils';
import { formatTimeRangeTo12Hour } from '@/utils/time-utils';
import { useMutation } from '@apollo/client/react';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';

// Note: UpdateUserMutation types may need to be regenerated
// Using any for now until GraphQL codegen is run
type UpdateUserMutation = any;
type UpdateUserMutationVariables = any;

const physiqueGoalTypeOptions = [
	{ label: 'Ectomorph (lean build, hard to gain muscle)', value: 'Ectomorph' },
	{
		label: 'Mesomorph (naturally athletic, builds muscle easily)',
		value: 'Mesomorph',
	},
	{ label: 'Endomorph (bulky build, gains weight easily)', value: 'Endomorph' },
];

const fitnessGoalOptions = [
	{ label: 'Weight loss', value: 'Weight loss' },
	{ label: 'Muscle building', value: 'Muscle building' },
	{ label: 'General fitness', value: 'General fitness' },
	{ label: 'Strength training', value: 'Strength training' },
	{ label: 'Endurance', value: 'Endurance' },
	{ label: 'Flexibility', value: 'Flexibility' },
	{ label: 'Athletic Performance', value: 'Athletic Performance' },
	{ label: 'Rehabilitation', value: 'Rehabilitation' },
];

const MemberProfile = () => {
	const { user } = useAuth();
	// const router = useRouter(); // Unused for now
	const dispatch = useAppDispatch();
	const [isEditing, setIsEditing] = useState(false);
	const [isEditingCredentials, setIsEditingCredentials] = useState(false);

	const [firstName, setFirstName] = useState(user?.firstName || '');
	const [middleName, setMiddleName] = useState(user?.middleName || '');
	const [lastName, setLastName] = useState(user?.lastName || '');
	const [phoneNumber, setPhoneNumber] = useState(
		user?.phoneNumber?.toString() || ''
	);
	const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(
		user?.dateOfBirth ? new Date(user.dateOfBirth) : undefined
	);

	// Parse workout time
	const parseWorkoutTime = (timeStr?: (string | null)[] | null) => {
		if (!timeStr || timeStr.length === 0)
			return { start: undefined, end: undefined };
		const timeRange = timeStr[0];
		if (timeRange && timeRange.includes('-')) {
			const [start, end] = timeRange.split('-');
			const startHour = parseInt(start);
			const endHour = parseInt(end);
			const startDate = new Date();
			startDate.setHours(startHour, 0, 0, 0);
			const endDate = new Date();
			endDate.setHours(endHour, 0, 0, 0);
			return { start: startDate, end: endDate };
		}
		return { start: undefined, end: undefined };
	};

	const initialWorkoutTime = parseWorkoutTime(
		user?.membershipDetails?.workOutTime as (string | null)[] | undefined
	);
	const [workOutTimeStart, setWorkOutTimeStart] = useState<Date | undefined>(
		initialWorkoutTime.start
	);
	const [workOutTimeEnd, setWorkOutTimeEnd] = useState<Date | undefined>(
		initialWorkoutTime.end
	);
	const [physiqueGoalType, setPhysiqueGoalType] = useState(
		user?.membershipDetails?.physiqueGoalType || ''
	);
	const [fitnessGoal, setFitnessGoal] = useState<string[]>(
		user?.membershipDetails?.fitnessGoal || []
	);

	// Credentials section
	const [email, setEmail] = useState(user?.email || '');
	const [password, setPassword] = useState('');
	const [currentPassword, setCurrentPassword] = useState('');
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [credentialErrors, setCredentialErrors] = useState<
		Record<string, string>
	>({});

	const [updateUserMutation, { loading }] = useMutation<
		UpdateUserMutation,
		UpdateUserMutationVariables
	>(UPDATE_USER_MUTATION, {
		onCompleted: (data) => {
			if (data.updateUser) {
				// Convert GraphQL User to Redux User format and update entire user object
				const updatedUser = convertGraphQLUser(data.updateUser);
				dispatch(setUser(updatedUser));
				setIsEditing(false);
				setIsEditingCredentials(false);
				Alert.alert('Success', 'Profile updated successfully!');
				// Clear password fields
				setPassword('');
				setCurrentPassword('');
			}
		},
		onError: (error) => {
			Alert.alert('Error', error.message);
		},
	});

	const validateForm = () => {
		const newErrors: Record<string, string> = {};

		if (!firstName.trim()) {
			newErrors.firstName = 'First name is required';
		}

		if (!lastName.trim()) {
			newErrors.lastName = 'Last name is required';
		}

		if (!phoneNumber.trim()) {
			newErrors.phoneNumber = 'Phone number is required';
		} else if (!/^\d{10,15}$/.test(phoneNumber.replace(/\D/g, ''))) {
			newErrors.phoneNumber = 'Please enter a valid phone number';
		}

		if (!dateOfBirth) {
			newErrors.dateOfBirth = 'Date of birth is required';
		}

		if (!physiqueGoalType) {
			newErrors.physiqueGoalType = 'Physique goal type is required';
		}

		if (fitnessGoal.length === 0) {
			newErrors.fitnessGoal = 'Please select at least one fitness goal';
		}

		if (!workOutTimeStart || !workOutTimeEnd) {
			newErrors.workOutTime = 'Workout time range is required';
		} else {
			const startHours =
				workOutTimeStart.getHours() * 60 + workOutTimeStart.getMinutes();
			const endHours =
				workOutTimeEnd.getHours() * 60 + workOutTimeEnd.getMinutes();
			if (startHours >= endHours) {
				newErrors.workOutTime = 'End time must be after start time';
			}
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const validateCredentials = () => {
		const newErrors: Record<string, string> = {};

		if (!email.trim()) {
			newErrors.email = 'Email is required';
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			newErrors.email = 'Please enter a valid email';
		}

		if (password) {
			if (!currentPassword) {
				newErrors.currentPassword =
					'Current password is required to change password';
			}
			if (password.length < 6) {
				newErrors.password = 'Password must be at least 6 characters';
			}
		}

		setCredentialErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSave = () => {
		if (!validateForm() || !user?.id) return;

		// Build membershipDetails object, preserving existing fields
		const membershipDetailsInput: any = {
			// Update editable fields
			physiqueGoalType,
			workOutTime:
				workOutTimeStart && workOutTimeEnd
					? [`${workOutTimeStart.getHours()}-${workOutTimeEnd.getHours()}`]
					: user?.membershipDetails?.workOutTime || [],
			fitnessGoal: fitnessGoal,
			hasEnteredDetails: user?.membershipDetails?.hasEnteredDetails ?? true, // Preserve onboarding status
		};

		// Only include membershipId and coachesIds if they exist (preserve them)
		if (user?.membershipDetails?.membershipId) {
			membershipDetailsInput.membershipId = user.membershipDetails.membershipId;
		}
		if (
			user?.membershipDetails?.coachesIds &&
			user.membershipDetails.coachesIds.length > 0
		) {
			membershipDetailsInput.coachesIds = user.membershipDetails.coachesIds;
		}

		const input: any = {
			firstName: firstName.trim(),
			middleName: middleName.trim() || undefined,
			lastName: lastName.trim(),
			phoneNumber: phoneNumber.trim(),
			dateOfBirth: dateOfBirth?.toISOString(),
			membershipDetails: membershipDetailsInput,
		};

		updateUserMutation({
			variables: {
				id: user.id,
				input,
			},
		});
	};

	const handleSaveCredentials = () => {
		if (!validateCredentials() || !user?.id) return;

		const input: any = {
			email: email.trim(),
		};

		if (password) {
			input.password = password;
			input.currentPassword = currentPassword;
		}

		updateUserMutation({
			variables: {
				id: user.id,
				input,
			},
		});
	};

	const handleCancel = () => {
		// Reset form to original values
		setFirstName(user?.firstName || '');
		setMiddleName(user?.middleName || '');
		setLastName(user?.lastName || '');
		setPhoneNumber(user?.phoneNumber?.toString() || '');
		setDateOfBirth(user?.dateOfBirth ? new Date(user.dateOfBirth) : undefined);
		const workoutTime = parseWorkoutTime(
			user?.membershipDetails?.workOutTime as (string | null)[] | undefined
		);
		setWorkOutTimeStart(workoutTime.start);
		setWorkOutTimeEnd(workoutTime.end);
		setPhysiqueGoalType(user?.membershipDetails?.physiqueGoalType || '');
		setFitnessGoal(user?.membershipDetails?.fitnessGoal || []);
		setErrors({});
		setIsEditing(false);
	};

	const handleCancelCredentials = () => {
		setEmail(user?.email || '');
		setPassword('');
		setCurrentPassword('');
		setCredentialErrors({});
		setIsEditingCredentials(false);
	};

	return (
		<FixedView className='flex-1 bg-bg-darker'>
			<TabHeader showCoachIcon={true} />
			<ScrollView
				className='flex-1'
				contentContainerClassName='p-5'
				showsVerticalScrollIndicator={false}
			>
				<View className='flex-row items-center justify-between mb-6'>
					<View>
						<Text className='text-3xl font-bold text-text-primary'>
							Profile
						</Text>
						<Text className='text-text-secondary mt-1'>
							Manage your account details
						</Text>
					</View>
					{!isEditing && (
						<TouchableOpacity
							onPress={() => setIsEditing(true)}
							className='flex-row items-center bg-bg-primary px-4 py-2 rounded-lg'
						>
							<Ionicons name='create-outline' size={20} color='#F9C513' />
							<Text className='text-[#F9C513] font-semibold ml-2'>Edit</Text>
						</TouchableOpacity>
					)}
				</View>

				<View className='items-center mb-6'>
					<View className='bg-[#F9C513] rounded-full w-24 h-24 items-center justify-center mb-4'>
						<Text className='text-bg-darker font-bold text-3xl'>
							{firstName.charAt(0) || user?.firstName?.charAt(0)}
							{lastName.charAt(0) || user?.lastName?.charAt(0)}
						</Text>
					</View>
					<Text className='text-2xl font-bold text-text-primary'>
						{firstName || user?.firstName} {lastName || user?.lastName}
					</Text>
					<Text className='text-text-secondary mt-1'>
						{email || user?.email}
					</Text>
				</View>

				{isEditing ? (
					<View className='gap-4'>
						<Input
							label='First Name'
							placeholder='Enter your first name'
							value={firstName}
							onChangeText={(text) => {
								setFirstName(text);
								setErrors({ ...errors, firstName: '' });
							}}
							autoCapitalize='words'
							error={errors.firstName}
						/>

						<Input
							label='Middle Name'
							placeholder='Enter your middle name (optional)'
							value={middleName}
							onChangeText={(text) => {
								setMiddleName(text);
							}}
							autoCapitalize='words'
						/>

						<Input
							label='Last Name'
							placeholder='Enter your last name'
							value={lastName}
							onChangeText={(text) => {
								setLastName(text);
								setErrors({ ...errors, lastName: '' });
							}}
							autoCapitalize='words'
							error={errors.lastName}
						/>

						<Input
							label='Phone Number'
							placeholder='Enter your phone number'
							value={phoneNumber}
							onChangeText={(text) => {
								setPhoneNumber(text);
								setErrors({ ...errors, phoneNumber: '' });
							}}
							keyboardType='phone-pad'
							error={errors.phoneNumber}
						/>

						<DatePicker
							label='Date of Birth'
							value={dateOfBirth}
							onChange={(date) => {
								setDateOfBirth(date);
								setErrors({ ...errors, dateOfBirth: '' });
							}}
							maximumDate={new Date()}
							minimumDate={new Date(1900, 0, 1)}
							error={errors.dateOfBirth}
						/>

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
								Fitness Goals (Select all that apply) *
							</Text>
							<View className='flex-row flex-wrap gap-2'>
								{fitnessGoalOptions.map((option) => {
									const isSelected = fitnessGoal.includes(option.value);
									return (
										<TouchableOpacity
											key={option.value}
											onPress={() => {
												if (isSelected) {
													setFitnessGoal(
														fitnessGoal.filter((g) => g !== option.value)
													);
												} else {
													setFitnessGoal([...fitnessGoal, option.value]);
												}
												setErrors({ ...errors, fitnessGoal: '' });
											}}
											className={`px-4 py-2 rounded-lg border-2 ${
												isSelected
													? 'bg-[#F9C513]/20 border-[#F9C513]'
													: 'bg-bg-darker border-bg-primary'
											}`}
										>
											<View className='flex-row items-center'>
												{isSelected && (
													<Ionicons
														name='checkmark-circle'
														size={18}
														color='#F9C513'
														style={{ marginRight: 6 }}
													/>
												)}
												<Text
													className={`font-medium ${
														isSelected
															? 'text-[#F9C513]'
															: 'text-text-secondary'
													}`}
												>
													{option.label}
												</Text>
											</View>
										</TouchableOpacity>
									);
								})}
							</View>
							{errors.fitnessGoal && (
								<Text className='text-red-500 text-sm mt-1'>
									{errors.fitnessGoal}
								</Text>
							)}
						</View>

						<View>
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
									/>
								</View>
							</View>
						</View>

						<View className='flex-row gap-3 mt-4'>
							<GradientButton
								onPress={handleCancel}
								variant='secondary'
								style={{ flex: 1 }}
								disabled={loading}
							>
								Cancel
							</GradientButton>
							<GradientButton
								onPress={handleSave}
								loading={loading}
								style={{ flex: 1 }}
							>
								{loading ? 'Saving...' : 'Save Changes'}
							</GradientButton>
						</View>
					</View>
				) : (
					<>
						<View className='bg-bg-primary rounded-xl p-5 mb-4'>
							<View className='flex-row items-center justify-between mb-4'>
								<Text className='text-xl font-semibold text-text-primary'>
									Personal Information
								</Text>
							</View>
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
							{user?.membershipDetails?.physiqueGoalType && (
								<View className='mb-3'>
									<Text className='text-text-secondary text-sm mb-1'>
										Physique Goal Type
									</Text>
									<Text className='text-text-primary font-medium'>
										{user.membershipDetails.physiqueGoalType}
									</Text>
								</View>
							)}
							{user?.membershipDetails?.workOutTime &&
								user.membershipDetails.workOutTime.length > 0 && (
									<View>
										<Text className='text-text-secondary text-sm mb-1'>
											Preferred Workout Time
										</Text>
										<Text className='text-text-primary font-medium'>
											{formatTimeRangeTo12Hour(user.membershipDetails.workOutTime[0])}
										</Text>
									</View>
								)}
						</View>

						<View className='bg-bg-primary rounded-xl p-5 mb-4'>
							<View className='flex-row items-center justify-between mb-4'>
								<Text className='text-xl font-semibold text-text-primary'>
									Account Credentials
								</Text>
								<TouchableOpacity
									onPress={() => setIsEditingCredentials(true)}
									className='flex-row items-center'
								>
									<Ionicons name='create-outline' size={18} color='#F9C513' />
									<Text className='text-[#F9C513] font-semibold ml-1'>
										Edit
									</Text>
								</TouchableOpacity>
							</View>
							<View className='mb-3'>
								<Text className='text-text-secondary text-sm mb-1'>Email</Text>
								<Text className='text-text-primary font-medium'>
									{user?.email || 'Not provided'}
								</Text>
							</View>
							<View>
								<Text className='text-text-secondary text-sm mb-1'>
									Password
								</Text>
								<Text className='text-text-primary font-medium'>••••••••</Text>
							</View>
						</View>

						{isEditingCredentials && (
							<View className='bg-bg-primary rounded-xl p-5 mb-4 gap-4'>
								<Text className='text-xl font-semibold text-text-primary mb-2'>
									Edit Credentials
								</Text>
								<Input
									label='Email'
									placeholder='Enter your email'
									value={email}
									onChangeText={(text) => {
										setEmail(text);
										setCredentialErrors({ ...credentialErrors, email: '' });
									}}
									keyboardType='email-address'
									autoCapitalize='none'
									autoComplete='email'
									error={credentialErrors.email}
								/>

								<Input
									label='Current Password'
									placeholder='Enter your current password'
									value={currentPassword}
									onChangeText={(text) => {
										setCurrentPassword(text);
										setCredentialErrors({
											...credentialErrors,
											currentPassword: '',
										});
									}}
									secureTextEntry
									autoCapitalize='none'
									error={credentialErrors.currentPassword}
								/>

								<Input
									label='New Password (optional)'
									placeholder='Enter new password (leave blank to keep current)'
									value={password}
									onChangeText={(text) => {
										setPassword(text);
										setCredentialErrors({ ...credentialErrors, password: '' });
									}}
									secureTextEntry
									autoCapitalize='none'
									autoComplete='password-new'
									error={credentialErrors.password}
								/>

								<View className='flex-row gap-3 mt-2'>
									<GradientButton
										onPress={handleCancelCredentials}
										variant='secondary'
										style={{ flex: 1 }}
										disabled={loading}
									>
										Cancel
									</GradientButton>
									<GradientButton
										onPress={handleSaveCredentials}
										loading={loading}
										style={{ flex: 1 }}
									>
										{loading ? 'Saving...' : 'Save Changes'}
									</GradientButton>
								</View>
							</View>
						)}

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
					</>
				)}
			</ScrollView>
		</FixedView>
	);
};

export default MemberProfile;
