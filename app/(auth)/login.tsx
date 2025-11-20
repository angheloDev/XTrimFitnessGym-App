import FixedView from '@/components/FixedView';
import GradientButton from '@/components/GradientButton';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Text, TextInput, View } from 'react-native';

const Login = () => {
	const { login, isAuthenticated } = useAuth();
	const router = useRouter();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	// Redirect if already authenticated
	React.useEffect(() => {
		if (isAuthenticated) {
			// This will be handled by ProtectedRoute, but we can redirect here too
			router.replace('/(auth)/(onboarding)/first');
		}
	}, [isAuthenticated, router]);

	const handleLogin = async () => {
		if (!email || !password) {
			Alert.alert('Error', 'Please enter both email and password');
			return;
		}

		setIsLoading(true);
		try {
			// TODO: Replace with actual API call to your GraphQL backend
			// For now, this is a mock login that creates a test user
			// You should integrate with your actual authentication API

			// Mock user data - replace with actual API response
			const mockUser = {
				id: '1',
				email: email,
				firstName: 'John',
				lastName: 'Doe',
				role: email.includes('coach')
					? ('coach' as const)
					: ('member' as const),
				onboardingCompleted: false,
			};

			await login(mockUser);

			// Navigate to onboarding
			router.replace('/(auth)/(onboarding)/first');
		} catch (error) {
			Alert.alert(
				'Login Failed',
				'Please check your credentials and try again'
			);
			console.error('Login error:', error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<FixedView className='flex-1 bg-bg-darker'>
			<View className='flex-1 justify-center px-5'>
				<Text className='text-4xl font-bold mb-2.5 text-center text-text-primary'>
					XTrimFit Gym
				</Text>
				<Text className='text-lg text-text-secondary mb-10 text-center'>
					Sign in to your account
				</Text>

				<View className='gap-4'>
					<TextInput
						className='border border-input rounded-lg p-4 text-base bg-input text-text-primary'
						placeholder='Email'
						placeholderTextColor='#6c757d'
						value={email}
						onChangeText={setEmail}
						keyboardType='email-address'
						autoCapitalize='none'
						autoComplete='email'
					/>

					<TextInput
						className='border border-input rounded-lg p-4 text-base bg-input text-text-primary'
						placeholder='Password'
						placeholderTextColor='#6c757d'
						value={password}
						onChangeText={setPassword}
						secureTextEntry
						autoCapitalize='none'
						autoComplete='password'
					/>

					<GradientButton
						onPress={handleLogin}
						loading={isLoading}
						className='mt-2.5'
					>
						{isLoading ? 'Signing in...' : 'Sign In'}
					</GradientButton>
				</View>
			</View>
		</FixedView>
	);
};

export default Login;
