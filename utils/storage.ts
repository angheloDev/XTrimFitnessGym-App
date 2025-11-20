// Storage utility - can be swapped with AsyncStorage or expo-secure-store
// For now using a simple in-memory store, but you should install:
// npm install @react-native-async-storage/async-storage
// or
// npx expo install expo-secure-store

// Simple in-memory storage (will be lost on app restart)
// Replace with AsyncStorage or SecureStore in production
const memoryStore: Record<string, string> = {};

export const storage = {
	async getItem(key: string): Promise<string | null> {
		// TODO: Replace with actual storage implementation
		// Example with AsyncStorage:
		// return await AsyncStorage.getItem(key);
		
		// Example with SecureStore:
		// return await SecureStore.getItemAsync(key);
		
		return memoryStore[key] || null;
	},

	async setItem(key: string, value: string): Promise<void> {
		// TODO: Replace with actual storage implementation
		// Example with AsyncStorage:
		// await AsyncStorage.setItem(key, value);
		
		// Example with SecureStore:
		// await SecureStore.setItemAsync(key, value);
		
		memoryStore[key] = value;
	},

	async removeItem(key: string): Promise<void> {
		// TODO: Replace with actual storage implementation
		// Example with AsyncStorage:
		// await AsyncStorage.removeItem(key);
		
		// Example with SecureStore:
		// await SecureStore.deleteItemAsync(key);
		
		delete memoryStore[key];
	},
};

