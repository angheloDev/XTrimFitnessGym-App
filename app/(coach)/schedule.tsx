import DatePicker from '@/components/DatePicker';
import FixedView from '@/components/FixedView';
import GradientButton from '@/components/GradientButton';
import Input from '@/components/Input';
import Select from '@/components/Select';
import TabHeader from '@/components/TabHeader';
import TimePicker from '@/components/TimePicker';
import { TourStep } from '@/components/TourStep';
import { useAuth } from '@/contexts/AuthContext';
import {
	ASSIGN_COACH_TO_GOAL_MUTATION,
	CANCEL_SESSION_MUTATION,
	CREATE_SESSION_FROM_TEMPLATE_MUTATION,
	CREATE_SESSION_MUTATION,
} from '@/graphql/mutations';
import {
	GET_ALL_CLIENT_GOALS_QUERY,
	GET_COACH_SESSION_LOGS_QUERY,
	GET_COACH_SESSIONS_QUERY,
	GET_SESSION_LOG_BY_SESSION_ID_QUERY,
	GET_SESSION_TEMPLATES_QUERY,
	GET_USERS_QUERY,
} from '@/graphql/queries';
import { formatTimeTo12Hour } from '@/utils/time-utils';
import { useMutation, useQuery } from '@apollo/client/react';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { Image as ExpoImage } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
	ActivityIndicator,
	Alert,
	Dimensions,
	FlatList,
	Image,
	Modal,
	RefreshControl,
	ScrollView,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';

const gymAreas = [
	{ label: 'Main Training Area', value: 'Main Training Area' },
	{ label: 'Cardio Zone', value: 'Cardio Zone' },
	{ label: 'Free Weights Area', value: 'Free Weights Area' },
	{ label: 'Group Fitness Studio', value: 'Group Fitness Studio' },
	{ label: 'Yoga Room', value: 'Yoga Room' },
];

