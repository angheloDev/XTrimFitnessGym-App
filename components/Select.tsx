import React, { useState } from 'react';
import {
	View,
	Text,
	TouchableOpacity,
	Modal,
	FlatList,
	StyleSheet,
} from 'react-native';

interface SelectOption {
	label: string;
	value: string;
}

interface SelectProps {
	label?: string;
	options: SelectOption[];
	value?: string;
	onChange: (value: string) => void;
	placeholder?: string;
	error?: string;
	containerClassName?: string;
}

const Select: React.FC<SelectProps> = ({
	label,
	options,
	value,
	onChange,
	placeholder = 'Select an option',
	error,
	containerClassName = '',
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const selectedOption = options.find((opt) => opt.value === value);

	return (
		<View className={`mb-4 ${containerClassName}`}>
			{label && (
				<Text className='text-text-primary text-sm font-medium mb-2'>
					{label}
				</Text>
			)}
			<TouchableOpacity
				onPress={() => setIsOpen(true)}
				className={`border ${
					error ? 'border-red-500' : 'border-input'
				} rounded-lg p-4 bg-input flex-row justify-between items-center`}
			>
				<Text
					className={`text-base ${
						selectedOption ? 'text-text-primary' : 'text-gray-500'
					}`}
				>
					{selectedOption ? selectedOption.label : placeholder}
				</Text>
				<Text className='text-text-secondary text-lg'>▼</Text>
			</TouchableOpacity>
			{error && <Text className='text-red-500 text-sm mt-1'>{error}</Text>}

			<Modal
				visible={isOpen}
				transparent
				animationType='slide'
				onRequestClose={() => setIsOpen(false)}
			>
				<View style={styles.modalOverlay}>
					<View style={styles.modalContent}>
						<View style={styles.modalHeader}>
							<Text style={styles.modalTitle}>{label || 'Select'}</Text>
							<TouchableOpacity onPress={() => setIsOpen(false)}>
								<Text style={styles.closeButton}>✕</Text>
							</TouchableOpacity>
						</View>
						<FlatList
							data={options}
							keyExtractor={(item) => item.value}
							renderItem={({ item }) => (
								<TouchableOpacity
									style={[
										styles.option,
										value === item.value && styles.selectedOption,
									]}
									onPress={() => {
										onChange(item.value);
										setIsOpen(false);
									}}
								>
									<Text
										style={[
											styles.optionText,
											value === item.value && styles.selectedOptionText,
										]}
									>
										{item.label}
									</Text>
									{value === item.value && (
										<Text style={styles.checkmark}>✓</Text>
									)}
								</TouchableOpacity>
							)}
						/>
					</View>
				</View>
			</Modal>
		</View>
	);
};

const styles = StyleSheet.create({
	modalOverlay: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		justifyContent: 'flex-end',
	},
	modalContent: {
		backgroundColor: '#1a1a1a',
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		maxHeight: '70%',
	},
	modalHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		padding: 20,
		borderBottomWidth: 1,
		borderBottomColor: '#333',
	},
	modalTitle: {
		fontSize: 18,
		fontWeight: '600',
		color: '#fff',
	},
	closeButton: {
		fontSize: 24,
		color: '#fff',
	},
	option: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		padding: 16,
		borderBottomWidth: 1,
		borderBottomColor: '#333',
	},
	selectedOption: {
		backgroundColor: '#2a2a2a',
	},
	optionText: {
		fontSize: 16,
		color: '#fff',
	},
	selectedOptionText: {
		color: '#F9C513',
		fontWeight: '600',
	},
	checkmark: {
		fontSize: 18,
		color: '#F9C513',
		fontWeight: 'bold',
	},
});

export default Select;

