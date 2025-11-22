import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { clearUser, UserRole } from '@/store/slices/userSlice';
import { storage } from '@/utils/storage';
import { User } from '@/graphql/generated/types';

interface AuthContextType {
	isAuthenticated: boolean;
	isLoading: boolean;
	user: User | null;
	onboardingStatus: 'completed' | 'incomplete';
	logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
	const user = useAppSelector((state) => state.user.user);
	const dispatch = useAppDispatch();

	// Determine onboarding status based on user data
	const onboardingStatus = useMemo<'completed' | 'incomplete'>(() => {
		if (!user) return 'incomplete';
		
		// If user has a role (coach or member), they've completed onboarding
		// This allows existing users to access their dashboards even if
		// some optional fields (like coachDetails) are not set
		if (user.role === 'coach' || user.role === 'member') {
			return 'completed';
		}
		
		// Default: incomplete if role is not recognized
		return 'incomplete';
	}, [user]);

	const logout = async () => {
		// Clear token from AsyncStorage
		await storage.removeItem('auth_token');
		dispatch(clearUser());
	};

	return (
		<AuthContext.Provider
			value={{
				isAuthenticated: !!user,
				isLoading: false, // Redux Persist handles loading state
				user,
				onboardingStatus,
				logout,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};

AuthProvider.displayName = 'AuthProvider';

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
};

// Export UserRole for use in other components
export type { UserRole, User };

