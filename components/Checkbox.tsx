import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface CheckboxProps {
	label: React.ReactNode;
	checked: boolean;
	onChange: (checked: boolean) => void;
	error?: string;
	containerClassName?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({
	label,
	checked,
	onChange,
	error,
	containerClassName = '',
}) => {
	return (
		<View className={`mb-4 ${containerClassName}`}>
			<TouchableOpacity
				onPress={() => onChange(!checked)}
				className='flex-row items-start'
			>
				{checked ? (
					<LinearGradient
						colors={['#E41E26', '#F9C513']}
						start={{ x: 0, y: 0 }}
						end={{ x: 1, y: 1 }}
						className='w-6 h-6 rounded items-center justify-center mr-3 mt-0.5'
					>
						<Text className='text-white text-sm font-bold'>✓</Text>
					</LinearGradient>
				) : (
					<View className='w-6 h-6 border-2 border-input bg-input rounded items-center justify-center mr-3 mt-0.5' />
				)}
				<View className='flex-1'>{label}</View>
			</TouchableOpacity>
			{error && <Text className='text-red-500 text-sm mt-1 ml-9'>{error}</Text>}
		</View>
	);
};

export default Checkbox;

