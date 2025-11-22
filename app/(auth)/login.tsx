import FixedView from '@/components/FixedView';
import GradientButton from '@/components/GradientButton';
import Input from '@/components/Input';
import {
	LoginMutation,
	LoginMutationVariables,
} from '@/graphql/generated/types';
import { LOGIN_MUTATION } from '@/graphql/mutations';
import { useAppDispatch } from '@/store/hooks';
import { setUser } from '@/store/slices/userSlice';
import { convertGraphQLUser } from '@/utils/graphql-utils';
import { storage } from '@/utils/storage';
import { useMutation } from '@apollo/client/react';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';

const Login = () => {
	const router = useRouter();
	const dispatch = useAppDispatch();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [emailError, setEmailError] = useState('');
	const [passwordError, setPasswordError] = useState('');

	const [login, { loading }] = useMutation<
		LoginMutation,
		LoginMutationVariables
	>(LOGIN_MUTATION, {
		onCompleted: async (data) => {
			try {
				// Convert GraphQL User to Redux User format (handle null values)
				const user = convertGraphQLUser(data.login.user);
				dispatch(setUser(user));

				// Store token in AsyncStorage as fallback (React Native cookies may not work)
				if (data.login.token) {
					console.log('✅ [Login] Storing token in AsyncStorage');
					await storage.setItem('auth_token', data.login.token);
					console.log('✅ [Login] Token stored successfully');
				} else {
					console.warn('⚠️ [Login] No token received in login response');
				}

				// Small delay to ensure Redux state is updated
				await new Promise((resolve) => setTimeout(resolve, 100));

				// Navigate based on user role
				if (user.role === 'coach') {
					router.replace('/(coach)/dashboard');
				} else if (user.role === 'member') {
					router.replace('/(member)/dashboard');
				} else {
					router.replace('/(auth)/(onboarding)/first');
				}
			} catch (error) {
				console.error('Navigation error:', error);
				Alert.alert(
					'Error',
					'Failed to navigate after login. Please try again.'
				);
			}
		},
		onError: (error) => {
			console.error('Login error:', error);
			Alert.alert(
				'Login Failed',
				error.message || 'Please check your credentials and try again'
			);
		},
	});

	const validateForm = () => {
		let isValid = true;
		setEmailError('');
		setPasswordError('');

		if (!email.trim()) {
			setEmailError('Email is required');
			isValid = false;
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			setEmailError('Please enter a valid email');
			isValid = false;
		}

		if (!password) {
			setPasswordError('Password is required');
			isValid = false;
		} else if (password.length < 6) {
			setPasswordError('Password must be at least 6 characters');
			isValid = false;
		}

		return isValid;
	};

	const handleLogin = async () => {
		if (!validateForm()) {
			return;
		}

		try {
			await login({
				variables: {
					input: {
						email: email.trim(),
						password,
					},
				},
			});
		} catch {
			// Error is handled in onError callback
		}
	};

	return (
		<FixedView className='flex-1 bg-bg-darker'>
			<ScrollView
				contentContainerClassName='flex-grow justify-center px-5 py-8'
				keyboardShouldPersistTaps='handled'
			>
				<View className='items-center mb-6'>
					<Image
						source={require('@/assets/logos/XTFG_logo.PNG')}
						style={{ width: 200, height: 100 }}
						contentFit='contain'
					/>
				</View>
				<Text className='text-lg text-text-secondary mb-10 text-center'>
					Sign in to your account
				</Text>

				<View className='gap-4'>
					<Input
						label='Email'
						placeholder='Enter your email'
						value={email}
						onChangeText={(text) => {
							setEmail(text);
							setEmailError('');
						}}
						keyboardType='email-address'
						autoCapitalize='none'
						autoComplete='email'
						error={emailError}
					/>

					<Input
						label='Password'
						placeholder='Enter your password'
						value={password}
						onChangeText={(text) => {
							setPassword(text);
							setPasswordError('');
						}}
						secureTextEntry
						autoCapitalize='none'
						autoComplete='password'
						error={passwordError}
					/>

					<GradientButton
						onPress={handleLogin}
						loading={loading}
						className='mt-2.5'
					>
						{loading ? 'Logging in...' : 'Log in'}
					</GradientButton>

					<View className='mt-6 flex-row justify-center items-center'>
						<Text className='text-text-secondary mr-2'>
							Don&apos;t have an account yet?
						</Text>
						<TouchableOpacity
							onPress={() => router.push('/(auth)/(onboarding)/first')}
						>
							<Text className='text-[#F9C513] font-semibold'>Sign up</Text>
						</TouchableOpacity>
					</View>
				</View>
			</ScrollView>
		</FixedView>
	);
};

export default Login;
