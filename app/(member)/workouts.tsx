import FixedView from '@/components/FixedView';
import { TourStep } from '@/components/TourStep';
import Constants from 'expo-constants';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
	ActivityIndicator,
	FlatList,
	Modal,
	RefreshControl,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';

type Exercise = {
	id: string;
	name: string;
	bodyPart: string;
	target: string;
	equipment?: string;
};

const DEFAULT_TIMER_SECONDS = 30;
const TIMER_OPTIONS = [20, 30, 45, 60];
const IMAGE_RESOLUTION = '360';
const ALL_CATEGORY = 'all';

const MemberWorkouts = () => {
	const [exercises, setExercises] = useState<Exercise[]>([]);
	const [allExercises, setAllExercises] = useState<Exercise[] | null>(null);
	const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
	const [categories, setCategories] = useState<string[]>([]);
	const [selectedCategory, setSelectedCategory] =
		useState<string>(ALL_CATEGORY);
	const [search, setSearch] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [isCategoriesLoading, setIsCategoriesLoading] = useState(false);
	const [isGlobalSearchLoading, setIsGlobalSearchLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
		null
	);
	const [secondsLeft, setSecondsLeft] = useState(DEFAULT_TIMER_SECONDS);
	const [isTimerRunning, setIsTimerRunning] = useState(false);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [timerDuration, setTimerDuration] = useState(DEFAULT_TIMER_SECONDS);
	const [hasCompletedCurrentRound, setHasCompletedCurrentRound] =
		useState(false);

	const apiKey =
		(Constants?.expoConfig as any)?.extra?.exerciseDbApiKey ??
		(Constants?.manifest as any)?.extra?.exerciseDbApiKey;

	const canFetch = useMemo(() => !!apiKey, [apiKey]);

	const playSound = useCallback(async (type: 'start' | 'end') => {
		// TODO: Once expo-av is installed, implement real audio playback.
		// This placeholder keeps the logic in-place without adding a hard dependency.
		return Promise.resolve();
	}, []);

	const buildExerciseImageUrl = useCallback(
		(exerciseId: string) => {
			if (!apiKey) return null;
			return `https://exercisedb.p.rapidapi.com/image?exerciseId=${encodeURIComponent(
				exerciseId
			)}&resolution=${IMAGE_RESOLUTION}&rapidapi-key=${apiKey}`;
		},
		[apiKey]
	);

	const fetchExercisesByCategory = useCallback(
		async (bodyPart: string | typeof ALL_CATEGORY) => {
			try {
				setIsLoading(true);
				setError(null);

				let url: string;
				if (bodyPart === ALL_CATEGORY) {
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

				const data = (await response.json()) as Exercise[];
				setExercises(data);
				setFilteredExercises(data);
			} catch (err: any) {
				setError(
					err?.message ??
						'Unable to load workouts right now. Please try again later.'
				);
			} finally {
				setIsLoading(false);
			}
		},
		[apiKey]
	);

	const ensureAllExercisesLoaded = useCallback(async () => {
		if (allExercises && allExercises.length > 0) {
			return allExercises;
		}

		try {
			setIsGlobalSearchLoading(true);

			const response = await fetch(
				'https://exercisedb.p.rapidapi.com/exercises?limit=1200&offset=0',
				{
					method: 'GET',
					headers: {
						'X-RapidAPI-Key': apiKey as string,
						'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com',
					},
				}
			);

			if (!response.ok) {
				throw new Error(`Failed to load all workouts (${response.status})`);
			}

			const data = (await response.json()) as Exercise[];
			setAllExercises(data);
			return data;
		} catch {
			// If this fails, fall back to current category data only
			return exercises;
		} finally {
			setIsGlobalSearchLoading(false);
		}
	}, [allExercises, apiKey, exercises]);

	useEffect(() => {
		if (!canFetch) return;

		const fetchCategoriesAndInitialExercises = async () => {
			try {
				setIsCategoriesLoading(true);
				setError(null);

				// Fetch available body-part categories
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

				const categoriesData = (await categoriesResponse.json()) as string[];
				const normalizedCategories = categoriesData.map((c) => c.toLowerCase());
				setCategories(normalizedCategories);

				// Start with all workouts by default so we always hit a valid endpoint
				setSelectedCategory(ALL_CATEGORY);
				await fetchExercisesByCategory(ALL_CATEGORY);
			} catch (err: any) {
				setError(
					err?.message ??
						'Unable to load workouts right now. Please try again later.'
				);
			} finally {
				setIsCategoriesLoading(false);
			}
		};

		void fetchCategoriesAndInitialExercises();
	}, [apiKey, canFetch, fetchExercisesByCategory]);

	useEffect(() => {
		const runSearch = async () => {
			const trimmed = search.trim();
			if (!trimmed) {
				setFilteredExercises(exercises);
				return;
			}

			const source = await ensureAllExercisesLoaded();
			const q = trimmed.toLowerCase();

			setFilteredExercises(
				source.filter(
					(ex) =>
						ex.name.toLowerCase().includes(q) ||
						ex.bodyPart.toLowerCase().includes(q) ||
						ex.target.toLowerCase().includes(q)
				)
			);
		};

		void runSearch();
	}, [ensureAllExercisesLoaded, exercises, search]);

	useEffect(() => {
		if (!hasCompletedCurrentRound || secondsLeft !== 0) return;

		void playSound('end');
		void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
	}, [hasCompletedCurrentRound, playSound, secondsLeft]);

	useEffect(() => {
		if (!isTimerRunning) return;

		if (secondsLeft <= 0) {
			setIsTimerRunning(false);
			setHasCompletedCurrentRound(true);
			return;
		}

		const interval = setInterval(() => {
			setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
		}, 1000);

		return () => clearInterval(interval);
	}, [isTimerRunning, secondsLeft]);

	const onSelectExercise = useCallback((exercise: Exercise) => {
		setSelectedExercise(exercise);
		setTimerDuration(DEFAULT_TIMER_SECONDS);
		setSecondsLeft(DEFAULT_TIMER_SECONDS);
		setIsTimerRunning(false);
		setHasCompletedCurrentRound(false);
	}, []);

	const closeModal = useCallback(() => {
		setSelectedExercise(null);
		setIsTimerRunning(false);
		setSecondsLeft(DEFAULT_TIMER_SECONDS);
		setHasCompletedCurrentRound(false);
	}, []);

	const toggleTimer = useCallback(() => {
		const wasRunning = isTimerRunning;

		if (!wasRunning && secondsLeft <= 0) {
			setSecondsLeft(timerDuration);
		}

		setIsTimerRunning(!wasRunning);
		setHasCompletedCurrentRound(false);

		if (!wasRunning) {
			void playSound('start');
			void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
		} else {
			void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
		}
	}, [isTimerRunning, playSound, secondsLeft, timerDuration]);

	const resetTimer = useCallback(() => {
		setSecondsLeft(timerDuration);
		setIsTimerRunning(false);
		setHasCompletedCurrentRound(false);
		void Haptics.selectionAsync();
	}, [timerDuration]);

	const renderExercise = ({ item }: { item: Exercise }) => (
		<TouchableOpacity
			style={styles.card}
			activeOpacity={0.8}
			onPress={() => onSelectExercise(item)}
		>
			<View style={styles.cardHeader}>
				<View style={styles.cardHeaderText}>
					<Text style={styles.cardTitle}>{item.name}</Text>
					<Text style={styles.cardSubtitle}>
						Target:{' '}
						<Text style={styles.cardSubtitleHighlight}>{item.target}</Text>
					</Text>
					{item.equipment ? (
						<Text style={styles.cardMeta}>Equipment: {item.equipment}</Text>
					) : null}
					<Text style={styles.cardTag}>{item.bodyPart}</Text>
				</View>
				{buildExerciseImageUrl(item.id) ? (
					<Image
						source={{ uri: buildExerciseImageUrl(item.id) as string }}
						style={styles.cardGif}
						resizeMode='cover'
					/>
				) : null}
			</View>
		</TouchableOpacity>
	);

	const onSelectCategory = useCallback(
		async (category: string) => {
			if (category === selectedCategory) return;

			setSelectedCategory(category);
			await fetchExercisesByCategory(category);
		},
		[fetchExercisesByCategory, selectedCategory]
	);

	const onRefresh = useCallback(async () => {
		if (!canFetch) return;
		setIsRefreshing(true);
		await fetchExercisesByCategory(selectedCategory);
		setIsRefreshing(false);
	}, [canFetch, fetchExercisesByCategory, selectedCategory]);

	return (
		<FixedView className='flex-1 bg-bg-darker px-4' extraTopPadding={16}>
			<TourStep stepId='workouts'>
				<View style={styles.header}>
					<View style={styles.headerRow}>
						<View style={styles.headerTextGroup}>
							<Text style={styles.title}>Workouts</Text>
							<Text style={styles.subtitle}>
								Explore guided exercises and train with the built-in timer.
							</Text>
						</View>
						<View style={styles.headerPill}>
							<Text style={styles.headerPillText}>Free access</Text>
						</View>
					</View>
				</View>
			</TourStep>

			{!canFetch ? (
				<View style={styles.center}>
					<Text style={styles.errorText}>
						Missing ExerciseDB API key. Add `exerciseDbApiKey` under `extra` in
						`app.json` to enable free workouts.
					</Text>
				</View>
			) : isCategoriesLoading && !categories.length ? (
				<View style={styles.center}>
					<ActivityIndicator size='large' color='#F9C513' />
					<Text style={styles.loadingText}>Loading workout categories...</Text>
				</View>
			) : isLoading && !exercises.length ? (
				<View style={styles.center}>
					<ActivityIndicator size='large' color='#F9C513' />
					<Text style={styles.loadingText}>Loading workouts for you...</Text>
				</View>
			) : error ? (
				<View style={styles.center}>
					<Text style={styles.errorText}>{error}</Text>
				</View>
			) : (
				<>
					<TourStep stepId='workouts_search'>
						<View style={styles.searchRow}>
							<TextInput
								placeholder='Search by name, body part, or target muscle'
								placeholderTextColor='#8E8E93'
								value={search}
								onChangeText={setSearch}
								style={styles.searchInput}
							/>
						{isGlobalSearchLoading && (
							<ActivityIndicator size='small' color='#F9C513' />
						)}
						</View>
					</TourStep>

					{categories.length > 0 && (
						<View style={styles.categoriesContainer}>
							<FlatList
								data={[ALL_CATEGORY, ...categories]}
								keyExtractor={(item) => item}
								horizontal
								showsHorizontalScrollIndicator={false}
								contentContainerStyle={styles.categoriesListContent}
								renderItem={({ item }) => {
									const active = item === selectedCategory;
									const label =
										item === ALL_CATEGORY
											? 'All workouts'
											: item.replace(/(^\w|\s\w)/g, (m) => m.toUpperCase());
									return (
										<TouchableOpacity
											onPress={() => onSelectCategory(item)}
											style={[
												styles.categoryChip,
												active && styles.categoryChipActive,
											]}
											activeOpacity={0.9}
										>
											<Text
												style={[
													styles.categoryChipText,
													active && styles.categoryChipTextActive,
												]}
											>
												{label}
											</Text>
										</TouchableOpacity>
									);
								}}
							/>
						</View>
					)}

					<FlatList
						data={filteredExercises}
						keyExtractor={(item) => item.id}
						renderItem={renderExercise}
						contentContainerStyle={styles.listContent}
						showsVerticalScrollIndicator={false}
						refreshControl={
							<RefreshControl
								refreshing={isRefreshing}
								onRefresh={onRefresh}
								tintColor='#F9C513'
								colors={['#F9C513']}
							/>
						}
						ListEmptyComponent={
							<View style={styles.center}>
								<Text style={styles.emptyText}>
									No workouts found. Try a different search term.
								</Text>
							</View>
						}
					/>
				</>
			)}

			<Modal
				visible={!!selectedExercise}
				animationType='slide'
				transparent
				onRequestClose={closeModal}
			>
				<View style={styles.modalOverlay}>
					<View style={styles.modalContent}>
						{selectedExercise && (
							<ScrollView
								showsVerticalScrollIndicator={false}
								contentContainerStyle={styles.modalScrollContent}
								keyboardShouldPersistTaps='handled'
							>
								<View style={styles.modalHeaderRow}>
									<Text style={styles.modalTitle}>{selectedExercise.name}</Text>
									<TouchableOpacity
										onPress={closeModal}
										style={styles.modalCloseIconButton}
										hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
									>
										<Text style={styles.modalCloseIconText}>✕</Text>
									</TouchableOpacity>
								</View>
								<Text style={styles.modalSubtitle}>
									{selectedExercise.bodyPart} • {selectedExercise.target}
								</Text>
								{selectedExercise.equipment ? (
									<Text style={styles.modalMeta}>
										Equipment: {selectedExercise.equipment}
									</Text>
								) : null}

								{buildExerciseImageUrl(selectedExercise.id) ? (
									<Image
										source={{
											uri: buildExerciseImageUrl(selectedExercise.id) as string,
										}}
										style={styles.exerciseGif}
										resizeMode='contain'
									/>
								) : null}

								<View style={styles.timerContainer}>
									<Text style={styles.timerLabel}>Workout timer</Text>
									<View style={styles.timerPresetsRow}>
										{TIMER_OPTIONS.map((seconds) => (
											<TouchableOpacity
												key={seconds}
												onPress={() => {
													setTimerDuration(seconds);
													setSecondsLeft(seconds);
													setIsTimerRunning(false);
												}}
												style={[
													styles.timerPresetChip,
													timerDuration === seconds &&
														styles.timerPresetChipActive,
												]}
											>
												<Text
													style={[
														styles.timerPresetChipText,
														timerDuration === seconds &&
															styles.timerPresetChipTextActive,
													]}
												>
													{seconds}s
												</Text>
											</TouchableOpacity>
										))}
									</View>
									<View style={styles.timerCustomRow}>
										<Text style={styles.timerCustomLabel}>
											Custom (seconds)
										</Text>
										<TextInput
											style={styles.timerCustomInput}
											value={String(timerDuration)}
											keyboardType='number-pad'
											placeholder='e.g. 40'
											placeholderTextColor='#6B7280'
											onChangeText={(value) => {
												const numeric = parseInt(
													value.replace(/[^0-9]/g, ''),
													10
												);
												if (!numeric || Number.isNaN(numeric)) {
													setTimerDuration(0);
													setSecondsLeft(0);
													setIsTimerRunning(false);
													return;
												}
												const clamped = Math.min(Math.max(numeric, 5), 600);
												setTimerDuration(clamped);
												setSecondsLeft(clamped);
												setIsTimerRunning(false);
											}}
										/>
									</View>
									<Text style={styles.timerValue}>
										00:{secondsLeft.toString().padStart(2, '0')}
									</Text>
									<View style={styles.timerButtonsRow}>
										<TouchableOpacity
											style={[
												styles.timerButton,
												isTimerRunning && styles.timerButtonActive,
											]}
											onPress={toggleTimer}
										>
											<Text style={styles.timerButtonText}>
												{isTimerRunning ? 'Pause' : 'Start'}
											</Text>
										</TouchableOpacity>
										<TouchableOpacity
											style={styles.timerButtonSecondary}
											onPress={resetTimer}
										>
											<Text style={styles.timerButtonSecondaryText}>Reset</Text>
										</TouchableOpacity>
									</View>
									<Text style={styles.timerHint}>
										Use the timer to guide each set. Repeat as needed. You’ll
										feel a tap when the round is done.
									</Text>
								</View>

								<TouchableOpacity
									style={styles.closeButton}
									onPress={closeModal}
								>
									<Text style={styles.closeButtonText}>Close</Text>
								</TouchableOpacity>
							</ScrollView>
						)}
					</View>
				</View>
			</Modal>
		</FixedView>
	);
};

const styles = StyleSheet.create({
	header: {
		marginBottom: 18,
	},
	headerRow: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		justifyContent: 'space-between',
		gap: 12,
	},
	headerTextGroup: {
		flex: 1,
	},
	title: {
		fontSize: 28,
		fontWeight: 'bold',
		color: '#F5F5F5',
		marginBottom: 4,
	},
	subtitle: {
		fontSize: 14,
		color: '#B0B0B0',
		marginBottom: 8,
	},
	headerPill: {
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 999,
		backgroundColor: 'rgba(249,197,19,0.12)',
		borderWidth: 1,
		borderColor: 'rgba(249,197,19,0.45)',
	},
	headerPillText: {
		color: '#F9C513',
		fontSize: 11,
		fontWeight: '600',
		textTransform: 'uppercase',
		letterSpacing: 0.8,
	},
	freeBadge: {
		alignSelf: 'flex-start',
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: 999,
		backgroundColor: '#1D4ED8',
		color: '#F9FAFB',
		fontSize: 11,
		fontWeight: '600',
	},
	searchRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10,
		marginBottom: 8,
	},
	searchInput: {
		backgroundColor: '#1C1C1E',
		borderRadius: 12,
		paddingHorizontal: 14,
		paddingVertical: 10,
		color: '#F5F5F5',
		borderWidth: 1,
		borderColor: '#2C2C2E',
		marginBottom: 4,
		fontSize: 14,
		flex: 1,
		width: '100%',
		alignSelf: 'stretch',
	},
	categoriesContainer: {
		marginBottom: 10,
	},
	categoriesListContent: {
		gap: 8,
		paddingVertical: 2,
	},
	categoryChip: {
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 999,
		borderWidth: 1,
		borderColor: '#374151',
		backgroundColor: '#020617',
	},
	categoryChipActive: {
		backgroundColor: '#F9C513',
		borderColor: '#F9C513',
	},
	categoryChipText: {
		color: '#E5E7EB',
		fontSize: 13,
		textTransform: 'capitalize',
	},
	categoryChipTextActive: {
		color: '#111827',
		fontWeight: '600',
	},
	listContent: {
		paddingTop: 8,
		paddingBottom: 24,
	},
	card: {
		backgroundColor: '#1C1C1E',
		borderRadius: 16,
		padding: 14,
		marginBottom: 10,
		borderWidth: 1,
		borderColor: '#2C2C2E',
	},
	cardHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		gap: 12,
	},
	cardHeaderText: {
		flex: 1,
	},
	cardTitle: {
		flex: 1,
		fontSize: 16,
		fontWeight: '600',
		color: '#F5F5F5',
		marginRight: 8,
		textTransform: 'capitalize',
	},
	cardTag: {
		fontSize: 11,
		color: '#F97316',
		paddingHorizontal: 8,
		paddingVertical: 2,
		borderRadius: 999,
		backgroundColor: 'rgba(249,115,22,0.12)',
		textTransform: 'capitalize',
		alignSelf: 'flex-start',
		marginTop: 6,
	},
	cardSubtitle: {
		fontSize: 13,
		color: '#D4D4D8',
		marginTop: 4,
	},
	cardSubtitleHighlight: {
		fontWeight: '600',
	},
	cardMeta: {
		fontSize: 12,
		color: '#9CA3AF',
		marginTop: 4,
		textTransform: 'capitalize',
	},
	cardGif: {
		width: 96,
		height: 96,
		borderRadius: 12,
		backgroundColor: '#020617',
	},
	center: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 24,
	},
	loadingText: {
		marginTop: 12,
		color: '#E5E7EB',
		fontSize: 14,
	},
	errorText: {
		color: '#FCA5A5',
		textAlign: 'center',
		fontSize: 14,
	},
	emptyText: {
		color: '#9CA3AF',
		fontSize: 14,
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: 'rgba(0,0,0,0.75)',
		justifyContent: 'flex-end',
	},
	modalContent: {
		backgroundColor: '#111827',
		borderTopLeftRadius: 24,
		borderTopRightRadius: 24,
		padding: 20,
		maxHeight: '80%',
	},
	modalScrollContent: {
		paddingBottom: 16,
		gap: 8,
	},
	modalHeaderRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: 12,
	},
	modalTitle: {
		fontSize: 20,
		fontWeight: '700',
		color: '#F9FAFB',
		marginBottom: 4,
		textTransform: 'capitalize',
	},
	modalCloseIconButton: {
		width: 28,
		height: 28,
		borderRadius: 999,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#1F2937',
	},
	modalCloseIconText: {
		color: '#E5E7EB',
		fontSize: 16,
	},
	modalSubtitle: {
		fontSize: 14,
		color: '#9CA3AF',
		marginBottom: 4,
		textTransform: 'capitalize',
	},
	modalMeta: {
		fontSize: 13,
		color: '#D1D5DB',
		marginBottom: 12,
		textTransform: 'capitalize',
	},
	exerciseGif: {
		width: '100%',
		height: 220,
		borderRadius: 16,
		backgroundColor: '#020617',
		marginBottom: 16,
	},
	timerContainer: {
		borderRadius: 16,
		padding: 14,
		backgroundColor: '#020617',
		borderWidth: 1,
		borderColor: '#1F2937',
		marginBottom: 16,
	},
	timerLabel: {
		color: '#9CA3AF',
		fontSize: 12,
		marginBottom: 4,
	},
	timerValue: {
		fontSize: 60,
		fontWeight: '700',
		color: '#F9C513',
		marginBottom: 10,
		textAlign: 'center',
	},
	timerButtonsRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		marginBottom: 4,
	},
	timerPresetsRow: {
		flexDirection: 'row',
		gap: 6,
		marginBottom: 8,
	},
	timerPresetChip: {
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: 999,
		borderWidth: 1,
		borderColor: '#4B5563',
	},
	timerPresetChipActive: {
		backgroundColor: '#F9C513',
		borderColor: '#F9C513',
	},
	timerPresetChipText: {
		fontSize: 11,
		color: '#E5E7EB',
	},
	timerPresetChipTextActive: {
		color: '#111827',
		fontWeight: '600',
	},
	timerCustomRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		marginBottom: 8,
	},
	timerCustomLabel: {
		color: '#9CA3AF',
		fontSize: 12,
	},
	timerCustomInput: {
		flex: 1,
		backgroundColor: '#020617',
		borderRadius: 999,
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderWidth: 1,
		borderColor: '#4B5563',
		color: '#E5E7EB',
		fontSize: 13,
		textAlign: 'right',
	},
	timerButton: {
		flex: 1,
		backgroundColor: '#F9C513',
		paddingVertical: 10,
		borderRadius: 999,
		alignItems: 'center',
		justifyContent: 'center',
	},
	timerButtonActive: {
		backgroundColor: '#EAB308',
	},
	timerButtonText: {
		fontWeight: '600',
		color: '#111827',
		fontSize: 14,
	},
	timerButtonSecondary: {
		paddingVertical: 10,
		paddingHorizontal: 16,
		borderRadius: 999,
		borderWidth: 1,
		borderColor: '#4B5563',
	},
	timerButtonSecondaryText: {
		color: '#E5E7EB',
		fontSize: 14,
	},
	timerHint: {
		fontSize: 12,
		color: '#9CA3AF',
		marginTop: 4,
	},
	closeButton: {
		alignSelf: 'stretch',
		paddingVertical: 12,
		borderRadius: 999,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#374151',
	},
	closeButtonText: {
		color: '#F9FAFB',
		fontSize: 15,
		fontWeight: '600',
	},
});

export default MemberWorkouts;
