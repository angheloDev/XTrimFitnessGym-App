import FixedView from '@/components/FixedView';
import GradientButton from '@/components/GradientButton';
import TabHeader from '@/components/TabHeader';
import { useAuth } from '@/contexts/AuthContext';
import type {
	GetCurrentMembershipQuery,
	GetMembershipsQuery,
} from '@/graphql/generated/types';
import {
	CANCEL_MEMBERSHIP_MUTATION,
	CREATE_SUBSCRIPTION_REQUEST_MUTATION,
} from '@/graphql/mutations';
import {
	GET_CURRENT_MEMBERSHIP_QUERY,
	GET_MEMBERSHIPS_QUERY,
	GET_MY_SUBSCRIPTION_REQUESTS_QUERY,
} from '@/graphql/queries';
import { useAppDispatch } from '@/store/hooks';
import { updateUser } from '@/store/slices/userSlice';
import { useMutation, useQuery } from '@apollo/client/react';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
	ActivityIndicator,
	Alert,
	Modal,
	ScrollView,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';

const MemberSubscription = () => {
	const { user } = useAuth();
	const dispatch = useAppDispatch();
	const [selectedMembership, setSelectedMembership] = useState<any>(null);
	const [showPurchaseModal, setShowPurchaseModal] = useState(false);

	// Fetch available membership plans
	const {
		data: membershipsData,
		loading: membershipsLoading,
		refetch: refetchMemberships,
	} = useQuery<GetMembershipsQuery>(GET_MEMBERSHIPS_QUERY, {
		variables: { status: 'ACTIVE' },
		fetchPolicy: 'cache-and-network',
	});

	// Fetch current active subscription
	const {
		data: currentMembershipData,
		loading: currentLoading,
		refetch: refetchCurrent,
	} = useQuery<GetCurrentMembershipQuery>(GET_CURRENT_MEMBERSHIP_QUERY, {
		fetchPolicy: 'cache-and-network',
	});

	// Fetch subscription requests
	const {
		data: requestsData,
		loading: requestsLoading,
		refetch: refetchRequests,
	} = useQuery(GET_MY_SUBSCRIPTION_REQUESTS_QUERY, {
		fetchPolicy: 'cache-and-network',
		pollInterval: 3000, // Poll every 3 seconds to check for approval/expiration
	});

	const [createSubscriptionRequest, { loading: requesting }] = useMutation(
		CREATE_SUBSCRIPTION_REQUEST_MUTATION,
		{
			onCompleted: () => {
				setShowPurchaseModal(false);
				setSelectedMembership(null);
				refetchRequests();
				Alert.alert(
					'Request Sent',
					'Your subscription request has been sent to the admin. It will expire in 1 minute if not approved.',
					[
						{
							text: 'OK',
							onPress: () => {
								// Poll for updates
								refetchCurrent();
							},
						},
					]
				);
			},
			onError: (error) => {
				Alert.alert('Error', error.message);
			},
		}
	);

	const [cancelMembership, { loading: canceling }] = useMutation(
		CANCEL_MEMBERSHIP_MUTATION,
		{
			onCompleted: () => {
				refetchCurrent();
				refetchMemberships();
				Alert.alert('Success', 'Membership subscription canceled successfully');
			},
			onError: (error) => {
				Alert.alert('Error', error.message);
			},
		}
	);

	const memberships = membershipsData?.getMemberships || [];
	const currentSubscription = currentMembershipData?.getCurrentMembership;
	const subscriptionRequests = requestsData?.getMySubscriptionRequests || [];

	// Get pending request for a specific membership
	const getPendingRequest = (membershipId: string) => {
		return subscriptionRequests.find(
			(req: any) =>
				req.membershipId === membershipId &&
				(req.status === 'PENDING' || req.status === 'EXPIRED')
		);
	};

	// Check if request is expired
	const isRequestExpired = (expiresAt: string) => {
		return new Date(expiresAt) < new Date();
	};

	// Get time remaining for pending request
	const getTimeRemaining = (expiresAt: string) => {
		const now = new Date();
		const expires = new Date(expiresAt);
		const diff = expires.getTime() - now.getTime();
		if (diff <= 0) return 0;
		return Math.ceil(diff / 1000); // seconds
	};

	const calculateDaysRemaining = (expiresAt: string) => {
		const expiry = new Date(expiresAt);
		const today = new Date();
		const diffTime = expiry.getTime() - today.getTime();
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		return diffDays > 0 ? diffDays : 0;
	};

	const handlePurchase = (membership: any) => {
		setSelectedMembership(membership);
		setShowPurchaseModal(true);
	};

	const confirmRequest = () => {
		if (!selectedMembership) return;

		createSubscriptionRequest({
			variables: {
				input: {
					membershipId: selectedMembership.id,
				},
			},
		});
	};

	// Check if membership was just approved (request was approved and we now have a subscription)
	React.useEffect(() => {
		const approvedRequest = subscriptionRequests.find(
			(req: any) => req.status === 'APPROVED' && req.approvedAt
		);
		if (approvedRequest && !currentSubscription) {
			// Request was approved, refetch current membership
			refetchCurrent();
		}
	}, [subscriptionRequests, currentSubscription, refetchCurrent]);

	const handleCancelSubscription = () => {
		if (!currentSubscription) return;

		Alert.alert(
			'Cancel Subscription',
			'Are you sure you want to cancel your subscription? This action cannot be undone.',
			[
				{ text: 'No', style: 'cancel' },
				{
					text: 'Yes, Cancel',
					style: 'destructive',
					onPress: () => {
						cancelMembership({
							variables: {
								transactionId: currentSubscription.id,
							},
						});
					},
				},
			]
		);
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		});
	};

	if (membershipsLoading || currentLoading) {
		return (
			<FixedView className='flex-1 bg-bg-darker'>
				<TabHeader showCoachIcon={true} />
				<View className='flex-1 justify-center items-center'>
					<ActivityIndicator size='large' color='#F9C513' />
					<Text className='text-text-secondary mt-4'>
						Loading membership plans...
					</Text>
				</View>
			</FixedView>
		);
	}

	return (
		<FixedView className='flex-1 bg-bg-darker'>
			<TabHeader showCoachIcon={true} />
			<ScrollView
				className='flex-1'
				contentContainerClassName='p-5'
				showsVerticalScrollIndicator={false}
			>
				{currentSubscription ? (
					<>
						{/* Current Subscription Card */}
						<View className='bg-gradient-to-r from-[#E41E26] to-[#F9C513] rounded-xl p-6 mb-6 border-2 border-white/20'>
							<View className='flex-row items-center justify-between mb-4 pb-4 border-b border-white/20'>
								<View className='flex-1'>
									<Text className='text-white text-sm font-semibold mb-1'>
										ACTIVE MEMBERSHIP
									</Text>
									<Text className='text-white text-2xl font-bold mb-1'>
										{currentSubscription.membership?.name || 'Premium'}
									</Text>
									<Text className='text-white/80 text-sm'>
										{currentSubscription.membership?.durationType} Plan
									</Text>
								</View>
								<Ionicons name='checkmark-circle' size={48} color='white' />
							</View>
						</View>

						{/* Subscription Details */}
						<View className='bg-bg-primary rounded-xl p-5 mb-6 border border-[#F9C513]/20'>
							<Text className='text-xl font-semibold text-text-primary mb-4 pb-4 border-b border-bg-darker/30'>
								Subscription Details
							</Text>

							<View className='mb-4 pb-4 border-b border-bg-darker/20'>
								<View className='flex-row items-center mb-2'>
									<Ionicons name='calendar-outline' size={20} color='#F9C513' />
									<Text className='text-text-secondary text-sm ml-2'>
										Started
									</Text>
								</View>
								<Text className='text-text-primary font-semibold text-lg'>
									{formatDate(currentSubscription.startedAt)}
								</Text>
							</View>

							<View className='mb-4 pb-4 border-b border-bg-darker/20'>
								<View className='flex-row items-center mb-2'>
									<Ionicons name='calendar-outline' size={20} color='#F9C513' />
									<Text className='text-text-secondary text-sm ml-2'>
										Expires
									</Text>
								</View>
								<Text className='text-text-primary font-semibold text-lg'>
									{formatDate(currentSubscription.expiresAt)}
								</Text>
							</View>

							<View className='mb-4 pb-4 border-b border-bg-darker/20'>
								<Text className='text-text-secondary text-sm mb-2'>
									Days Remaining
								</Text>
								<Text className='text-[#F9C513] font-bold text-2xl'>
									{calculateDaysRemaining(currentSubscription.expiresAt)} days
								</Text>
							</View>

							<View className='mb-4 pb-4 border-b border-bg-darker/20'>
								<Text className='text-text-secondary text-sm mb-2'>
									Price Paid
								</Text>
								<Text className='text-[#F9C513] font-bold text-xl'>
									₱{currentSubscription.priceAtPurchase?.toLocaleString()}
								</Text>
							</View>

							{currentSubscription.membership?.features &&
								currentSubscription.membership.features.length > 0 && (
									<View className='mt-4 pt-4 border-t border-bg-darker/30'>
										<Text className='text-text-primary font-semibold mb-3 pb-3 border-b border-bg-darker/20'>
											Included Features:
										</Text>
										{currentSubscription.membership.features.map(
											(feature: string, index: number) => (
												<View
													key={index}
													className='flex-row items-center mb-2 pl-2 py-1 rounded border border-bg-darker/10'
												>
													<Ionicons
														name='checkmark-circle'
														size={18}
														color='#F9C513'
													/>
													<Text className='text-text-secondary ml-2'>
														{feature}
													</Text>
												</View>
											)
										)}
									</View>
								)}

							<TouchableOpacity
								onPress={handleCancelSubscription}
								disabled={canceling}
								className='mt-4 bg-[#EF4444]/20 border border-[#EF4444]/30 rounded-xl p-4 flex-row items-center justify-center'
							>
								{canceling ? (
									<ActivityIndicator size='small' color='#EF4444' />
								) : (
									<>
										<Ionicons
											name='close-circle-outline'
											size={20}
											color='#EF4444'
										/>
										<Text className='text-[#EF4444] font-semibold ml-2'>
											Cancel Subscription
										</Text>
									</>
								)}
							</TouchableOpacity>
						</View>

						{/* Available Plans for Upgrade */}
						{memberships.length > 0 && (
							<View className='mb-6'>
								<Text className='text-xl font-semibold text-text-primary mb-4 pb-4 border-b border-[#F9C513]/20'>
									Upgrade or Switch Plans
								</Text>
								<Text className='text-text-secondary mb-4'>
									Explore other membership options:
								</Text>
								{memberships
									.filter((m: any) => m.id !== currentSubscription.membershipId)
									.map((membership: any) => (
										<View
											key={membership.id}
											className='bg-bg-primary rounded-xl p-5 mb-4 border border-[#F9C513]/20'
										>
											{membership.name.includes('PROMO') && (
												<View className='bg-[#F9C513]/20 rounded-lg px-3 py-1 mb-3 self-start flex-row items-center border border-[#F9C513]/30'>
													<Ionicons name='star' size={14} color='#F9C513' />
													<Text className='text-[#F9C513] text-xs font-bold ml-1'>
														MOST POPULAR
													</Text>
												</View>
											)}
											<Text className='text-xl font-bold text-text-primary mb-2'>
												{membership.name}
											</Text>
											<Text className='text-3xl font-bold text-[#F9C513] mb-2'>
												₱{membership.monthlyPrice.toLocaleString()}
												<Text className='text-base text-text-secondary font-normal'>
													/{membership.durationType?.toLowerCase() || 'month'}
												</Text>
											</Text>
											{membership.description && (
												<Text className='text-text-secondary mb-3'>
													{membership.description}
												</Text>
											)}
											{membership.features &&
												membership.features.length > 0 && (
													<View className='mb-4 pt-3 border-t border-bg-darker/20'>
														{membership.features
															.slice(0, 3)
															.map((feature: string, index: number) => (
																<View
																	key={index}
																	className='flex-row items-center mb-2 pl-2 py-1 rounded border border-bg-darker/10'
																>
																	<Ionicons
																		name='checkmark-circle'
																		size={16}
																		color='#34C759'
																	/>
																	<Text className='text-text-secondary text-sm ml-2'>
																		{feature}
																	</Text>
																</View>
															))}
														{membership.features.length > 3 && (
															<Text className='text-text-secondary text-sm italic ml-6 mt-2'>
																+{membership.features.length - 3} more features
															</Text>
														)}
													</View>
												)}
											{(() => {
												const pendingRequest = getPendingRequest(membership.id);
												const isExpired = pendingRequest && isRequestExpired(pendingRequest.expiresAt);
												const timeRemaining = pendingRequest ? getTimeRemaining(pendingRequest.expiresAt) : 0;

												if (pendingRequest && pendingRequest.status === 'PENDING' && !isExpired) {
													return (
														<View className='mt-2'>
															<View className='bg-[#F9C513]/20 border border-[#F9C513]/30 rounded-xl p-3 mb-2'>
																<View className='flex-row items-center justify-center mb-1'>
																	<Ionicons name='time-outline' size={16} color='#F9C513' />
																	<Text className='text-[#F9C513] font-semibold ml-2'>
																		Request Pending
																	</Text>
																</View>
																<Text className='text-text-secondary text-xs text-center'>
																	Expires in {timeRemaining}s - Waiting for admin approval
																</Text>
															</View>
														</View>
													);
												}

												if (pendingRequest && (isExpired || pendingRequest.status === 'EXPIRED')) {
													return (
														<View className='mt-2'>
															<View className='bg-red-500/20 border border-red-500/30 rounded-xl p-3 mb-2'>
																<View className='flex-row items-center justify-center mb-1'>
																	<Ionicons name='close-circle-outline' size={16} color='#EF4444' />
																	<Text className='text-red-400 font-semibold ml-2'>
																		Request Expired
																	</Text>
																</View>
																<Text className='text-text-secondary text-xs text-center mb-2'>
																	Your request expired. You can resend it.
																</Text>
															</View>
															<GradientButton
																onPress={() => handlePurchase(membership)}
																className='mt-2'
															>
																Resend Request
															</GradientButton>
														</View>
													);
												}

												if (pendingRequest && pendingRequest.status === 'REJECTED') {
													return (
														<View className='mt-2'>
															<View className='bg-red-500/20 border border-red-500/30 rounded-xl p-3 mb-2'>
																<View className='flex-row items-center justify-center mb-1'>
																	<Ionicons name='close-circle-outline' size={16} color='#EF4444' />
																	<Text className='text-red-400 font-semibold ml-2'>
																		Request Rejected
																	</Text>
																</View>
																<Text className='text-text-secondary text-xs text-center mb-2'>
																	Your request was rejected. You can try again.
																</Text>
															</View>
															<GradientButton
																onPress={() => handlePurchase(membership)}
																className='mt-2'
															>
																Try Again
															</GradientButton>
														</View>
													);
												}

												return (
													<GradientButton
														onPress={() => handlePurchase(membership)}
														className='mt-2'
													>
														Request Switch
													</GradientButton>
												);
											})()}
										</View>
									))}
							</View>
						)}
					</>
				) : (
					<>
						{/* No Subscription State */}
						<View className='bg-bg-primary rounded-xl p-6 mb-6 items-center border border-[#F9C513]/20'>
							<View className='bg-[#F9C513]/20 rounded-full p-4 mb-4 border-2 border-[#F9C513]/30'>
								<Ionicons name='card-outline' size={48} color='#F9C513' />
							</View>
							<Text className='text-2xl font-bold text-text-primary mb-2'>
								No Active Subscription
							</Text>
							<Text className='text-text-secondary text-center mb-4'>
								You don&apos;t have an active membership subscription yet.
							</Text>
							<Text className='text-text-secondary text-center'>
								Choose a plan below to get started!
							</Text>
						</View>

						{/* Available Plans */}
						<View className='mb-6'>
							<Text className='text-xl font-semibold text-text-primary mb-4 pb-4 border-b border-[#F9C513]/20'>
								Available Plans
							</Text>
							<Text className='text-text-secondary mb-4'>
								Choose a membership plan to unlock all features:
							</Text>
							{memberships.map((membership: any) => (
								<View
									key={membership.id}
									className={`bg-bg-primary rounded-xl p-5 mb-4 border ${
										membership.name.includes('PROMO')
											? 'border-[#F9C513] border-2'
											: 'border-bg-darker'
									}`}
								>
									{membership.name.includes('PROMO') && (
										<View className='bg-[#F9C513]/20 rounded-lg px-3 py-1 mb-3 self-start flex-row items-center border border-[#F9C513]/30'>
											<Ionicons name='star' size={14} color='#F9C513' />
											<Text className='text-[#F9C513] text-xs font-bold ml-1'>
												MOST POPULAR
											</Text>
										</View>
									)}
									<Text className='text-xl font-bold text-text-primary mb-2'>
										{membership.name}
									</Text>
									<Text className='text-3xl font-bold text-[#F9C513] mb-2'>
										₱{membership.monthlyPrice.toLocaleString()}
										<Text className='text-base text-text-secondary font-normal'>
											/{membership.durationType?.toLowerCase() || 'month'}
										</Text>
									</Text>

									{membership.description && (
										<Text className='text-text-secondary mb-3'>
											{membership.description}
										</Text>
									)}

									{membership.features && membership.features.length > 0 && (
										<View className='mb-4 pt-3 border-t border-bg-darker/20'>
											{membership.features.map(
												(feature: string, index: number) => (
													<View
														key={index}
														className='flex-row items-center mb-2 pl-2 py-1 rounded border border-bg-darker/10'
													>
														<Ionicons
															name='checkmark-circle'
															size={18}
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

									{(() => {
										const pendingRequest = getPendingRequest(membership.id);
										const isExpired = pendingRequest && isRequestExpired(pendingRequest.expiresAt);
										const timeRemaining = pendingRequest ? getTimeRemaining(pendingRequest.expiresAt) : 0;

										if (pendingRequest && pendingRequest.status === 'PENDING' && !isExpired) {
											return (
												<View className='mt-2'>
													<View className='bg-[#F9C513]/20 border border-[#F9C513]/30 rounded-xl p-3 mb-2'>
														<View className='flex-row items-center justify-center mb-1'>
															<Ionicons name='time-outline' size={16} color='#F9C513' />
															<Text className='text-[#F9C513] font-semibold ml-2'>
																Request Pending
															</Text>
														</View>
														<Text className='text-text-secondary text-xs text-center'>
															Expires in {timeRemaining}s - Waiting for admin approval
														</Text>
													</View>
												</View>
											);
										}

										if (pendingRequest && (isExpired || pendingRequest.status === 'EXPIRED')) {
											return (
												<View className='mt-2'>
													<View className='bg-red-500/20 border border-red-500/30 rounded-xl p-3 mb-2'>
														<View className='flex-row items-center justify-center mb-1'>
															<Ionicons name='close-circle-outline' size={16} color='#EF4444' />
															<Text className='text-red-400 font-semibold ml-2'>
																Request Expired
															</Text>
														</View>
														<Text className='text-text-secondary text-xs text-center mb-2'>
															Your request expired. You can resend it.
														</Text>
													</View>
													<GradientButton
														onPress={() => handlePurchase(membership)}
														className='mt-2'
													>
														Resend Request
													</GradientButton>
												</View>
											);
										}

										if (pendingRequest && pendingRequest.status === 'REJECTED') {
											return (
												<View className='mt-2'>
													<View className='bg-red-500/20 border border-red-500/30 rounded-xl p-3 mb-2'>
														<View className='flex-row items-center justify-center mb-1'>
															<Ionicons name='close-circle-outline' size={16} color='#EF4444' />
															<Text className='text-red-400 font-semibold ml-2'>
																Request Rejected
															</Text>
														</View>
														<Text className='text-text-secondary text-xs text-center mb-2'>
															Your request was rejected. You can try again.
														</Text>
													</View>
													<GradientButton
														onPress={() => handlePurchase(membership)}
														className='mt-2'
													>
														Try Again
													</GradientButton>
												</View>
											);
										}

										return (
											<GradientButton
												onPress={() => handlePurchase(membership)}
												className='mt-2'
											>
												Request Subscription
											</GradientButton>
										);
									})()}
								</View>
							))}
						</View>
					</>
				)}
			</ScrollView>

			{/* Purchase Confirmation Modal */}
			<Modal
				visible={showPurchaseModal}
				animationType='slide'
				onRequestClose={() => {
					setShowPurchaseModal(false);
					setSelectedMembership(null);
				}}
			>
				<View className='flex-1 bg-bg-darker justify-center px-5'>
					<View className='bg-bg-primary rounded-2xl p-6 border-2 border-[#F9C513]/30'>
						<View className='items-center mb-4 pb-4 border-b border-bg-darker/30'>
							<View className='bg-[#F9C513]/20 rounded-full p-4 border-2 border-[#F9C513]/30'>
								<Ionicons name='card' size={48} color='#F9C513' />
							</View>
						</View>
						<Text className='text-2xl font-bold text-text-primary mb-4 text-center pb-4 border-b border-bg-darker/30'>
							Request Subscription to {selectedMembership?.name}
						</Text>
						<View className='bg-[#F9C513]/20 border border-[#F9C513]/30 rounded-xl p-3 mb-4'>
							<View className='flex-row items-center mb-2'>
								<Ionicons name='information-circle-outline' size={20} color='#F9C513' />
								<Text className='text-[#F9C513] font-semibold ml-2'>
									Request Process
								</Text>
							</View>
							<Text className='text-text-secondary text-sm'>
								Your request will be sent to the admin for approval. It will expire in 1 minute if not approved. You can resend the request if it expires.
							</Text>
						</View>
						{selectedMembership && (
							<View className='mb-6'>
								<View className='bg-bg-darker rounded-xl p-4 mb-4 border border-[#F9C513]/20'>
									<View className='flex-row justify-between mb-2 pb-2 border-b border-bg-primary/30'>
										<Text className='text-text-secondary'>Plan</Text>
										<Text className='text-text-primary font-semibold'>
											{selectedMembership.name}
										</Text>
									</View>
									<View className='flex-row justify-between mb-2 pb-2 border-b border-bg-primary/30'>
										<Text className='text-text-secondary'>Duration</Text>
										<Text className='text-text-primary font-semibold'>
											{selectedMembership.durationType}
										</Text>
									</View>
									<View className='flex-row justify-between mb-2'>
										<Text className='text-text-secondary'>Price</Text>
										<Text className='text-[#F9C513] font-bold text-lg'>
											₱{selectedMembership.monthlyPrice.toLocaleString()}
										</Text>
									</View>
								</View>
								{selectedMembership.features &&
									selectedMembership.features.length > 0 && (
										<View className='pt-4 border-t border-bg-darker/30'>
											<Text className='text-text-primary font-semibold mb-2 pb-2 border-b border-bg-darker/20'>
												Included Features:
											</Text>
											{selectedMembership.features
												.slice(0, 4)
												.map((feature: string, index: number) => (
													<View
														key={index}
														className='flex-row items-center mb-1 pl-2 py-1 rounded border border-bg-darker/10'
													>
														<Ionicons
															name='checkmark-circle'
															size={16}
															color='#F9C513'
														/>
														<Text className='text-text-secondary text-sm ml-2'>
															{feature}
														</Text>
													</View>
												))}
											{selectedMembership.features.length > 4 && (
												<Text className='text-text-secondary text-sm italic ml-6 mt-2'>
													+{selectedMembership.features.length - 4} more
													features
												</Text>
											)}
										</View>
									)}
							</View>
						)}
						<View className='flex-row gap-3 w-full'>
							<View className='flex-1'>
								<GradientButton
									variant='secondary'
									onPress={() => {
										setShowPurchaseModal(false);
										setSelectedMembership(null);
									}}
									style={{ height: 56 }}
								>
									Cancel
								</GradientButton>
							</View>
							<View className='flex-1'>
								<GradientButton
									onPress={confirmRequest}
									loading={requesting}
									style={{ height: 56 }}
								>
									Send Request
								</GradientButton>
							</View>
						</View>
					</View>
				</View>
			</Modal>
		</FixedView>
	);
};

export default MemberSubscription;
