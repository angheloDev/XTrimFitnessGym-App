import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { storage } from '@/utils/storage';

export type UserRole = 'coach' | 'member' | null;
export type OnboardingStatus = 'not_started' | 'in_progress' | 'completed';

export interface User {
	id: string;
	email: string;
	firstName: string;
	lastName: string;
	role: UserRole;
	onboardingCompleted: boolean;
}

interface AuthContextType {
	user: User | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	onboardingStatus: OnboardingStatus;
	login: (userData: User) => Promise<void>;
	logout: () => Promise<void>;
	updateUser: (userData: Partial<User>) => Promise<void>;
	setOnboardingStatus: (status: OnboardingStatus) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEYS = {
	USER: '@xtrimfit_user',
	ONBOARDING_STATUS: '@xtrimfit_onboarding_status',
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [onboardingStatus, setOnboardingStatusState] = useState<OnboardingStatus>('not_started');

	// Load auth state from storage on mount
	useEffect(() => {
		loadAuthState();
	}, []);

	const loadAuthState = async () => {
		try {
			const [storedUser, storedOnboardingStatus] = await Promise.all([
				storage.getItem(STORAGE_KEYS.USER),
				storage.getItem(STORAGE_KEYS.ONBOARDING_STATUS),
			]);

			if (storedUser) {
				setUser(JSON.parse(storedUser));
			}

			if (storedOnboardingStatus) {
				setOnboardingStatusState(storedOnboardingStatus as OnboardingStatus);
			}
		} catch (error) {
			console.error('Error loading auth state:', error);
		} finally {
			setIsLoading(false);
		}
	};

	const login = async (userData: User) => {
		try {
			await storage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
			setUser(userData);
			
			// If user hasn't completed onboarding, set status
			if (!userData.onboardingCompleted) {
				await storage.setItem(STORAGE_KEYS.ONBOARDING_STATUS, 'in_progress');
				setOnboardingStatusState('in_progress');
			} else {
				await storage.setItem(STORAGE_KEYS.ONBOARDING_STATUS, 'completed');
				setOnboardingStatusState('completed');
			}
		} catch (error) {
			console.error('Error during login:', error);
			throw error;
		}
	};

	const logout = async () => {
		try {
			await Promise.all([
				storage.removeItem(STORAGE_KEYS.USER),
				storage.removeItem(STORAGE_KEYS.ONBOARDING_STATUS),
			]);
			setUser(null);
			setOnboardingStatusState('not_started');
		} catch (error) {
			console.error('Error during logout:', error);
			throw error;
		}
	};

	const updateUser = async (userData: Partial<User>) => {
		try {
			const updatedUser = { ...user, ...userData } as User;
			await storage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
			setUser(updatedUser);
		} catch (error) {
			console.error('Error updating user:', error);
			throw error;
		}
	};

	const setOnboardingStatus = async (status: OnboardingStatus) => {
		try {
			await storage.setItem(STORAGE_KEYS.ONBOARDING_STATUS, status);
			setOnboardingStatusState(status);
			
			// If onboarding is completed, update user
			if (status === 'completed' && user) {
				await updateUser({ onboardingCompleted: true });
			}
		} catch (error) {
			console.error('Error setting onboarding status:', error);
			throw error;
		}
	};

	return (
		<AuthContext.Provider
			value={{
				user,
				isAuthenticated: !!user,
				isLoading,
				onboardingStatus,
				login,
				logout,
				updateUser,
				setOnboardingStatus,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
};

