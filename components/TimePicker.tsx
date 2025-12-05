import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useEffect, useState } from 'react';
import { Modal, Platform, Text, TouchableOpacity, View } from 'react-native';

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

	useEffect(() => {
		if (value) {
			setInternalTime(value);
		}
	}, [value]);

	useEffect(() => {
		if (show && value) {
			setInternalTime(value);
		}
	}, [show]);

	const handleTimeChange = (event: any, selectedTime?: Date) => {
		if (Platform.OS === 'android') {
			setShow(false);
		}
		if (selectedTime) {
			setInternalTime(selectedTime);
			onChange(selectedTime);
		}
	};

	const handleConfirm = () => {
		setShow(false);
		onChange(internalTime);
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
									<Text
										style={{
											color: '#F9C513',
											fontSize: 16,
											fontWeight: '600',
										}}
									>
										Done
									</Text>
								</TouchableOpacity>
							</View>
							<DateTimePicker
								value={internalTime}
								mode='time'
								display='spinner'
								onChange={(event, selectedTime) => {
									if (selectedTime) {
										setInternalTime(selectedTime);
									}
								}}
								is24Hour={false}
								textColor='#F5F5F5'
							/>
						</View>
					</View>
				</Modal>
			) : (
				show && (
					<View style={{ alignItems: 'center', marginTop: 10 }}>
						<DateTimePicker
							value={internalTime}
							mode='time'
							display='default'
							onChange={handleTimeChange}
							is24Hour={false}
						/>
					</View>
				)
			)}
		</View>
	);
};

export default TimePicker;
