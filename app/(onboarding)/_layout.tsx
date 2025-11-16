import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';

const OnboardingLayout = () => {
	return (
		<>
			<StatusBar style='auto' />
			<Stack>
				<Stack.Screen name='(onboarding)'/>
			</Stack>
		</>
	);
};

export default OnboardingLayout;
