import type { LayoutRect } from '@/contexts/TourContext';
import { useTour } from '@/contexts/TourContext';
import React, { useCallback, useEffect, useRef } from 'react';
import {
	Dimensions,
	InteractionManager,
	LayoutChangeEvent,
	View,
	ViewProps,
} from 'react-native';

interface TourStepProps extends ViewProps {
	/** Step ID matching the tour step's targetKey. */
	stepId: string;
	children: React.ReactNode;
}

/**
 * Wraps a tourable component: measures it with measureInWindow and registers
 * the layout in the tour context. Re-measures on layout change and when this
 * step is active (e.g. after tab change or scroll).
 */
export function TourStep({ stepId, children, onLayout, ...viewProps }: TourStepProps) {
	const ref = useRef<View>(null);
	const tour = useTour();
	const registerStepRef = useRef<(id: string, layout: LayoutRect) => void>(() => {});
	registerStepRef.current = tour?.registerStep ?? (() => {});

	const measureAndRegister = useCallback(() => {
		const node = ref.current;
		if (!node) return;
		node.measureInWindow((x, y, width, height) => {
			if (width <= 0 || height <= 0) return;
			registerStepRef.current(stepId, { x, y, width, height });
		});
	}, [stepId]);

	const handleLayout = useCallback(
		(event: LayoutChangeEvent) => {
			onLayout?.(event);
			measureAndRegister();
		},
		[onLayout, measureAndRegister]
	);

	useEffect(() => {
		if (!tour) return;
		measureAndRegister();
	}, [measureAndRegister, stepId]);

	useEffect(() => {
		if (!tour || tour.currentStep?.targetKey !== stepId) return;
		let cancelled = false;
		let timeoutId: ReturnType<typeof setTimeout> | undefined;
		const task = InteractionManager.runAfterInteractions(() => {
			if (cancelled) return;
			timeoutId = setTimeout(measureAndRegister, 150);
		});
		return () => {
			cancelled = true;
			task.cancel();
			if (timeoutId != null) clearTimeout(timeoutId);
		};
	}, [tour?.currentStep?.targetKey, stepId, measureAndRegister]);

	useEffect(() => {
		const sub = Dimensions.addEventListener('change', measureAndRegister);
		return () => sub.remove();
	}, [measureAndRegister]);

	return (
		<View ref={ref} onLayout={handleLayout} collapsable={false} {...viewProps}>
			{children}
		</View>
	);
}