const CoachSchedule = () => {
	const { user } = useAuth();
	const router = useRouter();
	const [refreshing, setRefreshing] = useState(false);
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [showGoalsModal, setShowGoalsModal] = useState(false);
	const [showTemplatesModal, setShowTemplatesModal] = useState(false);
	const [selectedClients, setSelectedClients] = useState<string[]>([]);
	const [sessionName, setSessionName] = useState('');
	const [date, setDate] = useState<Date | undefined>();
	const [startTime, setStartTime] = useState<Date | undefined>();
	const [endTime, setEndTime] = useState<Date | undefined>();
	const [gymArea, setGymArea] = useState('');
	const [note, setNote] = useState('');
	const [isTemplate, setIsTemplate] = useState(false);
	const [selectedGoalId, setSelectedGoalId] = useState<string>('');
	const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [templatesExpanded, setTemplatesExpanded] = useState(false);
	const [showProgressImagesModal, setShowProgressImagesModal] = useState(false);
	const [selectedSessionForProgress, setSelectedSessionForProgress] =
		useState<any>(null);

	// Workout selection states
	const [showWorkoutModal, setShowWorkoutModal] = useState(false);
	const [wasCreateModalOpen, setWasCreateModalOpen] = useState(false);
	const [exercises, setExercises] = useState<any[]>([]);
	const [filteredExercises, setFilteredExercises] = useState<any[]>([]);
	const [categories, setCategories] = useState<string[]>([]);
	const [selectedCategory, setSelectedCategory] = useState<string>('all');
	const [searchWorkout, setSearchWorkout] = useState('');
	const [isLoadingWorkouts, setIsLoadingWorkouts] = useState(false);
	const [selectedWorkouts, setSelectedWorkouts] = useState<
		{
			id: string;
			name: string;
			bodyPart: string;
			target: string;
			equipment?: string;
			gifUrl: string;
			sets: string;
			reps: string;
		}[]
	>([]);

	const apiKey =
		(Constants?.expoConfig as any)?.extra?.exerciseDbApiKey ??
		(Constants?.manifest as any)?.extra?.exerciseDbApiKey;

	const buildExerciseImageUrl = useCallback(
		(exerciseId: string) => {
			if (!apiKey) return null;
			return `https://exercisedb.p.rapidapi.com/image?exerciseId=${encodeURIComponent(
				exerciseId
			)}&resolution=360&rapidapi-key=${apiKey}`;
		},
		[apiKey]
	);

	const fetchExercisesByCategory = useCallback(
		async (bodyPart: string) => {
			if (!apiKey) return;
			try {
				setIsLoadingWorkouts(true);
				let url: string;
				if (bodyPart === 'all') {
					url = 'https://exercisedb.p.rapidapi.com/exercises?limit=60&offset=0';
				} else {
					const encoded = encodeURIComponent(bodyPart);
					url = `https://exercisedb.p.rapidapi.com/exercises/bodyPart/${encoded}?limit=60&offset=0`;
				}

				const response = await fetch(url, {
					method: 'GET',
					headers: {
						'X-RapidAPI-Key': apiKey as string,
						'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com',
					},
				});

				if (!response.ok) {
					throw new Error(`Failed to load workouts (${response.status})`);
				}

				const data = await response.json();
				setExercises(data);
				setFilteredExercises(data);
			} catch (err: any) {
				Alert.alert(
					'Error',
					err?.message ??
						'Unable to load workouts right now. Please try again later.'
				);
			} finally {
				setIsLoadingWorkouts(false);
			}
		},
		[apiKey]
	);

	useEffect(() => {
		if (!showWorkoutModal || !apiKey) return;

		const fetchCategoriesAndInitialExercises = async () => {
			try {
				setIsLoadingWorkouts(true);
				const categoriesResponse = await fetch(
					'https://exercisedb.p.rapidapi.com/exercises/bodyPartList',
					{
						method: 'GET',
						headers: {
							'X-RapidAPI-Key': apiKey as string,
							'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com',
						},
					}
				);

				if (!categoriesResponse.ok) {
					throw new Error('Failed to load workout categories.');
				}

				const categoriesData = await categoriesResponse.json();
				const normalizedCategories = categoriesData.map((c: string) =>
					c.toLowerCase()
				);
				setCategories(normalizedCategories);
				setSelectedCategory('all');
				await fetchExercisesByCategory('all');
			} catch (err: any) {
				Alert.alert(
					'Error',
					err?.message ??
						'Unable to load workouts right now. Please try again later.'
				);
			} finally {
				setIsLoadingWorkouts(false);
			}
		};

		void fetchCategoriesAndInitialExercises();
	}, [showWorkoutModal, apiKey, fetchExercisesByCategory]);

	useEffect(() => {
		if (!showWorkoutModal) return;

		const trimmed = searchWorkout.trim();
		if (!trimmed) {
			setFilteredExercises(exercises);
			return;
		}

		const q = trimmed.toLowerCase();
		setFilteredExercises(
			exercises.filter(
				(ex: any) =>
					ex.name.toLowerCase().includes(q) ||
					ex.bodyPart.toLowerCase().includes(q) ||
					ex.target.toLowerCase().includes(q)
			)
		);
	}, [searchWorkout, exercises, showWorkoutModal]);

	const { data: sessionsData, refetch } = useQuery(GET_COACH_SESSIONS_QUERY, {
		variables: { coachId: user?.id },
		fetchPolicy: 'cache-and-network',
		skip: !user?.id,
	});

	const { data: goalsData, refetch: refetchGoals } = useQuery(
		GET_ALL_CLIENT_GOALS_QUERY,
		{
			variables: { coachId: user?.id, status: 'active' },
			fetchPolicy: 'cache-and-network',
			skip: !user?.id,
		}
	);

	const { data: templatesData, refetch: refetchTemplates } = useQuery(
		GET_SESSION_TEMPLATES_QUERY,
		{
			variables: { coachId: user?.id },
			fetchPolicy: 'cache-and-network',
			skip: !user?.id,
		}
	);

	const { data: clientsData } = useQuery(GET_USERS_QUERY, {
		variables: { role: 'member' },
		fetchPolicy: 'cache-and-network',
	});

	const { data: sessionLogData, refetch: refetchSessionLog } = useQuery(
		GET_SESSION_LOG_BY_SESSION_ID_QUERY,
		{
			variables: { sessionId: selectedSessionForProgress?.id || '' },
			fetchPolicy: 'cache-and-network',
			skip: !selectedSessionForProgress?.id || !showProgressImagesModal,
		}
	);

	// Query all session logs to check which sessions have progress images
	const { data: allSessionLogsData } = useQuery(GET_COACH_SESSION_LOGS_QUERY, {
		variables: { coachId: user?.id || '' },
		fetchPolicy: 'cache-and-network',
		skip: !user?.id,
	});

	// Create a Set of session IDs that have progress images
	const sessionsWithProgressImages = useMemo(() => {
		const sessionIds = new Set<string>();
		if (allSessionLogsData?.getCoachSessionLogs) {
			(allSessionLogsData.getCoachSessionLogs as any[]).forEach((log: any) => {
				if (
					log.progressImages &&
					(log.progressImages.front ||
						log.progressImages.rightSide ||
						log.progressImages.leftSide ||
						log.progressImages.back)
				) {
					sessionIds.add(log.sessionId);
				}
			});
		}
		return sessionIds;
	}, [allSessionLogsData]);

	const allClients = useMemo(() => {
		if (!clientsData?.getUsers) {
			return [];
		}
		const coachClientIds = user?.coachDetails?.clientsIds || [];
		if (!coachClientIds || coachClientIds.length === 0) {
			return [];
		}
		const normalizedCoachClientIds = coachClientIds
			.filter((id: any) => id != null)
			.map((id: any) => String(id));
		if (normalizedCoachClientIds.length === 0) {
			return [];
		}
		return clientsData.getUsers.filter((client: any) => {
			if (!client || !client.id) return false;
			const normalizedClientId = String(client.id);
			return normalizedCoachClientIds.includes(normalizedClientId);
		});
	}, [clientsData, user?.coachDetails?.clientsIds]);

	useEffect(() => {
		if (user?.id) {
			refetch();
			refetchGoals();
			refetchTemplates();
		}
	}, [user?.id, refetch, refetchGoals, refetchTemplates]);

	const onRefresh = async () => {
		setRefreshing(true);
		try {
			if (user?.id) {
				await Promise.all([refetch(), refetchGoals(), refetchTemplates()]);
			}
		} finally {
			setRefreshing(false);
		}
	};

	const [createSession, { loading: creating }] = useMutation(
		CREATE_SESSION_MUTATION,
		{
			onCompleted: () => {
				setShowCreateModal(false);
				resetForm();
				refetch();
				refetchTemplates();
				Alert.alert('Success', 'Session created successfully!');
			},
			onError: (error) => {
				Alert.alert('Error', error.message);
			},
		}
	);

	const [createSessionFromTemplate, { loading: creatingFromTemplate }] =
		useMutation(CREATE_SESSION_FROM_TEMPLATE_MUTATION, {
			onCompleted: () => {
				setShowCreateModal(false);
				resetForm();
				refetch();
				Alert.alert('Success', 'Session scheduled from template!');
			},
			onError: (error) => {
				Alert.alert('Error', error.message);
			},
		});

	const [assignCoachToGoal] = useMutation(ASSIGN_COACH_TO_GOAL_MUTATION, {
		onCompleted: () => {
			refetchGoals();
			Alert.alert('Success', 'You are now helping with this goal!');
		},
		onError: (error) => {
			Alert.alert('Error', error.message);
		},
	});

	const [cancelSession] = useMutation(CANCEL_SESSION_MUTATION, {
		onCompleted: () => {
			refetch();
			Alert.alert('Success', 'Session cancelled');
		},
		onError: (error) => {
			Alert.alert('Error', error.message);
		},
	});

	const resetForm = () => {
		setSessionName('');
		setDate(undefined);
		setStartTime(undefined);
		setEndTime(undefined);
		setGymArea('');
		setNote('');
		setSelectedClients([]);
		setIsTemplate(false);
		setSelectedGoalId('');
		setSelectedTemplateId('');
		setErrors({});
		setSelectedWorkouts([]);
	};

	const handleAddWorkout = (exercise: any) => {
		const gifUrl = buildExerciseImageUrl(exercise.id) || '';
		setSelectedWorkouts([
			...selectedWorkouts,
			{
				id: exercise.id,
				name: exercise.name,
				bodyPart: exercise.bodyPart,
				target: exercise.target,
				equipment: exercise.equipment,
				gifUrl,
				sets: '3',
				reps: '10',
			},
		]);
	};

	const handleRemoveWorkout = (index: number) => {
		setSelectedWorkouts(selectedWorkouts.filter((_, i) => i !== index));
	};

	const handleUpdateWorkoutSets = (index: number, sets: string) => {
		const updated = [...selectedWorkouts];
		updated[index].sets = sets;
		setSelectedWorkouts(updated);
	};

	const handleUpdateWorkoutReps = (index: number, reps: string) => {
		const updated = [...selectedWorkouts];
		updated[index].reps = reps;
		setSelectedWorkouts(updated);
	};

	const validateForm = () => {
		const newErrors: Record<string, string> = {};
		if (selectedTemplateId) {
			if (!date) newErrors.date = 'Date is required';
			if (!startTime) newErrors.startTime = 'Start time is required';
			if (selectedClients.length === 0)
				newErrors.clients = 'Select at least one client';
			if (!selectedGoalId) newErrors.goalId = 'A goal must be selected';
		} else if (isTemplate) {
			if (!sessionName.trim())
				newErrors.sessionName = 'Workout name is required';
			if (!gymArea) newErrors.gymArea = 'Gym area is required';
		} else {
			if (!sessionName.trim())
				newErrors.sessionName = 'Workout name is required';
			if (!date) newErrors.date = 'Date is required';
			if (!startTime) newErrors.startTime = 'Start time is required';
			if (!gymArea) newErrors.gymArea = 'Gym area is required';
			if (selectedClients.length === 0)
				newErrors.clients = 'Select at least one client';
			if (!selectedGoalId) newErrors.goalId = 'A goal must be selected';
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	// Helper function to convert Date to 12-hour format string
	const formatTimeToString = (time: Date | undefined): string => {
		if (!time) return '';
		const hours = time.getHours();
		const minutes = time.getMinutes();
		const ampm = hours >= 12 ? 'PM' : 'AM';
		const displayHours = hours % 12 || 12;
		const displayMinutes = minutes.toString().padStart(2, '0');
		return `${displayHours}:${displayMinutes} ${ampm}`;
	};

	const handleCreateSession = () => {
		if (!validateForm()) return;

		const startTimeString = formatTimeToString(startTime);
		const endTimeString = endTime ? formatTimeToString(endTime) : undefined;

		if (selectedTemplateId) {
			// Ensure goal is selected and belongs to one of the selected clients
			if (!selectedGoalId) {
				Alert.alert(
					'Error',
					'Please select a goal for one of the selected clients'
				);
				return;
			}

			// Verify the selected goal belongs to one of the selected clients
			const selectedGoal = myGoals.find((g: any) => g.id === selectedGoalId);
			if (!selectedGoal) {
				Alert.alert('Error', 'Selected goal not found');
				return;
			}

			const goalClientId = String(
				selectedGoal.clientId || selectedGoal.client?.id || ''
			);
			const isGoalForSelectedClient = selectedClients.some(
				(clientId: string) => String(clientId) === goalClientId
			);

			if (!isGoalForSelectedClient) {
				Alert.alert(
					'Error',
					'The selected goal must belong to one of the selected clients'
				);
				return;
			}

			// Validate date
			if (!date) {
				Alert.alert('Error', 'Date is required');
				return;
			}

			// Validate startTime
			if (!startTime) {
				Alert.alert('Error', 'Start time is required');
				return;
			}

			// Validate selectedClients
			if (!selectedClients || selectedClients.length === 0) {
				Alert.alert('Error', 'At least one client must be selected');
				return;
			}

			// Prepare workout data for template with validation
			let workoutData: string | undefined = undefined;
			if (selectedWorkouts.length > 0) {
				try {
					const workoutArray = selectedWorkouts.map((w) => ({
						id: String(w.id || ''),
						name: String(w.name || ''),
						bodyPart: String(w.bodyPart || ''),
						target: String(w.target || ''),
						equipment: w.equipment ? String(w.equipment) : undefined,
						gifUrl: w.gifUrl ? String(w.gifUrl) : undefined,
						sets: parseInt(String(w.sets || '0'), 10) || 0,
						reps: parseInt(String(w.reps || '0'), 10) || 0,
					}));
					workoutData = JSON.stringify(workoutArray);
					// Validate JSON is valid
					JSON.parse(workoutData);
				} catch {
					Alert.alert(
						'Error',
						'Failed to prepare workout data. Please try again.'
					);
					return;
				}
			}

			// Ensure all IDs are strings
			const normalizedClientsIds = selectedClients.map((id: any) => String(id));
			const normalizedTemplateId = String(selectedTemplateId);
			const normalizedGoalId = String(selectedGoalId);

			createSessionFromTemplate({
				variables: {
					input: {
						templateId: normalizedTemplateId,
						clientsIds: normalizedClientsIds,
						date: date.toISOString(),
						startTime: startTimeString,
						endTime: endTimeString || undefined,
						goalId: normalizedGoalId,
						workoutType: workoutData || undefined,
					},
				},
			});
			return;
		}

		// Prepare workout data with validation
		let workoutData: string | undefined = undefined;
		if (selectedWorkouts.length > 0) {
			try {
				const workoutArray = selectedWorkouts.map((w) => ({
					id: String(w.id || ''),
					name: String(w.name || ''),
					bodyPart: String(w.bodyPart || ''),
					target: String(w.target || ''),
					equipment: w.equipment ? String(w.equipment) : undefined,
					gifUrl: w.gifUrl ? String(w.gifUrl) : undefined,
					sets: parseInt(String(w.sets || '0'), 10) || 0,
					reps: parseInt(String(w.reps || '0'), 10) || 0,
				}));
				workoutData = JSON.stringify(workoutArray);
				// Validate JSON is valid
				JSON.parse(workoutData);
			} catch {
				Alert.alert(
					'Error',
					'Failed to prepare workout data. Please try again.'
				);
				return;
			}
		}

		if (isTemplate) {
			createSession({
				variables: {
					input: {
						clientsIds: [],
						name: sessionName.trim(),
						date: new Date().toISOString(),
						startTime: '12:00 PM',
						gymArea,
						note: note || undefined,
						isTemplate: true,
						goalId: selectedGoalId || undefined,
						workoutType: workoutData || undefined,
					},
				},
			});
			return;
		}

		// Validate required fields for regular session
		if (!date) {
			Alert.alert('Error', 'Date is required');
			return;
		}

		if (!startTime) {
			Alert.alert('Error', 'Start time is required');
			return;
		}

		// Normalize client IDs
		const normalizedClientsIds = selectedClients.map((id: any) => String(id));

		createSession({
			variables: {
				input: {
					clientsIds: normalizedClientsIds,
					name: sessionName.trim(),
					date: date.toISOString(),
					startTime: startTimeString,
					endTime: endTimeString || undefined,
					gymArea,
					note: note || undefined,
					goalId: selectedGoalId || undefined,
					workoutType: workoutData || undefined,
				},
			},
		});
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		const today = new Date();
		const tomorrow = new Date(today);
		tomorrow.setDate(tomorrow.getDate() + 1);

		if (date.toDateString() === today.toDateString()) return 'Today';
		if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
		return date.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
		});
	};

	const sessions = sessionsData?.getCoachSessions || [];
	const goals = goalsData?.getAllClientGoals || [];
	const templates = templatesData?.getSessionTemplates || [];
	const unassignedGoals = goals.filter((goal: any) => !goal.coachId);
	const myGoals = goals.filter((goal: any) => goal.coachId === user?.id);

	// Get goals for selected clients - only show goals where coach is assigned (myGoals)
	// and that belong to the selected clients
	const availableGoals = useMemo(() => {
		if (selectedClients.length === 0) {
			// If no clients selected, show all assigned goals
			return myGoals;
		}

		// Normalize selected client IDs to strings for comparison
		const normalizedSelectedClients = selectedClients.map((id: string) =>
			String(id)
		);

		// Filter goals to only show those for selected clients where coach is assigned
		return myGoals.filter((goal: any) => {
			// Get the client ID from the goal - handle both clientId field and client object
			// The GraphQL query returns both clientId and client.id, so check both
			let goalClientId: string | null = null;

			if (goal.clientId) {
				goalClientId = String(goal.clientId);
			} else if (goal.client?.id) {
				goalClientId = String(goal.client.id);
			}

			if (!goalClientId) {
				// If we can't find the client ID, skip this goal
				return false;
			}

			// Check if this goal's client is in the selected clients list
			return normalizedSelectedClients.includes(goalClientId);
		});
	}, [selectedClients, myGoals]);

	return (
		<FixedView className='flex-1 bg-bg-darker'>
			<TabHeader showCoachIcon={false} />
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
				<TourStep stepId='schedule'>
					<View className='mb-6 pb-4 border-b border-[#F9C513]' style={{ borderBottomWidth: 0.5 }}>
						<View className='flex-row justify-between items-center mb-4'>
							<Text className='text-3xl font-bold text-text-primary'>Schedule</Text>
							<TourStep stepId='schedule_create'>
								<GradientButton
									onPress={() => setShowCreateModal(true)}
									className='px-4 py-2 h-17 w-30'
								>
									<Ionicons name='add' size={30} color='#fff' />
								</GradientButton>
							</TourStep>
						</View>
						<View className='flex-row gap-2'>
						<TouchableOpacity
							onPress={() => setShowGoalsModal(true)}
							className='flex-1 bg-[#F9C513] rounded-lg px-3 py-2 flex-row items-center justify-center min-h-[44] border border-[#1C1C1E]/20'
						>
							<Ionicons name='flag' size={18} color='#1C1C1E' />
							<Text className='text-bg-darker font-semibold ml-2 text-sm'>
								Goals
							</Text>
						</TouchableOpacity>
						<TouchableOpacity
							onPress={() => setShowTemplatesModal(true)}
							className='flex-1 bg-[#F9C513] rounded-lg px-3 py-2 flex-row items-center justify-center min-h-[44] border border-[#1C1C1E]/20'
						>
							<Ionicons name='copy' size={18} color='#1C1C1E' />
							<Text className='text-bg-darker font-semibold ml-2 text-sm'>
								Templates
							</Text>
						</TouchableOpacity>
					</View>
				</View>
				</TourStep>

				{myGoals.length > 0 && (
					<View className='mb-4'>
						<Text className='text-xl font-semibold text-text-primary mb-4'>
							My Goals ({myGoals.length})
						</Text>
						<FlatList
							data={myGoals.slice(0, 3)}
							keyExtractor={(item) => item.id}
							scrollEnabled={false}
							renderItem={({ item }) => (
								<View
									className='bg-bg-primary rounded-xl p-4 mb-3 border border-[#F9C513]'
									style={{ borderWidth: 0.5 }}
								>
									<Text className='text-text-primary font-semibold text-base mb-1'>
										{item.title}
									</Text>
									<Text className='text-text-secondary text-sm'>
										Client: {item.client?.firstName} {item.client?.lastName}
									</Text>
									<Text className='text-text-secondary text-sm'>
										Type: {item.goalType}
									</Text>
								</View>
							)}
						/>
					</View>
				)}

				{templates.length > 0 && (
					<View className='mb-4'>
						<TouchableOpacity
							onPress={() => setTemplatesExpanded(!templatesExpanded)}
							className='flex-row items-center justify-between mb-4'
						>
							<Text className='text-xl font-semibold text-text-primary'>
								My Templates ({templates.length})
							</Text>
							<Ionicons
								name={templatesExpanded ? 'chevron-up' : 'chevron-down'}
								size={24}
								color='#F9C513'
							/>
						</TouchableOpacity>
						{templatesExpanded && (
							<FlatList
								data={templates}
								keyExtractor={(item) => item.id}
								scrollEnabled={false}
								renderItem={({ item }) => (
									<View
										className='bg-bg-primary rounded-xl p-4 mb-3 flex-row items-center border border-[#F9C513]'
										style={{ borderWidth: 0.5 }}
									>
										<View className='flex-1'>
											<Text className='text-text-primary font-semibold text-base mb-1'>
												{item.name}
											</Text>
											<Text className='text-text-secondary text-sm'>
												{item.gymArea}
											</Text>
										</View>
										<TouchableOpacity
											onPress={() => {
												setSelectedTemplateId(item.id);
												setShowCreateModal(true);
												setShowTemplatesModal(false);
											}}
											className='bg-[#F9C513] rounded-lg px-3 py-2'
										>
											<Text className='text-bg-darker font-semibold'>Use</Text>
										</TouchableOpacity>
									</View>
								)}
							/>
						)}
					</View>
				)}

				<View className='mb-4'>
					<Text className='text-xl font-semibold text-text-primary mb-4'>
						Upcoming Sessions
					</Text>
					<TouchableOpacity
						onPress={() => router.push('/(coach)/completed-sessions')}
						className='bg-[#F9C513] rounded-lg px-3 py-2 flex-row items-center justify-center min-h-[44] border border-[#1C1C1E]/20 mb-4'
					>
						<Ionicons name='checkmark-circle' size={18} color='#1C1C1E' />
						<Text className='text-bg-darker font-semibold ml-2 text-sm'>
							Completed Sessions
						</Text>
					</TouchableOpacity>
					{sessions.filter(
						(s: any) => !s.isTemplate && s.status !== 'cancelled'
					).length === 0 ? (
						<View
							className='bg-bg-primary rounded-xl p-6 items-center border border-[#F9C513]'
							style={{ borderWidth: 0.5 }}
						>
							<Ionicons name='calendar-outline' size={48} color='#8E8E93' />
							<Text className='text-text-secondary mt-2 text-center'>
								No upcoming sessions
							</Text>
						</View>
					) : (
						<FlatList
							data={sessions
								.filter((s: any) => !s.isTemplate && s.status !== 'cancelled')
								.slice(0, 5)}
							keyExtractor={(item) => item.id}
							scrollEnabled={false}
							renderItem={({ item }) => (
								<View
									className='bg-bg-primary rounded-xl p-4 mb-3 flex-row border border-[#F9C513]'
									style={{ borderWidth: 0.5 }}
								>
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
										<Text className='text-text-primary font-semibold text-base mb-1'>
											{item.name}
										</Text>
										<View className='flex-row items-center mb-1'>
											<Ionicons name='location' size={14} color='#8E8E93' />
											<Text className='text-text-secondary text-sm ml-1'>
												{item.gymArea}
											</Text>
										</View>
										<Text className='text-text-secondary text-sm'>
											{item.clients?.length || 0} client(s)
										</Text>
										{item.goal && (
											<Text className='text-[#F9C513] text-xs mt-1'>
												Goal: {item.goal.title}
											</Text>
										)}
									</View>
									<View className='flex-row items-center gap-2'>
										{new Date(item.date) <= new Date() &&
											sessionsWithProgressImages.has(item.id) && (
												<TouchableOpacity
													onPress={() => {
														setSelectedSessionForProgress(item);
														setShowProgressImagesModal(true);
													}}
													className='p-2'
												>
													<Ionicons name='images' size={24} color='#F9C513' />
												</TouchableOpacity>
											)}
										<TouchableOpacity
											onPress={() => {
												Alert.alert(
													'Cancel Session',
													'Are you sure you want to cancel this session?',
													[
														{ text: 'No', style: 'cancel' },
														{
															text: 'Yes',
															style: 'destructive',
															onPress: () =>
																cancelSession({
																	variables: { id: item.id },
																}),
														},
													]
												);
											}}
											className='p-2'
										>
											<Ionicons name='close-circle' size={24} color='#FF3B30' />
										</TouchableOpacity>
									</View>
								</View>
							)}
						/>
					)}
				</View>
			</ScrollView>

			<Modal
				visible={showGoalsModal}
				animationType='slide'
				transparent
				onRequestClose={() => setShowGoalsModal(false)}
			>
				<View className='flex-1 bg-bg-darker justify-end'>
					<View
						className='bg-bg-primary rounded-t-3xl p-5 max-h-[90%] border-t border-[#F9C513]'
						style={{ borderTopWidth: 0.5 }}
					>
						<ScrollView showsVerticalScrollIndicator={false}>
							<View className='flex-row justify-between items-center mb-6'>
								<Text className='text-2xl font-bold text-text-primary'>
									Client Goals
								</Text>
								<TouchableOpacity onPress={() => setShowGoalsModal(false)}>
									<Ionicons name='close' size={28} color='#8E8E93' />
								</TouchableOpacity>
							</View>

							{goals.length === 0 ? (
								<View
									className='items-center py-10 border border-[#F9C513] rounded-xl'
									style={{ borderWidth: 0.5 }}
								>
									<Ionicons name='flag-outline' size={48} color='#8E8E93' />
									<Text className='text-text-secondary mt-4 text-center'>
										No goals available
									</Text>
								</View>
							) : (
								<>
									{unassignedGoals.length > 0 && (
										<View className='mb-6'>
											<Text className='text-lg font-semibold text-text-primary mb-3'>
												Available Goals ({unassignedGoals.length})
											</Text>
											<FlatList
												data={unassignedGoals}
												keyExtractor={(item) => item.id}
												scrollEnabled={false}
												renderItem={({ item }) => (
													<View
														className='bg-bg-darker rounded-xl p-4 mb-3 border border-[#F9C513]'
														style={{ borderWidth: 0.5 }}
													>
														<Text className='text-text-primary font-semibold text-base mb-2'>
															{item.title}
														</Text>
														<Text className='text-text-secondary text-sm mb-1'>
															Client: {item.client?.firstName}{' '}
															{item.client?.lastName}
														</Text>
														<Text className='text-text-secondary text-sm mb-3'>
															Type: {item.goalType}
														</Text>
														<GradientButton
															onPress={() => {
																assignCoachToGoal({
																	variables: { goalId: item.id },
																});
															}}
															className='mt-2'
														>
															Help with this Goal
														</GradientButton>
													</View>
												)}
											/>
										</View>
									)}

									{myGoals.length > 0 && (
										<View>
											<Text className='text-lg font-semibold text-text-primary mb-3'>
												My Goals ({myGoals.length})
											</Text>
											<FlatList
												data={myGoals}
												keyExtractor={(item) => item.id}
												scrollEnabled={false}
												renderItem={({ item }) => (
													<View
														className='bg-bg-darker rounded-xl p-4 mb-3 border border-[#F9C513]'
														style={{ borderWidth: 0.5 }}
													>
														<Text className='text-text-primary font-semibold text-base mb-2'>
															{item.title}
														</Text>
														<Text className='text-text-secondary text-sm mb-1'>
															Client: {item.client?.firstName}{' '}
															{item.client?.lastName}
														</Text>
														<Text className='text-text-secondary text-sm'>
															Type: {item.goalType}
														</Text>
													</View>
												)}
											/>
										</View>
									)}
								</>
							)}
						</ScrollView>
					</View>
				</View>
			</Modal>

			<Modal
				visible={showTemplatesModal}
				animationType='slide'
				transparent
				onRequestClose={() => setShowTemplatesModal(false)}
			>
				<View className='flex-1 bg-bg-darker justify-end'>
					<View
						className='bg-bg-primary rounded-t-3xl p-5 max-h-[90%] border-t border-[#F9C513]'
						style={{ borderTopWidth: 0.5 }}
					>
						<ScrollView showsVerticalScrollIndicator={false}>
							<View className='flex-row justify-between items-center mb-6'>
								<Text className='text-2xl font-bold text-text-primary'>
									Session Templates
								</Text>
								<TouchableOpacity onPress={() => setShowTemplatesModal(false)}>
									<Ionicons name='close' size={28} color='#8E8E93' />
								</TouchableOpacity>
							</View>

							{templates.length === 0 ? (
								<View
									className='items-center py-10 border border-[#F9C513] rounded-xl'
									style={{ borderWidth: 0.5 }}
								>
									<Ionicons name='copy-outline' size={48} color='#8E8E93' />
									<Text className='text-text-secondary mt-4 text-center'>
										No templates yet
									</Text>
									<Text className='text-text-secondary mt-2 text-center text-sm'>
										Create reusable session templates to schedule quickly
									</Text>
								</View>
							) : (
								<FlatList
									data={templates}
									keyExtractor={(item) => item.id}
									scrollEnabled={false}
									renderItem={({ item }) => (
										<View className='bg-bg-darker rounded-xl p-4 mb-3 border border-bg-primary'>
											<Text className='text-text-primary font-semibold text-base mb-2'>
												{item.name}
											</Text>
											<View className='flex-row items-center mb-2'>
												<Ionicons name='location' size={14} color='#8E8E93' />
												<Text className='text-text-secondary text-sm ml-1'>
													{item.gymArea}
												</Text>
											</View>
											{item.goal && (
												<Text className='text-[#F9C513] text-xs mb-2'>
													Goal: {item.goal.title}
												</Text>
											)}
											<View className='flex-row gap-2 mt-2'>
												<GradientButton
													onPress={() => {
														setSelectedTemplateId(item.id);
														setShowCreateModal(true);
														setShowTemplatesModal(false);
													}}
													className='flex-1'
												>
													Schedule
												</GradientButton>
											</View>
										</View>
									)}
								/>
							)}
						</ScrollView>
					</View>
				</View>
			</Modal>

			<Modal
				visible={showCreateModal}
				animationType='slide'
				transparent
				onRequestClose={() => {
					setShowCreateModal(false);
					resetForm();
				}}
			>
				<View className='flex-1 bg-bg-darker justify-end'>
					<View
						className='bg-bg-primary rounded-t-3xl p-5 max-h-[90%] border-t border-[#F9C513]'
						style={{ borderTopWidth: 0.5 }}
					>
						<ScrollView
							showsVerticalScrollIndicator={false}
							keyboardShouldPersistTaps='handled'
						>
							<View className='flex-row justify-between items-center mb-6'>
								<Text className='text-2xl font-bold text-text-primary'>
									{selectedTemplateId
										? 'Schedule from Template'
										: isTemplate
											? 'Create Template'
											: 'Create Session'}
								</Text>
								<TouchableOpacity
									onPress={() => {
										setShowCreateModal(false);
										resetForm();
									}}
								>
									<Ionicons name='close' size={28} color='#8E8E93' />
								</TouchableOpacity>
							</View>

							{selectedTemplateId ? (
								<>
									<Text className='text-text-secondary mb-4'>
										Schedule this template for specific clients and date
									</Text>
									<View className='mb-4'>
										<Text className='text-text-primary font-semibold mb-2'>
											Select Clients <Text className='text-red-500'>*</Text>
										</Text>
										{allClients.length === 0 ? (
											<Text className='text-text-secondary text-sm'>
												No clients available
											</Text>
										) : (
											allClients.map((client: any) => (
												<TouchableOpacity
													key={client.id}
													onPress={() => {
														if (selectedClients.includes(client.id)) {
															setSelectedClients(
																selectedClients.filter((id) => id !== client.id)
															);
															// Clear goal if it was for this client
															if (selectedGoalId) {
																const goal = myGoals.find((g: any) => {
																	const goalClientId = String(
																		g.clientId || g.client?.id || ''
																	);
																	return (
																		String(g.id) === String(selectedGoalId) &&
																		String(client.id) === goalClientId
																	);
																});
																if (goal) {
																	setSelectedGoalId('');
																	setErrors({ ...errors, goalId: '' });
																}
															}
															setErrors({ ...errors, clients: '' });
														} else {
															setSelectedClients([
																...selectedClients,
																client.id,
															]);
															setErrors({ ...errors, clients: '' });
														}
													}}
													className={`p-3 rounded-lg mb-2 border ${
														selectedClients.includes(client.id)
															? 'bg-[#F9C513]/20 border-[#F9C513]'
															: 'bg-bg-darker border-[#F9C513]'
													}`}
													style={{ borderWidth: 0.5 }}
												>
													<Text className='text-text-primary'>
														{client.firstName} {client.lastName}
													</Text>
												</TouchableOpacity>
											))
										)}
										{errors.clients && (
											<Text className='text-red-500 text-sm mt-1'>
												{errors.clients}
											</Text>
										)}
									</View>
									<View className='mb-4'>
										<Text className='text-text-primary font-semibold mb-2'>
											Link to Goal <Text className='text-red-500'>*</Text>
										</Text>
										<Select
											options={availableGoals.map((goal: any) => ({
												label: `${goal.title} - ${goal.client?.firstName} ${goal.client?.lastName}`,
												value: goal.id,
											}))}
											value={selectedGoalId}
											onChange={(value) => {
												setSelectedGoalId(value);
												setErrors({ ...errors, goalId: '' });
											}}
											placeholder={
												selectedClients.length === 0
													? 'Select clients first to see their goals'
													: availableGoals.length === 0
														? 'No goals available for selected clients'
														: 'Select a goal'
											}
											disabled={
												selectedClients.length === 0 ||
												availableGoals.length === 0
											}
											error={errors.goalId}
										/>
										{selectedClients.length === 0 && (
											<Text className='text-text-secondary text-xs mt-1'>
												Select clients above to see their available goals
											</Text>
										)}
										{selectedClients.length > 0 &&
											availableGoals.length === 0 && (
												<Text className='text-red-500 text-xs mt-1'>
													No goals available for the selected clients. Please
													assign yourself to their goals first.
												</Text>
											)}
										{errors.goalId && (
											<Text className='text-red-500 text-sm mt-1'>
												{errors.goalId}
											</Text>
										)}
									</View>
									<DatePicker
										label='Date'
										value={date}
										onChange={setDate}
										minimumDate={new Date()}
										error={errors.date}
									/>
									<TimePicker
										label='Start Time'
										value={startTime}
										onChange={(time) => {
											setStartTime(time);
											setErrors({ ...errors, startTime: '' });
										}}
										placeholder='Select start time'
										error={errors.startTime}
									/>
									<View className='mt-4'>
										<TimePicker
											label='End Time (Optional)'
											value={endTime}
											onChange={setEndTime}
											placeholder='Select end time'
										/>
									</View>
									<View className='mb-4 mt-4'>
										<Text className='text-text-primary font-semibold mb-2'>
											Workout Exercises
										</Text>
										<TouchableOpacity
											onPress={() => {
												console.log('Opening workout modal');
												// Remember that create modal was open and close it
												setWasCreateModalOpen(showCreateModal);
												setShowCreateModal(false);
												// Small delay to ensure modal closes before opening new one
												setTimeout(() => {
													setShowWorkoutModal(true);
												}, 300);
											}}
											activeOpacity={0.7}
											className='p-3 bg-bg-darker rounded-lg border border-[#F9C513]'
											style={{ borderWidth: 0.5 }}
										>
											<View className='flex-row items-center justify-between'>
												<View className='flex-row items-center'>
													<Ionicons name='barbell' size={20} color='#F9C513' />
													<Text className='text-text-primary ml-2'>
														{selectedWorkouts.length > 0
															? `${selectedWorkouts.length} exercise(s) selected`
															: 'Add Workout Exercises'}
													</Text>
												</View>
												<Ionicons
													name='chevron-forward'
													size={20}
													color='#8E8E93'
												/>
											</View>
										</TouchableOpacity>
										{selectedWorkouts.length > 0 && (
											<View className='mt-3'>
												{selectedWorkouts.map((workout, index) => (
													<View
														key={index}
														className='bg-bg-darker rounded-lg p-3 mb-2 border border-[#F9C513]'
														style={{ borderWidth: 0.5 }}
													>
														<View className='flex-row items-center justify-between mb-2'>
															<Text className='text-text-primary font-semibold flex-1'>
																{workout.name}
															</Text>
															<TouchableOpacity
																onPress={() => handleRemoveWorkout(index)}
																className='ml-2'
															>
																<Ionicons
																	name='close-circle'
																	size={20}
																	color='#FF3B30'
																/>
															</TouchableOpacity>
														</View>
														<View className='flex-row items-center gap-3 mt-2'>
															<View className='flex-1'>
																<Text className='text-text-secondary text-xs mb-1'>
																	Sets
																</Text>
																<TextInput
																	value={workout.sets}
																	onChangeText={(text) =>
																		handleUpdateWorkoutSets(index, text)
																	}
																	keyboardType='number-pad'
																	className='bg-bg-primary rounded-lg p-2 text-text-primary border border-[#F9C513]'
																	style={{ borderWidth: 0.5 }}
																/>
															</View>
															<View className='flex-1'>
																<Text className='text-text-secondary text-xs mb-1'>
																	Reps
																</Text>
																<TextInput
																	value={workout.reps}
																	onChangeText={(text) =>
																		handleUpdateWorkoutReps(index, text)
																	}
																	keyboardType='number-pad'
																	className='bg-bg-primary rounded-lg p-2 text-text-primary border border-[#F9C513]'
																	style={{ borderWidth: 0.5 }}
																/>
															</View>
														</View>
													</View>
												))}
											</View>
										)}
									</View>
									<GradientButton
										onPress={handleCreateSession}
										loading={creatingFromTemplate}
										className='mt-4'
									>
										Schedule Session
									</GradientButton>
								</>
							) : (
								<>
									{/* Save as reusable template button - moved to top */}
									{!isTemplate && (
										<TouchableOpacity
											onPress={() => setIsTemplate(true)}
											className='mb-4 p-3 bg-bg-darker rounded-lg border border-[#F9C513]'
											style={{ borderWidth: 0.5 }}
										>
											<View className='flex-row items-center'>
												<Ionicons name='copy' size={20} color='#F9C513' />
												<Text className='text-text-primary ml-2'>
													Save as reusable template
												</Text>
											</View>
										</TouchableOpacity>
									)}

									{!isTemplate && (
										<View className='mb-4'>
											<Text className='text-text-primary font-semibold mb-2'>
												Link to Goal <Text className='text-red-500'>*</Text>
											</Text>
											<Select
												options={availableGoals.map((goal: any) => ({
													label: `${goal.title} - ${goal.client?.firstName} ${goal.client?.lastName}`,
													value: goal.id,
												}))}
												value={selectedGoalId}
												onChange={setSelectedGoalId}
												placeholder={
													selectedClients.length === 0
														? 'Select clients first to see their goals'
														: availableGoals.length === 0
															? 'No goals available for selected clients'
															: 'Select a goal'
												}
												disabled={
													selectedClients.length === 0 ||
													availableGoals.length === 0
												}
												error={errors.goalId}
											/>
											{selectedClients.length === 0 && (
												<Text className='text-text-secondary text-xs mt-1'>
													Select clients above to see their available goals
												</Text>
											)}
											{selectedClients.length > 0 &&
												availableGoals.length === 0 && (
													<Text className='text-red-500 text-xs mt-1'>
														No goals available for the selected clients. Please
														assign yourself to their goals first.
													</Text>
												)}
											{errors.goalId && (
												<Text className='text-red-500 text-sm mt-1'>
													{errors.goalId}
												</Text>
											)}
										</View>
									)}

									<Input
										label='Workout Name'
										placeholder='e.g., Chest, Back, Leg Day'
										value={sessionName}
										onChangeText={(text) => {
											setSessionName(text);
											setErrors({ ...errors, sessionName: '' });
										}}
										error={errors.sessionName}
									/>

									{!isTemplate && (
										<>
											<DatePicker
												label='Date'
												value={date}
												onChange={setDate}
												minimumDate={new Date()}
												error={errors.date}
											/>
											<TimePicker
												label='Start Time'
												value={startTime}
												onChange={(time) => {
													setStartTime(time);
													setErrors({ ...errors, startTime: '' });
												}}
												placeholder='Select start time'
												error={errors.startTime}
											/>
											<View className='mt-4'>
												<TimePicker
													label='End Time (Optional)'
													value={endTime}
													onChange={setEndTime}
													placeholder='Select end time'
												/>
											</View>
										</>
									)}

									<Select
										label='Gym Area'
										options={gymAreas}
										value={gymArea}
										onChange={(value) => {
											setGymArea(value);
											setErrors({ ...errors, gymArea: '' });
										}}
										placeholder='Select gym area'
										error={errors.gymArea}
									/>

									<View className='mb-4 mt-4'>
										<Text className='text-text-primary font-semibold mb-2'>
											Workout Exercises
										</Text>
										<TouchableOpacity
											onPress={() => {
												console.log('Opening workout modal');
												// Remember that create modal was open and close it
												setWasCreateModalOpen(showCreateModal);
												setShowCreateModal(false);
												// Small delay to ensure modal closes before opening new one
												setTimeout(() => {
													setShowWorkoutModal(true);
												}, 300);
											}}
											activeOpacity={0.7}
											className='p-3 bg-bg-darker rounded-lg border border-[#F9C513]'
											style={{ borderWidth: 0.5 }}
										>
											<View className='flex-row items-center justify-between'>
												<View className='flex-row items-center'>
													<Ionicons name='barbell' size={20} color='#F9C513' />
													<Text className='text-text-primary ml-2'>
														{selectedWorkouts.length > 0
															? `${selectedWorkouts.length} exercise(s) selected`
															: 'Add Workout Exercises'}
													</Text>
												</View>
												<Ionicons
													name='chevron-forward'
													size={20}
													color='#8E8E93'
												/>
											</View>
										</TouchableOpacity>
										{selectedWorkouts.length > 0 && (
											<View className='mt-3'>
												{selectedWorkouts.map((workout, index) => (
													<View
														key={index}
														className='bg-bg-darker rounded-lg p-3 mb-2 border border-[#F9C513]'
														style={{ borderWidth: 0.5 }}
													>
														<View className='flex-row items-center justify-between mb-2'>
															<Text className='text-text-primary font-semibold flex-1'>
																{workout.name}
															</Text>
															<TouchableOpacity
																onPress={() => handleRemoveWorkout(index)}
																className='ml-2'
															>
																<Ionicons
																	name='close-circle'
																	size={20}
																	color='#FF3B30'
																/>
															</TouchableOpacity>
														</View>
														<View className='flex-row items-center gap-3 mt-2'>
															<View className='flex-1'>
																<Text className='text-text-secondary text-xs mb-1'>
																	Sets
																</Text>
																<TextInput
																	value={workout.sets}
																	onChangeText={(text) =>
																		handleUpdateWorkoutSets(index, text)
																	}
																	keyboardType='number-pad'
																	className='bg-bg-primary rounded-lg p-2 text-text-primary border border-[#F9C513]'
																	style={{ borderWidth: 0.5 }}
																/>
															</View>
															<View className='flex-1'>
																<Text className='text-text-secondary text-xs mb-1'>
																	Reps
																</Text>
																<TextInput
																	value={workout.reps}
																	onChangeText={(text) =>
																		handleUpdateWorkoutReps(index, text)
																	}
																	keyboardType='number-pad'
																	className='bg-bg-primary rounded-lg p-2 text-text-primary border border-[#F9C513]'
																	style={{ borderWidth: 0.5 }}
																/>
															</View>
														</View>
													</View>
												))}
											</View>
										)}
									</View>

									{!isTemplate && (
										<View className='mb-4'>
											<Text className='text-text-primary font-semibold mb-2'>
												Select Clients
											</Text>
											{allClients.length === 0 ? (
												<Text className='text-text-secondary text-sm'>
													No clients available
												</Text>
											) : (
												allClients.map((client: any) => (
													<TouchableOpacity
														key={client.id}
														onPress={() => {
															if (selectedClients.includes(client.id)) {
																setSelectedClients(
																	selectedClients.filter(
																		(id) => id !== client.id
																	)
																);
																// Clear goal if it was for this client
																if (selectedGoalId) {
																	const goal = myGoals.find((g: any) => {
																		const goalClientId = String(
																			g.clientId || g.client?.id || ''
																		);
																		return (
																			String(g.id) === String(selectedGoalId) &&
																			String(client.id) === goalClientId
																		);
																	});
																	if (goal) {
																		setSelectedGoalId('');
																	}
																}
															} else {
																setSelectedClients([
																	...selectedClients,
																	client.id,
																]);
															}
														}}
														className={`p-3 rounded-lg mb-2 border ${
															selectedClients.includes(client.id)
																? 'bg-[#F9C513]/20 border-[#F9C513]'
																: 'bg-bg-darker border-[#F9C513]'
														}`}
														style={{ borderWidth: 0.5 }}
													>
														<Text className='text-text-primary'>
															{client.firstName} {client.lastName}
														</Text>
													</TouchableOpacity>
												))
											)}
											{errors.clients && (
												<Text className='text-red-500 text-sm mt-1'>
													{errors.clients}
												</Text>
											)}
										</View>
									)}

									<Input
										label='Notes (Optional)'
										placeholder='Additional notes...'
										value={note}
										onChangeText={setNote}
										multiline
										numberOfLines={3}
									/>

									<GradientButton
										onPress={handleCreateSession}
										loading={creating}
										className='mt-4'
									>
										{isTemplate ? 'Create Template' : 'Create Session'}
									</GradientButton>
								</>
							)}
						</ScrollView>
					</View>
				</View>
			</Modal>

			{/* Progress Images Modal */}
			<Modal
				visible={showProgressImagesModal}
				animationType='slide'
				transparent
				onRequestClose={() => {
					setShowProgressImagesModal(false);
					setSelectedSessionForProgress(null);
				}}
			>
				<View className='flex-1 bg-bg-darker justify-end'>
					<View
						className='bg-bg-primary rounded-t-3xl p-6 max-h-[90%] border-t border-[#F9C513]'
						style={{ borderTopWidth: 0.5 }}
					>
						<ScrollView showsVerticalScrollIndicator={false}>
							<View className='flex-row justify-between items-center mb-6'>
								<View className='flex-1'>
									<Text className='text-2xl font-bold text-text-primary'>
										Progress Photos
									</Text>
									{selectedSessionForProgress && (
										<Text className='text-text-secondary text-sm mt-1'>
											{selectedSessionForProgress.name} -{' '}
											{formatDate(selectedSessionForProgress.date)}
										</Text>
									)}
								</View>
								<TouchableOpacity
									onPress={() => {
										setShowProgressImagesModal(false);
										setSelectedSessionForProgress(null);
									}}
								>
									<Ionicons name='close' size={28} color='#8E8E93' />
								</TouchableOpacity>
							</View>

							{sessionLogData?.getSessionLogBySessionId ? (
								<View>
									{sessionLogData.getSessionLogBySessionId.progressImages ? (
										<View>
											{sessionLogData.getSessionLogBySessionId.progressImages
												.front && (
												<View className='mb-4'>
													<Text className='text-text-primary font-semibold mb-2'>
														Front
													</Text>
													<Image
														source={{
															uri: sessionLogData.getSessionLogBySessionId
																.progressImages.front,
														}}
														style={{
															width: '100%',
															height: Dimensions.get('window').width * 0.8,
															borderRadius: 12,
															borderWidth: 0.5,
															borderColor: '#F9C513',
														}}
														resizeMode='cover'
													/>
												</View>
											)}
											{sessionLogData.getSessionLogBySessionId.progressImages
												.rightSide && (
												<View className='mb-4'>
													<Text className='text-text-primary font-semibold mb-2'>
														Right Side
													</Text>
													<Image
														source={{
															uri: sessionLogData.getSessionLogBySessionId
																.progressImages.rightSide,
														}}
														style={{
															width: '100%',
															height: Dimensions.get('window').width * 0.8,
															borderRadius: 12,
															borderWidth: 0.5,
															borderColor: '#F9C513',
														}}
														resizeMode='cover'
													/>
												</View>
											)}
											{sessionLogData.getSessionLogBySessionId.progressImages
												.leftSide && (
												<View className='mb-4'>
													<Text className='text-text-primary font-semibold mb-2'>
														Left Side
													</Text>
													<Image
														source={{
															uri: sessionLogData.getSessionLogBySessionId
																.progressImages.leftSide,
														}}
														style={{
															width: '100%',
															height: Dimensions.get('window').width * 0.8,
															borderRadius: 12,
															borderWidth: 0.5,
															borderColor: '#F9C513',
														}}
														resizeMode='cover'
													/>
												</View>
											)}
											{sessionLogData.getSessionLogBySessionId.progressImages
												.back && (
												<View className='mb-4'>
													<Text className='text-text-primary font-semibold mb-2'>
														Back
													</Text>
													<Image
														source={{
															uri: sessionLogData.getSessionLogBySessionId
																.progressImages.back,
														}}
														style={{
															width: '100%',
															height: Dimensions.get('window').width * 0.8,
															borderRadius: 12,
															borderWidth: 0.5,
															borderColor: '#F9C513',
														}}
														resizeMode='cover'
													/>
												</View>
											)}
											{sessionLogData.getSessionLogBySessionId.weight && (
												<View
													className='mb-4 p-4 bg-bg-darker rounded-xl border border-[#F9C513]'
													style={{ borderWidth: 0.5 }}
												>
													<Text className='text-text-primary font-semibold mb-1'>
														Weight
													</Text>
													<Text className='text-text-secondary text-lg'>
														{sessionLogData.getSessionLogBySessionId.weight} kg
													</Text>
												</View>
											)}
										</View>
									) : (
										<View className='items-center py-10'>
											<Ionicons
												name='images-outline'
												size={64}
												color='#8E8E93'
											/>
											<Text className='text-text-secondary mt-4 text-center'>
												No progress photos available yet
											</Text>
											<Text className='text-text-secondary text-sm mt-2 text-center'>
												The client hasn&apos;t completed this session yet
											</Text>
										</View>
									)}
								</View>
							) : (
								<View className='items-center py-10'>
									<Text className='text-text-secondary'>Loading...</Text>
								</View>
							)}
						</ScrollView>
					</View>
				</View>
			</Modal>

			{/* Workout Selection Modal */}
			<Modal
				visible={showWorkoutModal}
				animationType='slide'
				transparent={true}
				statusBarTranslucent={true}
				onRequestClose={() => {
					setShowWorkoutModal(false);
					// Reopen create modal if it was open before
					if (wasCreateModalOpen) {
						setTimeout(() => {
							setShowCreateModal(true);
							setWasCreateModalOpen(false);
						}, 300);
					}
				}}
			>
				<View className='flex-1 bg-bg-darker justify-end'>
					<View
						className='bg-bg-primary rounded-t-3xl border-t border-[#F9C513]'
						style={{ borderTopWidth: 0.5, maxHeight: '90%', minHeight: '85%' }}
					>
						<View className='p-5 pb-0'>
							<View className='flex-row justify-between items-center mb-6'>
								<Text className='text-2xl font-bold text-text-primary'>
									Select Workout Exercises
								</Text>
								<TouchableOpacity
									onPress={() => {
										setShowWorkoutModal(false);
										// Reopen create modal if it was open before
										if (wasCreateModalOpen) {
											setTimeout(() => {
												setShowCreateModal(true);
												setWasCreateModalOpen(false);
											}, 300);
										}
									}}
								>
									<Ionicons name='close' size={28} color='#8E8E93' />
								</TouchableOpacity>
							</View>
						</View>

						<ScrollView
							className='flex-1 px-5'
							showsVerticalScrollIndicator={false}
							contentContainerStyle={{ paddingBottom: 20 }}
						>
							{!apiKey ? (
								<View className='items-center py-10'>
									<Text className='text-text-secondary text-center'>
										Missing ExerciseDB API key. Please configure it in app.json
									</Text>
								</View>
							) : (
								<>
									<View className='mb-4'>
										<TextInput
											placeholder='Search by name, body part, or target muscle'
											placeholderTextColor='#8E8E93'
											value={searchWorkout}
											onChangeText={setSearchWorkout}
											className='bg-bg-darker rounded-lg p-3 text-text-primary border border-[#F9C513]'
											style={{ borderWidth: 0.5 }}
										/>
									</View>

									{categories.length > 0 && (
										<View className='mb-4'>
											<FlatList
												data={['all', ...categories]}
												keyExtractor={(item) => item}
												horizontal
												showsHorizontalScrollIndicator={false}
												renderItem={({ item }) => {
													const active = item === selectedCategory;
													const label =
														item === 'all'
															? 'All workouts'
															: item.replace(/(^\w|\s\w)/g, (m) =>
																	m.toUpperCase()
																);
													return (
														<TouchableOpacity
															onPress={() => {
																setSelectedCategory(item);
																fetchExercisesByCategory(item);
															}}
															className={`px-4 py-2 rounded-full mr-2 border ${
																active
																	? 'bg-[#F9C513] border-[#F9C513]'
																	: 'bg-bg-darker border-[#F9C513]'
															}`}
															style={{ borderWidth: 0.5 }}
														>
															<Text
																className={`text-sm ${
																	active
																		? 'text-bg-darker font-semibold'
																		: 'text-text-primary'
																}`}
															>
																{label}
															</Text>
														</TouchableOpacity>
													);
												}}
											/>
										</View>
									)}

									{isLoadingWorkouts ? (
										<View className='items-center py-10'>
											<ActivityIndicator size='large' color='#F9C513' />
											<Text className='text-text-secondary mt-4'>
												Loading workouts...
											</Text>
										</View>
									) : (
										<View style={{ minHeight: 300 }}>
											<FlatList
												data={filteredExercises}
												keyExtractor={(item) => item.id}
												scrollEnabled={false}
												renderItem={({ item }) => {
													const isSelected = selectedWorkouts.some(
														(w) => w.id === item.id
													);
													const gifUrl = buildExerciseImageUrl(item.id);
													return (
														<TouchableOpacity
															onPress={() => {
																if (isSelected) {
																	setSelectedWorkouts(
																		selectedWorkouts.filter(
																			(w) => w.id !== item.id
																		)
																	);
																} else {
																	handleAddWorkout(item);
																}
															}}
															className={`p-3 rounded-lg mb-3 border ${
																isSelected
																	? 'bg-[#F9C513]/20 border-[#F9C513]'
																	: 'bg-bg-darker border-[#F9C513]'
															}`}
															style={{ borderWidth: 0.5 }}
														>
															<View className='flex-row items-center'>
																{gifUrl && (
																	<ExpoImage
																		source={{ uri: gifUrl }}
																		style={{
																			width: 80,
																			height: 80,
																			borderRadius: 8,
																			marginRight: 12,
																		}}
																		contentFit='cover'
																	/>
																)}
																<View className='flex-1'>
																	<Text className='text-text-primary font-semibold text-base mb-1'>
																		{item.name}
																	</Text>
																	<Text className='text-text-secondary text-sm'>
																		{item.bodyPart} • {item.target}
																	</Text>
																	{item.equipment && (
																		<Text className='text-text-secondary text-xs mt-1'>
																			Equipment: {item.equipment}
																		</Text>
																	)}
																</View>
																{isSelected && (
																	<Ionicons
																		name='checkmark-circle'
																		size={24}
																		color='#F9C513'
																	/>
																)}
															</View>
														</TouchableOpacity>
													);
												}}
												ListEmptyComponent={
													<View
														className='items-center justify-center'
														style={{ minHeight: 300 }}
													>
														<Text className='text-text-secondary text-center'>
															No workouts found. Try a different search term.
														</Text>
													</View>
												}
											/>
										</View>
									)}

									{selectedWorkouts.length > 0 && (
										<View
											className='mt-4 pt-4 border-t border-[#F9C513]'
											style={{ borderTopWidth: 0.5 }}
										>
											<Text className='text-text-primary font-semibold mb-3'>
												Selected Exercises ({selectedWorkouts.length})
											</Text>
											<ScrollView
												horizontal
												showsHorizontalScrollIndicator={false}
											>
												{selectedWorkouts.map((workout, index) => (
													<View
														key={index}
														className='bg-bg-darker rounded-lg p-3 mr-2 border border-[#F9C513]'
														style={{ borderWidth: 0.5, minWidth: 120 }}
													>
														{workout.gifUrl && (
															<ExpoImage
																source={{ uri: workout.gifUrl }}
																style={{
																	width: 100,
																	height: 100,
																	borderRadius: 8,
																	marginBottom: 8,
																}}
																contentFit='cover'
															/>
														)}
														<Text
															className='text-text-primary font-semibold text-xs mb-2'
															numberOfLines={2}
														>
															{workout.name}
														</Text>
														<Text className='text-[#F9C513] text-xs'>
															{workout.sets} sets × {workout.reps} reps
														</Text>
													</View>
												))}
											</ScrollView>
										</View>
									)}
								</>
							)}
						</ScrollView>

						<View
							className='p-5 pt-4 border-t border-[#F9C513]'
							style={{ borderTopWidth: 0.5 }}
						>
							<GradientButton
								onPress={() => {
									setShowWorkoutModal(false);
									// Reopen create modal if it was open before
									if (wasCreateModalOpen) {
										setTimeout(() => {
											setShowCreateModal(true);
											setWasCreateModalOpen(false);
										}, 300);
									}
								}}
							>
								Done
							</GradientButton>
						</View>
					</View>
				</View>
			</Modal>
		</FixedView>
	);
};

export default CoachSchedule;
