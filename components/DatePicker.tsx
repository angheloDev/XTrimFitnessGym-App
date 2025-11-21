import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface DatePickerProps {
	label?: string;
	value?: Date;
	onChange: (date: Date) => void;
	placeholder?: string;
	error?: string;
	containerClassName?: string;
	maximumDate?: Date;
	minimumDate?: Date;
}

const DatePicker: React.FC<DatePickerProps> = ({
	label,
	value,
	onChange,
	placeholder = 'Select a date',
	error,
	containerClassName = '',
	maximumDate,
	minimumDate,
}) => {
	const [show, setShow] = useState(false);
	const [internalDate, setInternalDate] = useState(value || new Date());

	const handleDateChange = (event: any, selectedDate?: Date) => {
		if (Platform.OS === 'android') {
			setShow(false);
		}
		if (selectedDate) {
			setInternalDate(selectedDate);
			onChange(selectedDate);
		}
	};

	const formatDate = (date: Date) => {
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		});
	};

	return (
		<View className={`mb-4 ${containerClassName}`}>
			{label && (
				<Text className='text-text-primary text-sm font-medium mb-2'>
					{label}
				</Text>
			)}
			<TouchableOpacity
				onPress={() => setShow(true)}
				className={`border ${
					error ? 'border-red-500' : 'border-input'
				} rounded-lg p-4 bg-input flex-row justify-between items-center`}
			>
				<Text
					className={`text-base ${
						value ? 'text-text-primary' : 'text-gray-500'
					}`}
				>
					{value ? formatDate(value) : placeholder}
				</Text>
				<Text className='text-text-secondary text-lg'>📅</Text>
			</TouchableOpacity>
			{error && <Text className='text-red-500 text-sm mt-1'>{error}</Text>}

			{show && (
				<DateTimePicker
					value={internalDate}
					mode='date'
					display='spinner'
					onChange={handleDateChange}
					maximumDate={maximumDate}
					minimumDate={minimumDate}
				/>
			)}
		</View>
	);
};

export default DatePicker;

