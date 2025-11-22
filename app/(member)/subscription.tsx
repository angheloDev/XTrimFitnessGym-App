import FixedView from '@/components/FixedView';
import GradientButton from '@/components/GradientButton';
import TabHeader from '@/components/TabHeader';
import { useAuth } from '@/contexts/AuthContext';
import {
	GET_MEMBERSHIPS_QUERY,
} from '@/graphql/queries';
import { PURCHASE_MEMBERSHIP_MUTATION } from '@/graphql/mutations';
import { useQuery, useMutation } from '@apollo/client/react';
import { useAppDispatch } from '@/store/hooks';
import { updateUser } from '@/store/slices/userSlice';
import React, { useState } from 'react';
import {
	ScrollView,
	Text,
	View,
	FlatList,
	TouchableOpacity,
	Alert,
	Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const MemberSubscription = () => {
	const { user } = useAuth();
	const dispatch = useAppDispatch();
	const [selectedMembership, setSelectedMembership] = useState<any>(null);
	const [showPurchaseModal, setShowPurchaseModal] = useState(false);

	const { data: membershipsData, refetch: refetchMemberships } = useQuery(
		GET_MEMBERSHIPS_QUERY,
		{
			variables: { status: 'ACTIVE' },
			fetchPolicy: 'cache-and-network',
		}
	);

	// Check if user has membership (has membershipId in membershipDetails)
	const hasMembership = !!user?.membershipDetails?.membershipId;

	const [purchaseMembership, { loading: purchasing }] = useMutation(
		PURCHASE_MEMBERSHIP_MUTATION,
		{
			onCompleted: (data) => {
				setShowPurchaseModal(false);
				setSelectedMembership(null);
				refetchMemberships();
				// Update user in Redux with new membershipId
				if (user && selectedMembership) {
					dispatch(
						updateUser({
							membershipDetails: {
								...user.membershipDetails,
								membershipId: selectedMembership.id,
							},
						} as any)
					);
				}
				Alert.alert('Success', 'Membership purchased successfully!');
			},
			onError: (error) => {
				Alert.alert('Error', error.message);
			},
		}
	);

	const memberships = membershipsData?.getMemberships || [];
	
	// Check if user has membership (has membershipId in membershipDetails)
	const isFreeAccount = !hasMembership;

	const handlePurchase = (membership: any) => {
		setSelectedMembership(membership);
		setShowPurchaseModal(true);
	};

	const confirmPurchase = () => {
		if (!selectedMembership) return;

		Alert.alert(
			'Confirm Purchase',
			`Are you sure you want to purchase ${selectedMembership.name} for $${selectedMembership.monthlyPrice}/month?`,
			[
				{ text: 'Cancel', style: 'cancel' },
				{
					text: 'Purchase',
					onPress: () => {
						purchaseMembership({
							variables: {
								input: {
									membershipId: selectedMembership.id,
								},
							},
						});
					},
				},
			]
		);
	};


	return (
		<FixedView className='flex-1 bg-bg-darker'>
			<TabHeader showCoachIcon={true} />
			<ScrollView
				className='flex-1'
				contentContainerClassName='p-5'
				showsVerticalScrollIndicator={false}
			>
				{isFreeAccount ? (
					<>
						<View className='bg-bg-primary rounded-xl p-6 mb-6 items-center'>
							<View className='bg-[#F9C513]/20 rounded-full p-4 mb-4'>
								<Ionicons name='card-outline' size={48} color='#F9C513' />
							</View>
							<Text className='text-2xl font-bold text-text-primary mb-2'>
								Free Account
							</Text>
							<Text className='text-text-secondary text-center mb-4'>
								You're currently on a free account. Upgrade to access all
								features!
							</Text>
						</View>

						<View className='mb-6'>
							<Text className='text-xl font-semibold text-text-primary mb-4'>
								Available Plans
							</Text>
							<Text className='text-text-secondary mb-4'>
								Choose a membership plan to unlock all features:
							</Text>
							<View className='gap-4'>
								{memberships.map((membership: any) => (
									<View
										key={membership.id}
										className='bg-bg-primary rounded-xl p-5 border border-bg-darker'
									>
										<View className='flex-row justify-between items-start mb-3'>
											<View className='flex-1'>
												<Text className='text-xl font-bold text-text-primary mb-1'>
													{membership.name}
												</Text>
												<Text className='text-3xl font-bold text-[#F9C513] mb-2'>
													${membership.monthlyPrice}
													<Text className='text-base text-text-secondary font-normal'>
														/{membership.durationType?.toLowerCase() || 'month'}
													</Text>
												</Text>
											</View>
										</View>

										{membership.description && (
											<Text className='text-text-secondary mb-3'>
												{membership.description}
											</Text>
										)}

										{membership.features && membership.features.length > 0 && (
											<View className='mb-4'>
												{membership.features.map(
													(feature: string, index: number) => (
														<View
															key={index}
															className='flex-row items-center mb-2'
														>
															<Ionicons
																name='checkmark-circle'
																size={20}
																color='#34C759'
															/>
															<Text className='text-text-secondary ml-2'>
																{feature}
															</Text>
														</View>
													)
												)}
											</View>
										)}

										<GradientButton
											onPress={() => handlePurchase(membership)}
											className='mt-2'
										>
											Purchase Plan
										</GradientButton>
									</View>
								))}
							</View>
						</View>
					</>
				) : (
					<>
						<View className='bg-gradient-to-r from-[#E41E26] to-[#F9C513] rounded-xl p-6 mb-6'>
							<View className='flex-row items-center justify-between'>
								<View className='flex-1'>
									<Text className='text-white text-sm font-semibold mb-1'>
										ACTIVE MEMBERSHIP
									</Text>
									<Text className='text-white text-2xl font-bold mb-1'>
										{user?.membershipDetails?.membershipId
											? memberships.find(
													(m: any) =>
														m.id === user.membershipDetails?.membershipId
											  )?.name || 'Premium'
											: 'Premium'}
									</Text>
									<Text className='text-white/80 text-sm'>
										You have an active membership
									</Text>
								</View>
								<Ionicons name='checkmark-circle' size={48} color='white' />
							</View>
						</View>

						<View className='mb-6'>
							<Text className='text-xl font-semibold text-text-primary mb-4'>
								Membership Status
							</Text>
							<View className='bg-bg-primary rounded-xl p-5'>
								<View>
									<Text className='text-text-secondary text-sm mb-1'>
										Plan Name
									</Text>
									<Text className='text-text-primary font-semibold text-lg'>
										{user?.membershipDetails?.membershipId
											? memberships.find(
													(m: any) =>
														m.id === user.membershipDetails?.membershipId
											  )?.name || 'N/A'
											: 'N/A'}
									</Text>
								</View>
							</View>
						</View>

						{memberships.length > 0 && (
							<View>
								<Text className='text-xl font-semibold text-text-primary mb-4'>
									Upgrade Plans
								</Text>
								<Text className='text-text-secondary mb-4'>
									Explore other membership options:
								</Text>
								{memberships
									.filter(
										(m: any) => m.id !== user?.membershipDetails?.membershipId
									)
									.map((membership: any) => (
										<View
											key={membership.id}
											className='bg-bg-primary rounded-xl p-5 mb-4 border border-bg-darker'
										>
											<Text className='text-xl font-bold text-text-primary mb-2'>
												{membership.name}
											</Text>
											<Text className='text-2xl font-bold text-[#F9C513] mb-3'>
												${membership.monthlyPrice}
												<Text className='text-base text-text-secondary font-normal'>
													/{membership.durationType?.toLowerCase() || 'month'}
												</Text>
											</Text>
											<GradientButton
												onPress={() => handlePurchase(membership)}
												className='mt-2'
											>
												Upgrade
											</GradientButton>
										</View>
									))}
							</View>
						)}
					</>
				)}
			</ScrollView>

			{/* Purchase Confirmation Modal */}
			<Modal
				visible={showPurchaseModal}
				animationType='slide'
				transparent
				onRequestClose={() => {
					setShowPurchaseModal(false);
					setSelectedMembership(null);
				}}
			>
				<View className='flex-1 bg-bg-darker justify-center px-5'>
					<View className='bg-bg-primary rounded-2xl p-6'>
						<Text className='text-2xl font-bold text-text-primary mb-4'>
							Confirm Purchase
						</Text>
						{selectedMembership && (
							<View className='mb-6'>
								<Text className='text-text-secondary mb-2'>
									Plan: {selectedMembership.name}
								</Text>
								<Text className='text-text-secondary mb-2'>
									Price: ${selectedMembership.monthlyPrice}/
									{selectedMembership.durationType?.toLowerCase() || 'month'}
								</Text>
								{selectedMembership.features &&
									selectedMembership.features.length > 0 && (
										<View className='mt-4'>
											<Text className='text-text-primary font-semibold mb-2'>
												Features:
											</Text>
											{selectedMembership.features.map(
												(feature: string, index: number) => (
													<Text
														key={index}
														className='text-text-secondary text-sm mb-1'
													>
														• {feature}
													</Text>
												)
											)}
										</View>
									)}
							</View>
						)}
						<View className='flex-row gap-3'>
							<GradientButton
								onPress={() => {
									setShowPurchaseModal(false);
									setSelectedMembership(null);
								}}
								className='flex-1'
								variant='secondary'
							>
								Cancel
							</GradientButton>
							<GradientButton
								onPress={confirmPurchase}
								loading={purchasing}
								className='flex-1'
							>
								Confirm
							</GradientButton>
						</View>
					</View>
				</View>
			</Modal>
		</FixedView>
	);
};

export default MemberSubscription;

