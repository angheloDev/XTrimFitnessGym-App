import DatePicker from '@/components/DatePicker';
import FixedView from '@/components/FixedView';
import GradientButton from '@/components/GradientButton';
import Input from '@/components/Input';
import Select from '@/components/Select';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

const genderOptions = [
	{ label: 'Male', value: 'Male' },
	{ label: 'Female', value: 'Female' },
	{ label: 'Prefer not to say', value: 'Prefer not to say' },
];

const First = () => {
	const router = useRouter();
	const { data, updateData } = useOnboarding();

	const [firstName, setFirstName] = useState(data.firstName || '');
	const [lastName, setLastName] = useState(data.lastName || '');
	const [phoneNumber, setPhoneNumber] = useState(data.phoneNumber || '');
	const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(
		data.dateOfBirth
	);
	const [gender, setGender] = useState(data.gender || '');

	const [errors, setErrors] = useState<Record<string, string>>({});

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
		} else {
			const age = new Date().getFullYear() - dateOfBirth.getFullYear();
			if (age < 10) {
				newErrors.dateOfBirth = "You're too young to use this app";
			}
		}

		if (!gender) {
			newErrors.gender = 'Gender is required';
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleContinue = () => {
		if (validateForm()) {
			updateData({
				firstName: firstName.trim(),
				lastName: lastName.trim(),
				phoneNumber: phoneNumber.trim(),
				dateOfBirth,
				gender,
			});
			router.push('/(auth)/(onboarding)/second');
		}
	};

	return (
		<FixedView className='flex-1 bg-bg-darker'>
			<ScrollView
				contentContainerClassName='flex-grow px-5 py-8'
				keyboardShouldPersistTaps='handled'
			>
				<Text className='text-3xl font-bold mb-2 text-text-primary'>
					Personal Information
				</Text>
				<Text className='text-base text-text-secondary mb-8'>
					Let&apos;s start with some basic information about you
				</Text>

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

					<View className='flex-row gap-3 mt-4'>
						<GradientButton
							onPress={() => router.push('/(auth)/login')}
							className='flex-1'
							variant='secondary'
						>
							Back to Login
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

export default First;
