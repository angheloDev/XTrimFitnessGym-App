import React from 'react';
import { TextInput, TextInputProps, Text, View } from 'react-native';

interface InputProps extends TextInputProps {
	label?: string;
	error?: string;
	containerClassName?: string;
}

const Input: React.FC<InputProps> = ({
	label,
	error,
	containerClassName = '',
	className = '',
	...props
}) => {
	return (
		<View className={`mb-4 ${containerClassName}`}>
			{label && (
				<Text className='text-text-primary text-sm font-medium mb-2'>
					{label}
				</Text>
			)}
			<TextInput
				className={`border ${
					error ? 'border-red-500' : 'border-input'
				} rounded-lg p-4 text-base bg-input text-text-primary ${className}`}
				placeholderTextColor='#6c757d'
				{...props}
			/>
			{error && (
				<Text className='text-red-500 text-sm mt-1'>{error}</Text>
			)}
		</View>
	);
};

export default Input;

