import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
	ActivityIndicator,
	ColorValue,
	Pressable,
	PressableProps,
	StyleSheet,
	Text,
	View,
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
	style,
	...pressableProps
}) => {
	// Gradient colors: red to yellow
	const gradientColors = ['#E41E26', '#F9C513'];

	return (
		<Pressable
			{...pressableProps}
			disabled={disabled || loading}
			style={(state) => {
				const styleValue = typeof style === 'function' ? style(state) : style;
				return [
					styles.pressable,
					(disabled || loading) && styles.disabled,
					styleValue,
				].filter(Boolean);
			}}
			{...(className ? { className } : {})}
		>
			{variant === 'primary' ? (
				<LinearGradient
					colors={gradientColors as [ColorValue, ColorValue]}
					start={{ x: 0, y: 0 }}
					end={{ x: 1, y: 1 }}
					style={styles.gradient}
				>
					{loading ? (
						<ActivityIndicator size='small' color='#ffffff' />
					) : (
						<Text style={styles.text} className={textClassName}>
							{children}
						</Text>
					)}
				</LinearGradient>
			) : (
				<View style={styles.secondaryContainer}>
					{loading ? (
						<ActivityIndicator size='small' color='#ffffff' />
					) : (
						<Text style={styles.text} className={textClassName}>
							{children}
						</Text>
					)}
				</View>
			)}
		</Pressable>
	);
};

const styles = StyleSheet.create({
	pressable: {
		borderRadius: 12,
		overflow: 'hidden',
	},
	disabled: {
		opacity: 0.5,
	},
	gradient: {
		paddingVertical: 16,
		borderRadius: 12,
		alignItems: 'center',
		justifyContent: 'center',
	},
	secondaryContainer: {
		paddingVertical: 16,
		borderRadius: 12,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'rgba(255, 255, 255, 0.04)',
		borderWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.1)',
	},
	text: {
		color: '#ffffff',
		fontSize: 18,
		fontWeight: '600',
	},
});

export default GradientButton;
