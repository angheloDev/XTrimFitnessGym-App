import FixedView from '@/components/FixedView';
import GradientButton from '@/components/GradientButton';
import Input from '@/components/Input';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	Text,
	View,
} from 'react-native';

const Third = () => {
	const router = useRouter();
	const { data, updateData } = useOnboarding();

	const [email, setEmail] = useState(data.email || '');
	const [password, setPassword] = useState(data.password || '');
	const [confirmPassword, setConfirmPassword] = useState('');

	const [errors, setErrors] = useState<Record<string, string>>({});

	const validateForm = () => {
		const newErrors: Record<string, string> = {};

		if (!email.trim()) {
			newErrors.email = 'Email is required';
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			newErrors.email = 'Please enter a valid email';
		}

		if (!password) {
			newErrors.password = 'Password is required';
		} else if (password.length < 6) {
			newErrors.password = 'Password must be at least 6 characters';
		}

		if (!confirmPassword) {
			newErrors.confirmPassword = 'Please confirm your password';
		} else if (password !== confirmPassword) {
			newErrors.confirmPassword = 'Passwords do not match';
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleContinue = () => {
		if (validateForm()) {
			updateData({
				email: email.trim(),
				password,
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
				>
				<Text className='text-3xl font-bold mb-2 text-text-primary'>
					Account Details
				</Text>
				<Text className='text-base text-text-secondary mb-8'>
					Create your account credentials
				</Text>

				<View className='gap-4'>
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
						label='Password'
						placeholder='Create a password'
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

					<Input
						label='Confirm Password'
						placeholder='Confirm your password'
						value={confirmPassword}
						onChangeText={(text) => {
							setConfirmPassword(text);
							setErrors({ ...errors, confirmPassword: '' });
						}}
						secureTextEntry
						autoCapitalize='none'
						autoComplete='password-new'
						error={errors.confirmPassword}
					/>

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

export default Third;
