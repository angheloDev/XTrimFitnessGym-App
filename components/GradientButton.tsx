import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
	ActivityIndicator,
	ColorValue,
	Pressable,
	PressableProps,
	Text,
} from 'react-native';

interface GradientButtonProps extends Omit<PressableProps, 'children'> {
	children: React.ReactNode;
	variant?: 'primary' | 'secondary';
	loading?: boolean;
	className?: string;
	textClassName?: string;
}

const GradientButton: React.FC<GradientButtonProps> = ({
	children,
	variant = 'primary',
	loading = false,
	disabled,
	className = '',
	textClassName = '',
	...pressableProps
}) => {
	// Gradient colors: red to yellow
	const gradientColors = ['#E41E26', '#F9C513'];

	return (
		<Pressable
			{...pressableProps}
			disabled={disabled || loading}
			className={`rounded-xl overflow-hidden ${className} ${
				disabled || loading ? 'opacity-50' : ''
			}`}
		>
			<LinearGradient
				colors={gradientColors as [ColorValue, ColorValue]}
				start={{ x: 0, y: 0 }}
				end={{ x: 1, y: 1 }}
				className='py-4 rounded-xl items-center justify-center'
			>
				{loading ? (
					<ActivityIndicator size='small' color='#ffffff' />
				) : (
					<Text
						className={`text-text-primary text-lg font-semibold ${textClassName}`}
					>
						{children}
					</Text>
				)}
			</LinearGradient>
		</Pressable>
	);
};

export default GradientButton;
