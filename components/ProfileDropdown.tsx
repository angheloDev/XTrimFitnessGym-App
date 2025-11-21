import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
	Modal,
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	Animated,
	Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ProfileDropdownProps {
	visible: boolean;
	onClose: () => void;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
	visible,
	onClose,
}) => {
	const { user, logout } = useAuth();
	const router = useRouter();
	const [fadeAnim] = React.useState(new Animated.Value(0));
	const [scaleAnim] = React.useState(new Animated.Value(0.95));

	useEffect(() => {
		if (visible) {
			Animated.parallel([
				Animated.timing(fadeAnim, {
					toValue: 1,
					duration: 200,
					useNativeDriver: true,
				}),
				Animated.spring(scaleAnim, {
					toValue: 1,
					useNativeDriver: true,
					tension: 50,
					friction: 7,
				}),
			]).start();
		} else {
			Animated.parallel([
				Animated.timing(fadeAnim, {
					toValue: 0,
					duration: 150,
					useNativeDriver: true,
				}),
				Animated.timing(scaleAnim, {
					toValue: 0.95,
					duration: 150,
					useNativeDriver: true,
				}),
			]).start();
		}
	}, [visible]);

	const handleProfilePress = () => {
		onClose();
		if (user?.role === 'coach') {
			router.push('/(coach)/profile');
		} else {
			router.push('/(member)/profile');
		}
	};

	const handleLogout = () => {
		onClose();
		Alert.alert(
			'Logout',
			'Are you sure you want to logout?',
			[
				{
					text: 'Cancel',
					style: 'cancel',
				},
				{
					text: 'Logout',
					style: 'destructive',
					onPress: async () => {
						await logout();
						router.replace('/(auth)/login');
					},
				},
			],
			{ cancelable: true }
		);
	};

	if (!visible) return null;

	return (
		<Modal
			visible={visible}
			transparent
			animationType='none'
			onRequestClose={onClose}
		>
			<TouchableOpacity
				style={styles.overlay}
				activeOpacity={1}
				onPress={onClose}
			>
				<Animated.View
					style={[
						styles.dropdown,
						{
							opacity: fadeAnim,
							transform: [{ scale: scaleAnim }],
						},
					]}
				>
					<TouchableOpacity activeOpacity={1}>
						{/* User Info */}
						<View className='px-4 py-3 border-b border-bg-darker'>
							<Text className='text-text-primary font-semibold text-base'>
								{user?.firstName} {user?.lastName}
							</Text>
							<Text className='text-text-secondary text-sm mt-1'>
								{user?.email}
							</Text>
						</View>

						{/* Profile Option */}
						<TouchableOpacity
							onPress={handleProfilePress}
							className='flex-row items-center px-4 py-4 border-b border-bg-darker'
						>
							<Ionicons name='person-outline' size={24} color='#F9C513' />
							<Text className='text-text-primary font-medium ml-3 text-base'>
								Profile
							</Text>
						</TouchableOpacity>

						{/* Logout Option */}
						<TouchableOpacity
							onPress={handleLogout}
							className='flex-row items-center px-4 py-4'
						>
							<Ionicons name='log-out-outline' size={24} color='#FF3B30' />
							<Text className='text-red-500 font-medium ml-3 text-base'>
								Logout
							</Text>
						</TouchableOpacity>
					</TouchableOpacity>
				</Animated.View>
			</TouchableOpacity>
		</Modal>
	);
};

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
	},
	dropdown: {
		position: 'absolute',
		top: 60,
		right: 20,
		width: 200,
		backgroundColor: '#1C1C1E',
		borderRadius: 12,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 4,
		},
		shadowOpacity: 0.3,
		shadowRadius: 4.65,
		elevation: 8,
		overflow: 'hidden',
	},
});

export default ProfileDropdown;

