import { useAuth } from '@/contexts/AuthContext';
import { getTourCompleted, setTourCompleted, TourRole } from '@/utils/storage';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Dimensions } from 'react-native';

export interface LayoutRect {
	x: number;
	y: number;
	width: number;
	height: number;
}

export interface TourStepConfig {
	id: string;
	title: string;
	body: string;
	/** Step ID to measure and highlight; null = no target, tooltip only. */
	targetKey?: string | null;
	/** Tab/screen to show when this step is active. */
	tab?: string;
}

const TOUR_START_DELAY_MS = 400;

export interface TourContextValue {
	/** Map of step ID → measured layout (from measureInWindow). */
	layouts: Record<string, LayoutRect>;
	/** Register measured layout for a step ID. */
	registerStep: (id: string, layout: LayoutRect) => void;
	/** Unregister when component unmounts. */
	unregisterStep: (id: string) => void;
	steps: TourStepConfig[];
	currentStepIndex: number;
	currentStep: TourStepConfig | null;
	/** Measured layout for current step's targetKey (from registry). */
	currentLayout: LayoutRect | null;
	isActive: boolean;
	startTour: () => void;
	nextStep: () => void;
	prevStep: () => void;
	skipTour: () => void;
	isFirstStep: boolean;
	isLastStep: boolean;
}

const TourContext = createContext<TourContextValue | null>(null);

export function TourProvider({
	children,
	steps,
	role,
}: {
	children: React.ReactNode;
	steps: TourStepConfig[];
	role: TourRole;
}) {
	const { user } = useAuth();
	const [layouts, setLayouts] = useState<Record<string, LayoutRect>>({});
	const [currentIndex, setCurrentIndex] = useState(0);
	const [isActive, setIsActive] = useState(false);

	const registerStep = useCallback((id: string, layout: LayoutRect) => {
		setLayouts((prev) => {
			const next = { ...prev, [id]: layout };
			return next;
		});
	}, []);

	const unregisterStep = useCallback((id: string) => {
		setLayouts((prev) => {
			const next = { ...prev };
			delete next[id];
			return next;
		});
	}, []);

	const finishTour = useCallback(async () => {
		setIsActive(false);
		setCurrentIndex(0);
		await setTourCompleted(role);
	}, [role]);

	const skipTour = useCallback(async () => {
		setIsActive(false);
		setCurrentIndex(0);
		await setTourCompleted(role);
	}, [role]);

	const nextStep = useCallback(() => {
		if (currentIndex >= steps.length - 1) {
			finishTour();
			return;
		}
		setCurrentIndex((i) => i + 1);
	}, [currentIndex, steps.length, finishTour]);

	const prevStep = useCallback(() => {
		if (currentIndex <= 0) return;
		setCurrentIndex((i) => i - 1);
	}, [currentIndex]);

	const startTour = useCallback(() => {
		setCurrentIndex(0);
		setIsActive(true);
	}, []);

	useEffect(() => {
		let cancelled = false;
		async function checkAndStart() {
			if (!user?.id || user.role !== role) return;
			try {
				const done = await getTourCompleted(role);
				if (cancelled) return;
				if (!done) {
					setTimeout(() => {
						if (!cancelled) startTour();
					}, TOUR_START_DELAY_MS);
				}
			} catch {
				// ignore
			}
		}
		checkAndStart();
		return () => {
			cancelled = true;
		};
	}, [user?.id, user?.role, role, startTour]);

	useEffect(() => {
		const sub = Dimensions.addEventListener('change', () => {
			setLayouts((prev) => ({}));
		});
		return () => sub.remove();
	}, []);

	const currentStep = steps[currentIndex] ?? null;
	const currentLayout =
		currentStep?.targetKey != null && currentStep.targetKey !== ''
			? layouts[currentStep.targetKey] ?? null
			: null;

	const value: TourContextValue = {
		layouts,
		registerStep,
		unregisterStep,
		steps,
		currentStepIndex: currentIndex,
		currentStep,
		currentLayout,
		isActive,
		startTour,
		nextStep,
		prevStep,
		skipTour,
		isFirstStep: currentIndex === 0,
		isLastStep: currentIndex === steps.length - 1,
	};

	return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
}

export function useTour(): TourContextValue | null {
	return useContext(TourContext);
}
