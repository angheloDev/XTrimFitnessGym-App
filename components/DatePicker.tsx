import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Platform, Modal } from 'react-native';
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

	useEffect(() => {
		if (value) {
			setInternalDate(value);
		}
	}, [value]);

	useEffect(() => {
		if (show && value) {
			setInternalDate(value);
		}
	}, [show]);

	const handleDateChange = (event: any, selectedDate?: Date) => {
		if (Platform.OS === 'android') {
			setShow(false);
		}
		if (selectedDate) {
			setInternalDate(selectedDate);
			onChange(selectedDate);
		}
	};

	const handleConfirm = () => {
		setShow(false);
		onChange(internalDate);
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

			{show && Platform.OS === 'ios' ? (
				<Modal
					visible={show}
					transparent={true}
					animationType='slide'
					onRequestClose={() => setShow(false)}
				>
					<View
						style={{
							flex: 1,
							backgroundColor: 'rgba(0, 0, 0, 0.5)',
							justifyContent: 'flex-end',
						}}
					>
						<View
							style={{
								backgroundColor: '#1C1C1E',
								borderTopLeftRadius: 20,
								borderTopRightRadius: 20,
								padding: 20,
							}}
						>
							<View
								style={{
									flexDirection: 'row',
									justifyContent: 'space-between',
									alignItems: 'center',
									marginBottom: 10,
								}}
							>
								<TouchableOpacity onPress={() => setShow(false)}>
									<Text style={{ color: '#8E8E93', fontSize: 16 }}>Cancel</Text>
								</TouchableOpacity>
								<TouchableOpacity onPress={handleConfirm}>
									<Text style={{ color: '#F9C513', fontSize: 16, fontWeight: '600' }}>
										Done
									</Text>
								</TouchableOpacity>
							</View>
							<DateTimePicker
								value={internalDate}
								mode='date'
								display='spinner'
								onChange={(event, selectedDate) => {
									if (selectedDate) {
										setInternalDate(selectedDate);
									}
								}}
								maximumDate={maximumDate}
								minimumDate={minimumDate}
								textColor='#F5F5F5'
							/>
						</View>
					</View>
				</Modal>
			) : (
				show && (
					<DateTimePicker
						value={internalDate}
						mode='date'
						display='default'
						onChange={handleDateChange}
						maximumDate={maximumDate}
						minimumDate={minimumDate}
					/>
				)
			)}
		</View>
	);
};

export default DatePicker;

