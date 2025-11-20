import { Stack } from 'expo-router';
import React from 'react';

const OnboardingLayout = () => {
	return (
		<Stack
			screenOptions={{
				headerShown: false,
			}}
		>
			<Stack.Screen name='first' />
			<Stack.Screen name='second' />
			<Stack.Screen name='third' />
			<Stack.Screen name='fourth' />
			<Stack.Screen name='fifth' />
		</Stack>
	);
};

export default OnboardingLayout;

