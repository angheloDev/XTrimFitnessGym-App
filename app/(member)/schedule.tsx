import CameraCapture from '@/components/CameraCapture';
import FixedView from '@/components/FixedView';
import GradientButton from '@/components/GradientButton';
import TabHeader from '@/components/TabHeader';
import { useAuth } from '@/contexts/AuthContext';
import { GetClientSessionsQuery } from '@/graphql/generated/types';
import {
	COMPLETE_SESSION_MUTATION,
	CREATE_COACH_RATING_MUTATION,
} from '@/graphql/mutations';
import { GET_CLIENT_SESSIONS_QUERY } from '@/graphql/queries';
import { formatTimeTo12Hour } from '@/utils/time-utils';
import { useMutation, useQuery } from '@apollo/client/react';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import React, { useEffect, useState } from 'react';
import {
	ActivityIndicator,
	Alert,
	FlatList,
	Image,
	Modal,
	Platform,
	RefreshControl,
	ScrollView,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';

const getApiUrl = () => {
	if (__DEV__) {
		const apiUrl = Constants.expoConfig?.extra?.apiUrl;
		if (apiUrl) {
			return apiUrl.replace('/graphql', '');
		}
		if (Platform.OS === 'android') {
			return 'http://10.0.2.2:8080';
		} else if (Platform.OS === 'ios') {
			return 'http://localhost:8080';
		}
		return 'http://192.168.1.71:8080';
	}
	return 'https://your-production-api.com';
};

const API_BASE_URL = getApiUrl();

type ImageAngle = 'front' | 'rightSide' | 'leftSide' | 'back';

const angleLabels: Record<ImageAngle, string> = {
	front: 'Front',
	rightSide: 'Right Side',
	leftSide: 'Left Side',
	back: 'Back',
};

const MemberSchedule = () => {
	const { user } = useAuth();
	const [refreshing, setRefreshing] = useState(false);
	const [selectedSession, setSelectedSession] = useState<any>(null);
	const [showCompletionModal, setShowCompletionModal] = useState(false);
	const [showCamera, setShowCamera] = useState(false);
	const [currentAngle, setCurrentAngle] = useState<ImageAngle>('front');
	const [weight, setWeight] = useState('');
	const [weightError, setWeightError] = useState('');
	const [uploading, setUploading] = useState(false);
	const [progressImages, setProgressImages] = useState<
		Record<ImageAngle, string | null>
	>({
		front: null,
		rightSide: null,
		leftSide: null,
		back: null,
	});
	const [showRatingModal, setShowRatingModal] = useState(false);
	const [completedSessionLogId, setCompletedSessionLogId] = useState<string | null>(null);
	const [completedCoachId, setCompletedCoachId] = useState<string | null>(null);
	const [coachRating, setCoachRating] = useState<number>(0);
	const [coachComment, setCoachComment] = useState<string>('');

	const { data, refetch, loading } = useQuery<GetClientSessionsQuery>(
		GET_CLIENT_SESSIONS_QUERY,
		{
			variables: { clientId: user?.id || '', status: 'scheduled' },
			fetchPolicy: 'cache-and-network',
			skip: !user?.id,
		}
	);

	useEffect(() => {
		if (user?.id) {
			refetch();
		}
	}, [user?.id, refetch]);

	const onRefresh = async () => {
		setRefreshing(true);
		try {
			if (user?.id) {
				await refetch();
			}
		} finally {
			setRefreshing(false);
		}
	};

	const [completeSession, { loading: completing }] = useMutation(
		COMPLETE_SESSION_MUTATION,
		{
			onCompleted: async (data) => {
				setShowCompletionModal(false);
				setWeight('');
				setWeightError('');
				setProgressImages({
					front: null,
					rightSide: null,
					leftSide: null,
					back: null,
				});
				// Refetch sessions to update the UI (completed sessions are filtered by backend)
				await refetch();
				
				// Store session log ID and coach ID for rating modal
				if (data?.completeSession) {
					setCompletedSessionLogId(data.completeSession.id);
					setCompletedCoachId(data.completeSession.coachId);
					setShowRatingModal(true);
				} else {
					Alert.alert('Success', 'Session completed successfully!');
				}
			},
			onError: (error) => {
				Alert.alert('Error', error.message);
			},
		}
	);

	const [createCoachRating, { loading: ratingLoading }] = useMutation(
		CREATE_COACH_RATING_MUTATION,
		{
			onCompleted: () => {
				setShowRatingModal(false);
				setCompletedSessionLogId(null);
				setCompletedCoachId(null);
				setCoachRating(0);
				setCoachComment('');
				Alert.alert('Success', 'Thank you for rating your coach!');
			},
			onError: (error) => {
				Alert.alert('Error', error.message);
			},
		}
	);

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		const today = new Date();
		const tomorrow = new Date(today);
		tomorrow.setDate(tomorrow.getDate() + 1);
		if (date.toDateString() === today.toDateString()) return 'Today';
		if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
		return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
	};

	const isWeightRelatedGoal = (goal: any) => {
		if (!goal || !goal.goalType) return false;
		
		// Check if goal type is weight-related based on the goal schema
		// Weight-related goals: 'Weight loss' and 'Muscle building'
		const goalType = String(goal.goalType).trim();
		const goalTypeLower = goalType.toLowerCase();
		
		// Check multiple formats to handle any case variations
		return (
			goalType === 'Weight loss' || 
			goalType === 'Muscle building' ||
			goalTypeLower === 'weight loss' ||
			goalTypeLower === 'muscle building' ||
			goalType === 'WEIGHT_LOSS' ||
			goalType === 'MUSCLE_BUILDING' ||
			goalTypeLower === 'weight_loss' ||
			goalTypeLower === 'muscle_building'
		);
	};

	const isSessionCurrentlyActive = (session: any) => {
		if (!session || !session.date || !session.startTime) return false;
		
		const now = new Date();
		const sessionDate = new Date(session.date);
		const sessionDateTime = new Date(sessionDate);
		
		// Parse start time (format: "HH:MM" or "HH:MM:SS")
		const [hours, minutes] = session.startTime.split(':').map(Number);
		sessionDateTime.setHours(hours, minutes || 0, 0, 0);
		
		// Session is active if the date and time have passed or are current
		return sessionDateTime <= now;
	};

	const handleCompleteSession = (session: any) => {
		setSelectedSession(session);
		setProgressImages({
			front: null,
			rightSide: null,
			leftSide: null,
			back: null,
		});
		setWeight('');
		setWeightError('');
		setShowCompletionModal(true);
	};

	const uploadImageToCloudinary = async (imageUri: string): Promise<string> => {
		const formData = new FormData();
		formData.append('image', {
			uri: imageUri,
			type: 'image/jpeg',
			name: 'photo.jpg',
		} as any);
		formData.append('folder', 'XTrimFitGym/progress-images');

		const response = await fetch(`${API_BASE_URL}/api/upload/image`, {
			method: 'POST',
			body: formData,
		});

		if (!response.ok) {
			const error = await response
				.json()
				.catch(() => ({ error: 'Failed to upload image' }));
			throw new Error(error.error || 'Failed to upload image');
		}

		const data = await response.json();
		return data.url;
	};

	const handleImageCapture = async (uri: string) => {
		setShowCamera(false);
		setUploading(true);

		try {
			const imageUrl = await uploadImageToCloudinary(uri);
			setProgressImages((prev) => ({
				...prev,
				[currentAngle]: imageUrl,
			}));
		} catch (error: any) {
			Alert.alert('Upload Error', error.message || 'Failed to upload image');
		} finally {
			setUploading(false);
		}
	};

	const startCameraCapture = (angle: ImageAngle) => {
		setCurrentAngle(angle);
		setShowCamera(true);
	};

	const handleSubmitCompletion = async () => {
		// Validate weight if goal is weight-related - this is REQUIRED
		const isWeightRequired = selectedSession?.goal && isWeightRelatedGoal(selectedSession.goal);
		
		if (isWeightRequired) {
			if (!weight || !weight.trim()) {
				setWeightError('Weight is required for weight-related goals');
				Alert.alert(
					'Weight Required',
					`Please enter your current weight to complete this session.\n\nGoal Type: ${selectedSession.goal.goalType}`
				);
				return;
			}
			const weightNum = parseFloat(weight.trim());
			if (isNaN(weightNum) || weightNum <= 0) {
				setWeightError('Please enter a valid weight (must be greater than 0)');
				Alert.alert('Invalid Weight', 'Please enter a valid weight greater than 0.');
				return;
			}
		}

		// Validate all images are captured
		if (
			!progressImages.front ||
			!progressImages.rightSide ||
			!progressImages.leftSide ||
			!progressImages.back
		) {
			Alert.alert(
				'Missing Images',
				'Please capture all four progress images: Front, Right Side, Left Side, and Back'
			);
			return;
		}

		setWeightError('');

		const input: any = {
			sessionId: selectedSession.id,
			progressImages: {
				front: progressImages.front,
				rightSide: progressImages.rightSide,
				leftSide: progressImages.leftSide,
				back: progressImages.back,
			},
		};

		// Weight is REQUIRED for weight-related goals - ensure it's always included
		if (isWeightRequired) {
			// Weight validation already done above, so we can safely parse it
			input.weight = parseFloat(weight.trim());
		}

		completeSession({
			variables: {
				input,
			},
		});
	};

	// Backend now filters out completed sessions, so we can use sessions directly
	const sessions = (data?.getClientSessions || []) as any[];

	return (
		<FixedView className='flex-1 bg-bg-darker'>
			<TabHeader showCoachIcon={true} />
			<ScrollView
				className='flex-1'
				contentContainerClassName='p-5'
				showsVerticalScrollIndicator={false}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={onRefresh}
						tintColor='#F9C513'
					/>
				}
			>
				<View className='mb-6'>
					<Text className='text-3xl font-bold text-text-primary'>
						Upcoming Sessions
					</Text>
					<Text className='text-text-secondary mt-1'>
						Your scheduled workouts
					</Text>
				</View>
				{loading ? (
					<View className='items-center justify-center py-20'>
						<Text className='text-text-secondary'>Loading...</Text>
					</View>
				) : sessions.length === 0 ? (
					<View
						className='bg-bg-primary rounded-xl p-6 items-center border border-[#F9C513]'
						style={{ borderWidth: 0.5 }}
					>
						<Ionicons name='calendar-outline' size={48} color='#8E8E93' />
						<Text className='text-text-secondary mt-4 text-center text-base'>
							No upcoming sessions
						</Text>
						<Text className='text-text-secondary mt-2 text-center text-sm'>
							Your coach will schedule sessions for you
						</Text>
					</View>
				) : (
					<FlatList
						data={sessions}
						keyExtractor={(item) => item.id}
						scrollEnabled={false}
						renderItem={({ item }) => (
							<View
								className='bg-bg-primary rounded-xl p-4 mb-3 border border-[#F9C513]'
								style={{ borderWidth: 0.5 }}
							>
								<View className='flex-row'>
									<View
										className='bg-bg-darker rounded-lg p-3 mr-3 items-center justify-center min-w-[80] border border-[#F9C513]'
										style={{ borderWidth: 0.5 }}
									>
										<Text className='text-[#F9C513] font-bold text-lg'>
											{formatTimeTo12Hour(item.startTime)}
										</Text>
										<Text className='text-text-secondary text-xs mt-1'>
											{formatDate(item.date)}
										</Text>
									</View>
									<View className='flex-1'>
										<Text className='text-text-primary font-semibold text-base mb-2'>
											{item.name}
										</Text>
										<View className='flex-row items-center mb-1'>
											<Ionicons name='location' size={14} color='#8E8E93' />
											<Text className='text-text-secondary text-sm ml-1'>
												{item.gymArea}
											</Text>
										</View>
										<View className='flex-row items-center mb-1'>
											<Ionicons name='person' size={14} color='#8E8E93' />
											<Text className='text-text-secondary text-sm ml-1'>
												With Coach {item.coach?.firstName || ''}{' '}
												{item.coach?.lastName || ''}
											</Text>
										</View>
										{item.goal && (
											<View className='flex-row items-center mt-1'>
												<Ionicons name='flag' size={14} color='#F9C513' />
												<Text className='text-[#F9C513] text-sm ml-1 font-semibold'>
													Goal: {item.goal.title}
												</Text>
											</View>
										)}
									</View>
								</View>
								{isSessionCurrentlyActive(item) && (
									<GradientButton
										onPress={() => handleCompleteSession(item)}
										className='mt-3'
									>
										Complete Session
									</GradientButton>
								)}
							</View>
						)}
					/>
				)}
			</ScrollView>

			{/* Completion Modal */}
			<Modal
				visible={showCompletionModal}
				animationType='slide'
				transparent
				onRequestClose={() => {
					setShowCompletionModal(false);
					setWeight('');
					setWeightError('');
					setProgressImages({
						front: null,
						rightSide: null,
						leftSide: null,
						back: null,
					});
				}}
			>
				<View className='flex-1 bg-bg-darker justify-end'>
					<View
						className='bg-bg-primary rounded-t-3xl p-6 max-h-[90%] border-t border-[#F9C513]'
						style={{ borderTopWidth: 0.5 }}
					>
						<ScrollView showsVerticalScrollIndicator={false}>
							<View className='flex-row justify-between items-center mb-6'>
								<Text className='text-2xl font-bold text-text-primary'>
									Complete Session
								</Text>
								<TouchableOpacity
									onPress={() => {
										setShowCompletionModal(false);
										setWeight('');
										setWeightError('');
										setProgressImages({
											front: null,
											rightSide: null,
											leftSide: null,
											back: null,
										});
									}}
								>
									<Ionicons name='close' size={28} color='#8E8E93' />
								</TouchableOpacity>
							</View>


							{selectedSession?.goal &&
								isWeightRelatedGoal(selectedSession.goal) && (
									<View className='mb-6'>
										<Text className='text-text-primary font-semibold mb-2'>
											Enter Current Weight (kg){' '}
											<Text className='text-red-500'>*</Text>
										</Text>
										<TextInput
											className={`bg-bg-darker rounded-lg p-4 text-text-primary text-lg border ${
												weightError ? 'border-red-500' : 'border-[#F9C513]'
											}`}
											style={{ borderWidth: 0.5 }}
											placeholder='Enter weight in kg (required)'
											placeholderTextColor='#8E8E93'
											value={weight}
											onChangeText={(text) => {
												setWeight(text);
												setWeightError('');
											}}
											keyboardType='decimal-pad'
										/>
										{weightError ? (
											<Text className='text-red-500 text-sm mt-1'>
												{weightError}
											</Text>
										) : null}
									</View>
								)}

							<View className='mb-6'>
								<Text className='text-text-primary font-semibold mb-4'>
									Progress Photos <Text className='text-red-500'>*</Text>
								</Text>
								<Text className='text-text-secondary text-sm mb-4'>
									Please take 4 photos from different angles using the camera
								</Text>

								{(
									['front', 'rightSide', 'leftSide', 'back'] as ImageAngle[]
								).map((angle) => (
									<TouchableOpacity
										key={angle}
										onPress={() => startCameraCapture(angle)}
										disabled={uploading}
										className='mb-3 p-4 bg-bg-darker rounded-xl border border-[#F9C513]'
										style={{ borderWidth: 0.5, opacity: uploading ? 0.5 : 1 }}
									>
										<View className='flex-row items-center justify-between'>
											<View className='flex-row items-center flex-1'>
												<Ionicons
													name={
														progressImages[angle]
															? 'checkmark-circle'
															: 'camera'
													}
													size={24}
													color={progressImages[angle] ? '#4CAF50' : '#F9C513'}
												/>
												<Text className='text-text-primary font-semibold ml-3'>
													{angleLabels[angle]}
												</Text>
											</View>
											{progressImages[angle] ? (
												<View
													className='w-16 h-16 rounded-lg overflow-hidden border border-[#F9C513]'
													style={{ borderWidth: 0.5 }}
												>
													<Image
														source={{ uri: progressImages[angle]! }}
														className='w-full h-full'
													/>
												</View>
											) : (
												<Ionicons
													name='chevron-forward'
													size={20}
													color='#8E8E93'
												/>
											)}
										</View>
									</TouchableOpacity>
								))}

								{uploading && (
									<View className='items-center py-4'>
										<ActivityIndicator size='small' color='#F9C513' />
										<Text className='text-text-secondary text-sm mt-2'>
											Uploading image...
										</Text>
									</View>
								)}
							</View>

							{(() => {
								// Check if weight is required and provided
								const isWeightRequired = selectedSession?.goal && isWeightRelatedGoal(selectedSession.goal);
								const isWeightValid = !isWeightRequired || (weight.trim() && parseFloat(weight.trim()) > 0);
								
								// Check if all images are captured
								const allImagesCaptured = 
									progressImages.front &&
									progressImages.rightSide &&
									progressImages.leftSide &&
									progressImages.back;
								
								// Form is valid only if weight (if required) and all images are provided
								const isFormValid = isWeightValid && allImagesCaptured;
								
								return (
									<GradientButton
										onPress={handleSubmitCompletion}
										loading={completing || uploading}
										className='mt-4'
										disabled={completing || uploading || !isFormValid}
									>
										{completing ? 'Completing...' : 'Complete Session'}
									</GradientButton>
								);
							})()}
						</ScrollView>
					</View>
				</View>
			</Modal>

			{/* Camera Modal */}
			<CameraCapture
				visible={showCamera}
				onClose={() => setShowCamera(false)}
				onCapture={handleImageCapture}
				angle={currentAngle}
				angleLabel={angleLabels[currentAngle]}
			/>

			{/* Coach Rating Modal */}
			<Modal
				visible={showRatingModal}
				animationType='slide'
				transparent={false}
				onRequestClose={() => {
					setShowRatingModal(false);
					setCompletedSessionLogId(null);
					setCompletedCoachId(null);
					setCoachRating(0);
					setCoachComment('');
				}}
			>
				<View className='flex-1 bg-bg-darker justify-center px-5'>
					<View
						className='bg-bg-primary rounded-2xl p-6 border border-[#F9C513]'
						style={{ borderWidth: 0.5 }}
					>
						<View className='flex-row justify-between items-center mb-4'>
							<Text className='text-2xl font-bold text-text-primary'>
								Rate Your Coach
							</Text>
							<TouchableOpacity
								onPress={() => {
									setShowRatingModal(false);
									setCompletedSessionLogId(null);
									setCompletedCoachId(null);
									setCoachRating(0);
									setCoachComment('');
								}}
							>
								<Ionicons name='close' size={28} color='#8E8E93' />
							</TouchableOpacity>
						</View>

						<Text className='text-text-secondary text-base mb-6'>
							How would you rate your coach for this session?
						</Text>

						<View className='mb-6'>
							<Text className='text-text-primary font-semibold mb-3'>
								Rating <Text className='text-red-500'>*</Text>
							</Text>
							<View className='flex-row justify-center gap-2'>
								{[1, 2, 3, 4, 5].map((star) => (
									<TouchableOpacity
										key={star}
										onPress={() => setCoachRating(star)}
										className='p-2'
									>
										<Ionicons
											name={star <= coachRating ? 'star' : 'star-outline'}
											size={40}
											color='#F9C513'
										/>
									</TouchableOpacity>
								))}
							</View>
							{coachRating > 0 && (
								<Text className='text-text-secondary text-center mt-2'>
									{coachRating} out of 5 stars
								</Text>
							)}
						</View>

						<View className='mb-6'>
							<Text className='text-text-primary font-semibold mb-2'>
								Comment (Optional)
							</Text>
							<TextInput
								className='bg-bg-darker rounded-lg p-4 text-text-primary text-base border border-[#F9C513]'
								style={{ borderWidth: 0.5, minHeight: 100, textAlignVertical: 'top' }}
								placeholder='Share your thoughts about this session...'
								placeholderTextColor='#8E8E93'
								value={coachComment}
								onChangeText={setCoachComment}
								multiline
								numberOfLines={4}
							/>
						</View>

						<View className='flex-row gap-3'>
							<TouchableOpacity
								className='flex-1 bg-bg-darker rounded-lg p-4 items-center border border-[#F9C513]'
								style={{ borderWidth: 0.5 }}
								onPress={() => {
									setShowRatingModal(false);
									setCompletedSessionLogId(null);
									setCompletedCoachId(null);
									setCoachRating(0);
									setCoachComment('');
								}}
							>
								<Text className='text-text-primary font-semibold'>Skip</Text>
							</TouchableOpacity>
							<TouchableOpacity
								className='flex-1 bg-[#F9C513] rounded-lg p-4 items-center'
								onPress={() => {
									if (coachRating === 0) {
										Alert.alert('Rating Required', 'Please select a rating (1-5 stars)');
										return;
									}

									if (!completedSessionLogId || !completedCoachId) {
										Alert.alert('Error', 'Missing session information');
										return;
									}

									createCoachRating({
										variables: {
											input: {
												coachId: completedCoachId,
												sessionLogId: completedSessionLogId,
												rating: coachRating,
												comment: coachComment.trim() || undefined,
											},
										},
									});
								}}
								disabled={ratingLoading || coachRating === 0}
								style={{
									opacity: ratingLoading || coachRating === 0 ? 0.5 : 1,
								}}
							>
								{ratingLoading ? (
									<ActivityIndicator color='#000' />
								) : (
									<Text className='text-black font-semibold'>Submit Rating</Text>
								)}
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>
		</FixedView>
	);
};

export default MemberSchedule;
