import Checkbox from '@/components/Checkbox';
import FixedView from '@/components/FixedView';
import GradientButton from '@/components/GradientButton';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { UPDATE_USER_MUTATION } from '@/graphql/mutations';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setUser } from '@/store/slices/userSlice';
import { convertGraphQLUser } from '@/utils/graphql-utils';
import { useMutation } from '@apollo/client/react';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Linking, ScrollView, Text, View } from 'react-native';

// Note: UpdateUserMutation types may need to be regenerated
// Using any for now until GraphQL codegen is run
type UpdateUserMutation = any;
type UpdateUserMutationVariables = any;

const Fourth = () => {
	const router = useRouter();
	const dispatch = useAppDispatch();
	const user = useAppSelector((state) => state.user.user);
	const { data, clearData } = useOnboarding();

	const [agreedToTermsAndConditions, setAgreedToTermsAndConditions] = useState(
		data.agreedToTermsAndConditions || false
	);

	const [updateUser, { loading }] = useMutation<
		UpdateUserMutation,
		UpdateUserMutationVariables
	>(UPDATE_USER_MUTATION, {
		onCompleted: async (data) => {
			// Convert GraphQL User to Redux User format
			const updatedUser = convertGraphQLUser(data.updateUser);
			dispatch(setUser(updatedUser));

			clearData();
			// Wait a bit for Redux state to update, then navigate
			// Navigation will be handled by AuthLayout, but we ensure state is updated first
			await new Promise((resolve) => setTimeout(resolve, 100));
			router.replace('/(member)/dashboard');
		},
		onError: (error) => {
			Alert.alert(
				'Error',
				error.message || 'Failed to complete onboarding. Please try again.'
			);
		},
	});

	const handleComplete = async () => {
		if (!agreedToTermsAndConditions) {
			Alert.alert(
				'Required Agreement',
				'Please agree to the terms and conditions to continue.'
			);
			return;
		}

		if (!user?.id) {
			Alert.alert('Error', 'User not found. Please try signing up again.');
			return;
		}

		// Update user with onboarding data and set hasEnteredDetails to true
		try {
			await updateUser({
				variables: {
					id: user.id,
					input: {
						phoneNumber: data.phoneNumber,
						dateOfBirth: data.dateOfBirth?.toISOString(),
						gender: data.gender,
						agreedToTermsAndConditions,
						membershipDetails: {
							physiqueGoalType: data.physiqueGoalType || '',
							fitnessGoal: data.fitnessGoal || [],
							workOutTime: data.workOutTime || [],
							hasEnteredDetails: true,
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
				showsVerticalScrollIndicator={false}
			>
				<Text className='text-3xl font-bold mb-2 text-text-primary'>
					Terms & Conditions
				</Text>
				<Text className='text-base text-text-secondary mb-8'>
					Please review and agree to our terms
				</Text>

				<View className='gap-6' pointerEvents={loading ? 'none' : 'auto'}>
					<Checkbox
						label={
							<Text className='text-text-primary text-base'>
								I agree to the{' '}
								<Text
									className='text-[#F9C513] underline'
									onPress={() =>
										!loading && openLink('https://example.com/terms')
									}
								>
									Terms and Conditions
								</Text>
							</Text>
						}
						checked={agreedToTermsAndConditions}
						onChange={setAgreedToTermsAndConditions}
						disabled={loading}
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
							onPress={handleComplete}
							loading={loading}
							className='flex-1'
							disabled={loading}
						>
							{loading ? 'Loading...' : 'Complete'}
						</GradientButton>
					</View>
				</View>
			</ScrollView>
		</FixedView>
	);
};

export default Fourth;
