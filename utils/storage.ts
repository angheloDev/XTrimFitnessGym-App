import AsyncStorage from '@react-native-async-storage/async-storage';

const TOUR_KEYS: Record<string, string> = {
	member: 'guided_tour_member_done',
	coach: 'guided_tour_coach_done',
};

export const storage = {
	async getItem(key: string): Promise<string | null> {
		return await AsyncStorage.getItem(key);
	},

	async setItem(key: string, value: string): Promise<void> {
		await AsyncStorage.setItem(key, value);
	},

	async removeItem(key: string): Promise<void> {
		await AsyncStorage.removeItem(key);
	},
};

export type TourRole = 'member' | 'coach';

export async function getTourCompleted(role: TourRole): Promise<boolean> {
	const key = TOUR_KEYS[role];
	if (!key) return false;
	const value = await storage.getItem(key);
	return value === 'true';
}

export async function setTourCompleted(role: TourRole): Promise<void> {
	const key = TOUR_KEYS[role];
	if (key) await storage.setItem(key, 'true');
}
