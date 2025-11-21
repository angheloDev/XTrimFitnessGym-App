import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import NotificationsDrawer from './NotificationsDrawer';
import ProfileDropdown from './ProfileDropdown';

interface TabHeaderProps {
	showCoachIcon?: boolean;
}

const TabHeader: React.FC<TabHeaderProps> = ({ showCoachIcon = false }) => {
	const { user } = useAuth();
	const router = useRouter();
	const [showNotifications, setShowNotifications] = useState(false);
	const [showProfileDropdown, setShowProfileDropdown] = useState(false);

	const handleCoachPress = () => {
		if (showCoachIcon) {
			router.push('/(member)/coaches');
		}
	};

	return (
		<>
			<View
				style={[
					styles.header,
					{
						paddingTop: 20,
						paddingBottom: 25,
					},
				]}
				className='bg-bg-darker border-b border-bg-primary'
			>
				<View className='flex-row items-center justify-between px-5'>
					{/* Left side - Coach icon (only for members) */}
					<View className='flex-1'>
						{showCoachIcon ? (
							<TouchableOpacity
								onPress={handleCoachPress}
								className='flex-row items-center'
							>
								<View className='bg-bg-primary rounded-full p-1'>
									<Ionicons name='people' size={20} color='#F9C513' />
								</View>
								<Text className='text-text-primary font-semibold'>Coaches</Text>
							</TouchableOpacity>
						) : (
							<View />
						)}
					</View>

					{/* Center - App Title */}
					<View className='flex-1 items-center'>
						<Text className='text-text-primary font-bold text-lg'>
							XTrimFit Gym
						</Text>
					</View>

					{/* Right side - Notifications and Profile */}
					<View className='flex-1 flex-row items-center justify-end gap-3'>
						<TouchableOpacity
							onPress={() => setShowNotifications(true)}
							className='relative'
						>
							<Ionicons
								name='notifications-outline'
								size={24}
								color='#F9C513'
							/>
							{/* Notification badge - you can add logic to show/hide based on unread count */}
							<View className='absolute -top-1 -right-1 bg-red-500 rounded-full w-2 h-2' />
						</TouchableOpacity>

						<TouchableOpacity
							onPress={() => setShowProfileDropdown(!showProfileDropdown)}
							className='relative'
						>
							{user?.firstName ? (
								<View className='bg-[#F9C513] rounded-full w-8 h-8 items-center justify-center'>
									<Text className='text-bg-darker font-bold text-sm'>
										{user.firstName.charAt(0).toUpperCase() +
											user?.lastName?.charAt(0).toUpperCase() || ''}
									</Text>
								</View>
							) : (
								<Ionicons
									name='person-circle-outline'
									size={32}
									color='#F9C513'
								/>
							)}
						</TouchableOpacity>
					</View>
				</View>
			</View>

			{/* Notifications Drawer */}
			<NotificationsDrawer
				visible={showNotifications}
				onClose={() => setShowNotifications(false)}
			/>

			{/* Profile Dropdown */}
			<ProfileDropdown
				visible={showProfileDropdown}
				onClose={() => setShowProfileDropdown(false)}
			/>
		</>
	);
};

const styles = StyleSheet.create({
	header: {
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.1,
		shadowRadius: 3.84,
		elevation: 5,
	},
});

export default TabHeader;
