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
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const genderOptions = [
	{ label: 'Male', value: 'Male' },
	{ label: 'Female', value: 'Female' },
	{ label: 'Prefer not to say', value: 'Prefer not to say' },
];

const MemberProfile = () => {
	const { user } = useAuth();
	const router = useRouter();
	const dispatch = useAppDispatch();
	const [isEditing, setIsEditing] = useState(false);

	const [firstName, setFirstName] = useState(user?.firstName || '');
	const [lastName, setLastName] = useState(user?.lastName || '');
	const [email, setEmail] = useState(user?.email || '');
	const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber?.toString() || '');
	const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(
		user?.dateOfBirth ? new Date(user.dateOfBirth) : undefined
	);
	const [gender, setGender] = useState(user?.gender || '');
	const [password, setPassword] = useState('');
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
				// Clear password field
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
		setErrors({});
		setIsEditing(false);
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
