import Checkbox from '@/components/Checkbox';
import FixedView from '@/components/FixedView';
import GradientButton from '@/components/GradientButton';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Linking, ScrollView, Text, View } from 'react-native';

const Fourth = () => {
	const router = useRouter();
	const { data, clearData } = useOnboarding();

	const [agreedToTermsAndConditions, setAgreedToTermsAndConditions] = useState(
		data.agreedToTermsAndConditions || false
	);

	const handleComplete = async () => {
		if (!agreedToTermsAndConditions) {
			Alert.alert(
				'Required Agreement',
				'Please agree to the terms and conditions to continue.'
			);
			return;
		}

		// Complete onboarding and navigate to dashboard
		// User was already created during sign up
		clearData();
		router.replace('/(member)/dashboard');
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

					<View className='flex-row gap-3 mt-4'>
						<GradientButton
							onPress={() => router.back()}
							className='flex-1'
							variant='secondary'
						>
							Back
						</GradientButton>
						<GradientButton onPress={handleComplete} className='flex-1'>
							Complete
						</GradientButton>
					</View>
				</View>
			</ScrollView>
		</FixedView>
	);
};

export default Fourth;
