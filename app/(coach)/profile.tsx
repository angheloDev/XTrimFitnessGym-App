import DatePicker from '@/components/DatePicker';
import FixedView from '@/components/FixedView';
import GradientButton from '@/components/GradientButton';
import Input from '@/components/Input';
import Select from '@/components/Select';
import TabHeader from '@/components/TabHeader';
import { useAuth } from '@/contexts/AuthContext';
import {
	UpdateUserMutation,
	UpdateUserMutationVariables,
} from '@/graphql/generated/types';
import { UPDATE_USER_MUTATION } from '@/graphql/mutations';
import { useAppDispatch } from '@/store/hooks';
import { updateUser } from '@/store/slices/userSlice';
import { useMutation } from '@apollo/client/react';
import React, { useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const genderOptions = [
	{ label: 'Male', value: 'Male' },
	{ label: 'Female', value: 'Female' },
	{ label: 'Prefer not to say', value: 'Prefer not to say' },
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

const dayOptions = [
	{ label: 'Monday', value: 'Monday' },
	{ label: 'Tuesday', value: 'Tuesday' },
	{ label: 'Wednesday', value: 'Wednesday' },
	{ label: 'Thursday', value: 'Thursday' },
	{ label: 'Friday', value: 'Friday' },
	{ label: 'Saturday', value: 'Saturday' },
	{ label: 'Sunday', value: 'Sunday' },
];

const timeOptions = [
	{ label: 'Morning (6 AM - 12 PM)', value: 'Morning (6 AM - 12 PM)' },
	{ label: 'Afternoon (12 PM - 6 PM)', value: 'Afternoon (12 PM - 6 PM)' },
	{ label: 'Evening (6 PM - 10 PM)', value: 'Evening (6 PM - 10 PM)' },
];

const CoachProfile = () => {
	const { user } = useAuth();
	const dispatch = useAppDispatch();
	const [isEditing, setIsEditing] = useState(false);

	const [firstName, setFirstName] = useState(user?.firstName || '');
	const [lastName, setLastName] = useState(user?.lastName || '');
	const [email, setEmail] = useState(user?.email || '');
	const [phoneNumber, setPhoneNumber] = useState(
		user?.phoneNumber?.toString() || ''
	);
	const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(
		user?.dateOfBirth ? new Date(user.dateOfBirth) : undefined
	);
	const [gender, setGender] = useState(user?.gender || '');
	const [password, setPassword] = useState('');
	const [specializations, setSpecializations] = useState<string[]>(
		user?.coachDetails?.specialization || []
	);
	const [yearsOfExperience, setYearsOfExperience] = useState(
		user?.coachDetails?.yearsOfExperience?.toString() || ''
	);
	const [moreDetails, setMoreDetails] = useState(
		user?.coachDetails?.moreDetails || ''
	);
	const [teachingDates, setTeachingDates] = useState<string[]>(
		user?.coachDetails?.teachingDate || []
	);
	const [teachingTimes, setTeachingTimes] = useState<string[]>(
		user?.coachDetails?.teachingTime || []
	);
	const [clientLimit, setClientLimit] = useState(
		user?.coachDetails?.clientLimit?.toString() || ''
	);

	const [errors, setErrors] = useState<Record<string, string>>({});

	const [updateUserMutation, { loading }] = useMutation<
		UpdateUserMutation,
		UpdateUserMutationVariables
	>(UPDATE_USER_MUTATION, {
		onCompleted: (data) => {
			if (data.updateUser) {
				dispatch(updateUser(data.updateUser));
				setIsEditing(false);
				Alert.alert('Success', 'Profile updated successfully!');
				setPassword('');
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

		if (!email.trim()) {
			newErrors.email = 'Email is required';
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			newErrors.email = 'Please enter a valid email';
		}

		if (!phoneNumber.trim()) {
			newErrors.phoneNumber = 'Phone number is required';
		} else if (!/^\d{10,15}$/.test(phoneNumber.replace(/\D/g, ''))) {
			newErrors.phoneNumber = 'Please enter a valid phone number';
		}

		if (!dateOfBirth) {
			newErrors.dateOfBirth = 'Date of birth is required';
		}

		if (!gender) {
			newErrors.gender = 'Gender is required';
		}

		if (specializations.length === 0) {
			newErrors.specializations = 'At least one specialization is required';
		}

		if (password && password.length < 6) {
			newErrors.password = 'Password must be at least 6 characters';
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSave = () => {
		if (!validateForm() || !user?.id) return;

		const input: any = {
			firstName: firstName.trim(),
			lastName: lastName.trim(),
			email: email.trim(),
			phoneNumber: phoneNumber.trim(),
			dateOfBirth: dateOfBirth?.toISOString(),
			gender,
			coachDetails: {
				specialization: specializations,
				yearsOfExperience: yearsOfExperience
					? parseInt(yearsOfExperience)
					: undefined,
				moreDetails: moreDetails.trim() || undefined,
				teachingDate: teachingDates.length > 0 ? teachingDates : undefined,
				teachingTime: teachingTimes.length > 0 ? teachingTimes : undefined,
				clientLimit: clientLimit ? parseInt(clientLimit) : undefined,
			},
		};

		if (password) {
			input.password = password;
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
		setLastName(user?.lastName || '');
		setEmail(user?.email || '');
		setPhoneNumber(user?.phoneNumber?.toString() || '');
		setDateOfBirth(user?.dateOfBirth ? new Date(user.dateOfBirth) : undefined);
		setGender(user?.gender || '');
		setPassword('');
		setSpecializations(user?.coachDetails?.specialization || []);
		setYearsOfExperience(
			user?.coachDetails?.yearsOfExperience?.toString() || ''
		);
		setMoreDetails(user?.coachDetails?.moreDetails || '');
		setTeachingDates(user?.coachDetails?.teachingDate || []);
		setTeachingTimes(user?.coachDetails?.teachingTime || []);
		setClientLimit(user?.coachDetails?.clientLimit?.toString() || '');
		setErrors({});
		setIsEditing(false);
	};

	const toggleSpecialization = (goal: string) => {
		setSpecializations((prev) => {
			if (prev.includes(goal)) {
				return prev.filter((g) => g !== goal);
			}
			return [...prev, goal];
		});
		setErrors({ ...errors, specializations: '' });
	};

	const toggleTeachingDate = (day: string) => {
		setTeachingDates((prev) => {
			if (prev.includes(day)) {
				return prev.filter((d) => d !== day);
			}
			return [...prev, day];
		});
	};

	const toggleTeachingTime = (time: string) => {
		setTeachingTimes((prev) => {
			if (prev.includes(time)) {
				return prev.filter((t) => t !== time);
			}
			return [...prev, time];
		});
	};

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
						<Text className='text-3xl font-bold text-text-primary'>Profile</Text>
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
						Coach {firstName || user?.firstName} {lastName || user?.lastName}
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
							label='Email'
							placeholder='Enter your email'
							value={email}
							onChangeText={(text) => {
								setEmail(text);
								setErrors({ ...errors, email: '' });
							}}
							keyboardType='email-address'
							autoCapitalize='none'
							autoComplete='email'
							error={errors.email}
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
							label='Gender'
							options={genderOptions}
							value={gender}
							onChange={(value) => {
								setGender(value);
								setErrors({ ...errors, gender: '' });
							}}
							placeholder='Select your gender'
							error={errors.gender}
						/>

						<Input
							label='Password (optional)'
							placeholder='Enter new password (leave blank to keep current)'
							value={password}
							onChangeText={(text) => {
								setPassword(text);
								setErrors({ ...errors, password: '' });
							}}
							secureTextEntry
							autoCapitalize='none'
							autoComplete='password-new'
							error={errors.password}
						/>

						{/* Coach Details Section */}
						<View className='border-t border-bg-primary pt-4 mt-2'>
							<Text className='text-xl font-semibold text-text-primary mb-4'>
								Coach Information
							</Text>

							<View className='mb-4'>
								<Text className='text-text-primary font-semibold mb-2'>
									Specializations *
								</Text>
								<View className='flex-row flex-wrap gap-2'>
									{fitnessGoalOptions.map((option) => {
										const isSelected = specializations.includes(option.value);
										return (
											<TouchableOpacity
												key={option.value}
												onPress={() => toggleSpecialization(option.value)}
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
								{errors.specializations && (
									<Text className='text-red-500 text-sm mt-1'>
										{errors.specializations}
									</Text>
								)}
							</View>

							<Input
								label='Years of Experience'
								placeholder='Enter years of experience'
								value={yearsOfExperience}
								onChangeText={setYearsOfExperience}
								keyboardType='number-pad'
							/>

							<Input
								label='Bio / More Details'
								placeholder='Tell clients about yourself...'
								value={moreDetails}
								onChangeText={setMoreDetails}
								multiline
								numberOfLines={4}
							/>

							<View className='mb-4'>
								<Text className='text-text-primary font-semibold mb-2'>
									Teaching Days
								</Text>
								<View className='flex-row flex-wrap gap-2'>
									{dayOptions.map((option) => {
										const isSelected = teachingDates.includes(option.value);
										return (
											<TouchableOpacity
												key={option.value}
												onPress={() => toggleTeachingDate(option.value)}
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
							</View>

							<View className='mb-4'>
								<Text className='text-text-primary font-semibold mb-2'>
									Teaching Times
								</Text>
								<View className='flex-row flex-wrap gap-2'>
									{timeOptions.map((option) => {
										const isSelected = teachingTimes.includes(option.value);
										return (
											<TouchableOpacity
												key={option.value}
												onPress={() => toggleTeachingTime(option.value)}
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
							</View>

							<Input
								label='Client Limit'
								placeholder='Maximum number of clients (e.g., 10)'
								value={clientLimit}
								onChangeText={setClientLimit}
								keyboardType='number-pad'
							/>
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
								{user.coachDetails.moreDetails && (
									<View className='mb-4'>
										<Text className='text-text-secondary text-sm mb-1'>Bio</Text>
										<Text className='text-text-primary font-medium'>
											{user.coachDetails.moreDetails}
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
					</>
				)}
			</ScrollView>
		</FixedView>
	);
};

export default CoachProfile;
