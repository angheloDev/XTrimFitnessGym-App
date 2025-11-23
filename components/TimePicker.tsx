import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface TimePickerProps {
	label?: string;
	value?: Date;
	onChange: (date: Date) => void;
	placeholder?: string;
	error?: string;
	containerClassName?: string;
	disabled?: boolean;
}

const TimePicker: React.FC<TimePickerProps> = ({
	label,
	value,
	onChange,
	placeholder = 'Select a time',
	error,
	containerClassName = '',
	disabled = false,
}) => {
	const [show, setShow] = useState(false);
	const [internalTime, setInternalTime] = useState(value || new Date());

	const handleTimeChange = (event: any, selectedTime?: Date) => {
		if (Platform.OS === 'android') {
			setShow(false);
		}
		if (selectedTime) {
			setInternalTime(selectedTime);
			onChange(selectedTime);
		}
	};

	const formatTime = (date: Date) => {
		const hours = date.getHours();
		const minutes = date.getMinutes();
		const ampm = hours >= 12 ? 'PM' : 'AM';
		const displayHours = hours % 12 || 12;
		const displayMinutes = minutes.toString().padStart(2, '0');
		return `${displayHours}:${displayMinutes} ${ampm}`;
	};

	return (
		<View className={`${containerClassName}`}>
			{label && (
				<Text className='text-text-primary text-sm font-medium mb-2'>
					{label}
				</Text>
			)}
			<TouchableOpacity
				onPress={() => !disabled && setShow(true)}
				disabled={disabled}
				className={`border ${
					error ? 'border-red-500' : 'border-input'
				} rounded-lg p-4 bg-input flex-row justify-between items-center ${
					disabled ? 'opacity-50' : ''
				}`}
			>
				<Text
					className={`text-base flex-1 ${
						value ? 'text-text-primary' : 'text-gray-500'
					}`}
				>
					{value ? formatTime(value) : placeholder}
				</Text>
				<Text className='text-text-secondary text-lg'>🕐</Text>
			</TouchableOpacity>
			{error && <Text className='text-red-500 text-sm mt-1'>{error}</Text>}

			{show && (
				<View style={{ alignItems: 'center', marginTop: 10 }}>
					<DateTimePicker
						value={internalTime}
						mode='time'
						display={Platform.OS === 'ios' ? 'spinner' : 'default'}
						onChange={handleTimeChange}
						is24Hour={false}
					/>
				</View>
			)}
		</View>
	);
};

export default TimePicker;

