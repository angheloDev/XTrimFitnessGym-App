import Checkbox from '@/components/Checkbox';
import FixedView from '@/components/FixedView';
import GradientButton from '@/components/GradientButton';
import { useOnboarding } from '@/contexts/OnboardingContext';
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
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Linking, ScrollView, Text, View } from 'react-native';

const Fourth = () => {
	const router = useRouter();
	const dispatch = useAppDispatch();
	const { data, clearData } = useOnboarding();

	const [agreedToTermsAndConditions, setAgreedToTermsAndConditions] = useState(
		data.agreedToTermsAndConditions || false
	);
	const [agreedToPrivacyPolicy, setAgreedToPrivacyPolicy] = useState(
		data.agreedToPrivacyPolicy || false
	);
	const [agreedToLiabilityWaiver, setAgreedToLiabilityWaiver] = useState(
		data.agreedToLiabilityWaiver || false
	);

	const [createUser, { loading }] = useMutation<
		CreateUserMutation,
		CreateUserMutationVariables
	>(CREATE_USER_MUTATION, {
		onCompleted: async (data) => {
			// Convert GraphQL User to Redux User format (handle null values)
			const user = convertGraphQLUser(data.createUser.user);
			dispatch(setUser(user));

			// Store token in AsyncStorage as fallback (React Native cookies may not work)
			if (data.createUser.token) {
				console.log('✅ [Signup] Storing token in AsyncStorage');
				await storage.setItem('auth_token', data.createUser.token);
				console.log('✅ [Signup] Token stored successfully');
			} else {
				console.warn('⚠️ [Signup] No token received in signup response');
			}

			clearData();
			// Navigate based on user role
			if (user.role === 'coach') {
				router.replace('/(coach)/dashboard');
			} else {
				router.replace('/(member)/dashboard');
			}
		},
		onError: (error) => {
			Alert.alert(
				'Sign Up Failed',
				error.message || 'Something went wrong. Please try again.'
			);
		},
	});

	const handleSignUp = async () => {
		if (
			!agreedToTermsAndConditions ||
			!agreedToPrivacyPolicy ||
			!agreedToLiabilityWaiver
		) {
			Alert.alert(
				'Required Agreements',
				'Please agree to all terms and conditions to continue.'
			);
			return;
		}

		if (!data.firstName || !data.lastName || !data.email || !data.password) {
			Alert.alert('Error', 'Please complete all previous steps.');
			return;
		}

		try {
			await createUser({
				variables: {
					input: {
						firstName: data.firstName,
						lastName: data.lastName,
						email: data.email,
						password: data.password,
						role: 'member' as RoleType, // Default to member for signup
						phoneNumber: data.phoneNumber,
						dateOfBirth: data.dateOfBirth?.toISOString(),
						gender: data.gender,
						agreedToTermsAndConditions,
						agreedToPrivacyPolicy,
						agreedToLiabilityWaiver,
						membershipDetails: {
							physiqueGoalType: data.physiqueGoalType || '',
							fitnessGoal: data.fitnessGoal || [],
							workOutTime: data.workOutTime || [],
						},
					},
				},
			});
		} catch {
			// Error is handled in onError callback
		}
	};

	const openLink = (url: string) => {
		Linking.openURL(url).catch((err) =>
			console.error('Failed to open link:', err)
		);
	};

	return (
		<FixedView className='flex-1 bg-bg-darker'>
			<ScrollView
				contentContainerClassName='flex-grow px-5 py-8'
				keyboardShouldPersistTaps='handled'
			>
				<Text className='text-3xl font-bold mb-2 text-text-primary'>
					Terms & Conditions
				</Text>
				<Text className='text-base text-text-secondary mb-8'>
					Please review and agree to our terms
				</Text>

				<View className='gap-6'>
					<Checkbox
						label={
							<Text className='text-text-primary text-base'>
								I agree to the{' '}
								<Text
									className='text-[#F9C513] underline'
									onPress={() => openLink('https://example.com/terms')}
								>
									Terms and Conditions
								</Text>
							</Text>
						}
						checked={agreedToTermsAndConditions}
						onChange={setAgreedToTermsAndConditions}
					/>

					<Checkbox
						label={
							<Text className='text-text-primary text-base'>
								I agree to the{' '}
								<Text
									className='text-[#F9C513] underline'
									onPress={() => openLink('https://example.com/privacy')}
								>
									Privacy Policy
								</Text>
							</Text>
						}
						checked={agreedToPrivacyPolicy}
						onChange={setAgreedToPrivacyPolicy}
					/>

					<Checkbox
						label={
							<Text className='text-text-primary text-base'>
								I agree to the{' '}
								<Text
									className='text-[#F9C513] underline'
									onPress={() => openLink('https://example.com/waiver')}
								>
									Liability Waiver
								</Text>
							</Text>
						}
						checked={agreedToLiabilityWaiver}
						onChange={setAgreedToLiabilityWaiver}
					/>

					<View className='flex-row gap-3 mt-4'>
						<GradientButton
							onPress={() => router.back()}
							className='flex-1'
							variant='secondary'
							disabled={loading}
						>
							Back
						</GradientButton>
						<GradientButton
							onPress={handleSignUp}
							loading={loading}
							className='flex-1'
						>
							{loading ? 'Creating Account...' : 'Sign Up'}
						</GradientButton>
					</View>
				</View>
			</ScrollView>
		</FixedView>
	);
};

export default Fourth;
