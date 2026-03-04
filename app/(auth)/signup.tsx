import FixedView from '@/components/FixedView';
import GradientButton from '@/components/GradientButton';
import Input from '@/components/Input';
import {
	CreateUserMutation,
	CreateUserMutationVariables,
	RoleType,
} from '@/graphql/generated/types';
import { CREATE_USER_MUTATION } from '@/graphql/mutations';
import { useAppDispatch } from '@/store/hooks';
import { setUser } from '@/store/slices/userSlice';
import { convertGraphQLUser } from '@/utils/graphql-utils';
import { storage } from '@/utils/storage';
import { useMutation } from '@apollo/client/react';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
	Alert,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';

const SignUp = () => {
	const router = useRouter();
	const dispatch = useAppDispatch();
	const [firstName, setFirstName] = useState('');
	const [middleName, setMiddleName] = useState('');
	const [lastName, setLastName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');

	const [errors, setErrors] = useState<Record<string, string>>({});

	const [createUser, { loading }] = useMutation<
		CreateUserMutation,
		CreateUserMutationVariables
	>(CREATE_USER_MUTATION, {
		onCompleted: async (data) => {
			try {
				// Convert GraphQL User to Redux User format
				const user = convertGraphQLUser(data.createUser.user);
				dispatch(setUser(user));

				// Store token in AsyncStorage
				if (data.createUser.token) {
					console.log('✅ [Signup] Storing token in AsyncStorage');
					await storage.setItem('auth_token', data.createUser.token);
					console.log('✅ [Signup] Token stored successfully');
				} else {
					console.warn('⚠️ [Signup] No token received in signup response');
				}

				// Let AuthLayout handle the redirect automatically
				// It will redirect members without hasEnteredDetails to onboarding
			} catch (error) {
				console.error('Signup completion error:', error);
				Alert.alert(
					'Error',
					'Account created successfully, but failed to save session. Please try logging in.'
				);
			}
		},
		onError: (error) => {
			console.error('Signup error:', error);
			Alert.alert(
				'Sign Up Failed',
				error.message || 'Something went wrong. Please try again.'
			);
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

	const handleSignUp = async () => {
		if (!validateForm()) {
			return;
		}

		try {
			await createUser({
				variables: {
					input: {
						firstName: firstName.trim(),
						middleName: middleName.trim() || undefined,
						lastName: lastName.trim(),
						email: email.trim(),
						password,
						role: 'member' as RoleType, // Default to member for signup
					},
				},
			});
		} catch {
			// Error is handled in onError callback
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
					contentContainerClassName='flex-grow justify-center px-5 py-8'
					keyboardShouldPersistTaps='handled'
					showsVerticalScrollIndicator={false}
					scrollEnabled={!loading}
				>
					<View className='items-center mb-6'>
						<Image
							// eslint-disable-next-line @typescript-eslint/no-require-imports
							source={require('@/assets/logos/XTFG_logo.png')}
							style={{ width: 200, height: 100 }}
							contentFit='contain'
						/>
					</View>
					<Text className='text-lg text-text-secondary mb-10 text-center'>
						Create your account
					</Text>

					<View className='gap-4' pointerEvents={loading ? 'none' : 'auto'}>
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
							editable={!loading}
						/>

						<Input
							label='Middle Name'
							placeholder='Enter your middle name (optional)'
							value={middleName}
							onChangeText={(text) => {
								setMiddleName(text);
							}}
							autoCapitalize='words'
							editable={!loading}
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
							editable={!loading}
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
							editable={!loading}
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
							editable={!loading}
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
							editable={!loading}
						/>

						<GradientButton
							onPress={handleSignUp}
							loading={loading}
							className='mt-2.5'
							disabled={loading}
						>
							{loading ? 'Loading...' : 'Sign Up'}
						</GradientButton>

						<View className='mt-6 flex-row justify-center items-center'>
							<Text className='text-text-secondary mr-2'>
								Already have an account?
							</Text>
							<TouchableOpacity onPress={() => router.push('/(auth)/login')}>
								<Text className='text-[#F9C513] font-semibold'>Log in</Text>
							</TouchableOpacity>
						</View>
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</FixedView>
	);
};

export default SignUp;
