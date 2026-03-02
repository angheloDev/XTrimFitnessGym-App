import { useTour } from '@/contexts/TourContext';
import React, { useEffect, useMemo, useState } from 'react';
import {
	Dimensions,
	Modal,
	Pressable,
	StyleSheet,
	Text,
	View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TOOLTIP_GAP = 24;
const TOOLTIP_EDGE_MARGIN = 16;
const TOOLTIP_CONTENT_HEIGHT = 165;
const SPOTLIGHT_PADDING = 4;
/** Same as styles.container.marginTop; used so tooltip stays inside visible container. */
const CONTAINER_TOP_MARGIN = 50;
const TOOLTIP_BOTTOM_MARGIN = 24;

export function TourOverlay() {
	const tour = useTour();
	const insets = useSafeAreaInsets();
	const [dimensions, setDimensions] = useState(() => Dimensions.get('window'));

	useEffect(() => {
		const sub = Dimensions.addEventListener('change', ({ window }) => {
			setDimensions(window);
		});
		return () => sub.remove();
	}, []);

	const screenWidth = dimensions.width;
	const screenHeight = dimensions.height;
	const tooltipWidth = screenWidth - TOOLTIP_EDGE_MARGIN * 2;

	const { currentStep, currentLayout, isActive } = tour ?? {};
	const visible = Boolean(isActive && currentStep);

	const cutoutStyle = useMemo(() => {
		if (
			!currentLayout ||
			currentLayout.width <= 0 ||
			currentLayout.height <= 0
		) {
			return null;
		}
		const { x, y, width, height } = currentLayout;
		// Visible overlay area in window coords: from CONTAINER_TOP_MARGIN to screenHeight
		const visibleTop = CONTAINER_TOP_MARGIN;
		const visibleBottom = screenHeight;
		const targetBottom = y + height;
		if (targetBottom < visibleTop || y > visibleBottom) {
			return null;
		}
		const left = Math.max(0, x - SPOTLIGHT_PADDING);
		const top = Math.max(0, y - SPOTLIGHT_PADDING);
		const w = width + SPOTLIGHT_PADDING * 2;
		const h = height + SPOTLIGHT_PADDING * 2;
		return {
			topStrip: { top: 0, height: top },
			bottomStrip: {
				top: top + h,
				height: Math.max(0, screenHeight - (top + h)),
			},
			leftStrip: { top, left: 0, width: left, height: h },
			rightStrip: {
				top,
				left: left + w,
				width: Math.max(0, screenWidth - (left + w)),
				height: h,
			},
		};
	}, [currentLayout, screenWidth, screenHeight]);

	const tooltipStyle = useMemo(() => {
		const maxTop = insets.top + 24;
		// Container has marginTop: CONTAINER_TOP_MARGIN; tooltip top is in container coords, so max top = container height - tooltip height - margin
		const containerHeight = screenHeight - CONTAINER_TOP_MARGIN;
		const maxBottom =
			containerHeight - TOOLTIP_CONTENT_HEIGHT - TOOLTIP_BOTTOM_MARGIN;

		const visibleTop = CONTAINER_TOP_MARGIN;
		const visibleBottom = screenHeight;
		const isLayoutOnScreen =
			currentLayout &&
			currentLayout.width > 0 &&
			currentLayout.height > 0 &&
			currentLayout.y + currentLayout.height >= visibleTop &&
			currentLayout.y <= visibleBottom;

		if (isLayoutOnScreen && currentLayout) {
			const preferredYBelow =
				currentLayout.y + currentLayout.height + TOOLTIP_GAP;
			const preferredYAbove =
				currentLayout.y - TOOLTIP_CONTENT_HEIGHT - TOOLTIP_GAP;
			const canFitAbove = preferredYAbove >= maxTop;
			const spaceBelow = containerHeight - preferredYBelow - TOOLTIP_BOTTOM_MARGIN;
			const spaceAbove = currentLayout.y - maxTop;
			const showAbove =
				canFitAbove &&
				(spaceBelow < TOOLTIP_CONTENT_HEIGHT || spaceAbove >= spaceBelow);

			const y = showAbove
				? Math.max(maxTop, preferredYAbove)
				: Math.min(preferredYBelow, maxBottom);

			const centerX = currentLayout.x + currentLayout.width / 2;
			const x = Math.max(
				TOOLTIP_EDGE_MARGIN,
				Math.min(
					centerX - tooltipWidth / 2,
					screenWidth - tooltipWidth - TOOLTIP_EDGE_MARGIN,
				),
			);

			return {
				position: 'absolute' as const,
				left: x,
				top: y,
				width: tooltipWidth,
			};
		}

		return {
			position: 'absolute' as const,
			left: TOOLTIP_EDGE_MARGIN,
			right: TOOLTIP_EDGE_MARGIN,
			top: Math.max(maxTop, Math.min(maxBottom, (containerHeight - TOOLTIP_CONTENT_HEIGHT) / 2)),
			width: tooltipWidth,
		};
	}, [
		currentLayout,
		screenWidth,
		screenHeight,
		tooltipWidth,
		insets.top,
	]);

	if (!tour || !visible) return null;

	return (
		<Modal
			visible={visible}
			transparent
			animationType='fade'
			statusBarTranslucent
			onRequestClose={tour.skipTour}
		>
			<View style={styles.container} pointerEvents='box-none'>
				{cutoutStyle ? (
					<>
						<View
							style={[styles.strip, styles.darkStrip, cutoutStyle.topStrip]}
							pointerEvents='auto'
						/>
						<View
							style={[styles.strip, styles.darkStrip, cutoutStyle.bottomStrip]}
							pointerEvents='auto'
						/>
						<View
							style={[styles.strip, styles.darkStrip, cutoutStyle.leftStrip]}
							pointerEvents='auto'
						/>
						<View
							style={[styles.strip, styles.darkStrip, cutoutStyle.rightStrip]}
							pointerEvents='auto'
						/>
						<View
							style={[
								styles.spotlightBorder,
								{
									left: cutoutStyle.leftStrip.width,
									top: cutoutStyle.topStrip.height,
									width:
										screenWidth -
										cutoutStyle.leftStrip.width -
										cutoutStyle.rightStrip.width,
									height:
										cutoutStyle.bottomStrip.top - cutoutStyle.topStrip.height,
								},
							]}
							pointerEvents='none'
						/>
					</>
				) : (
					<View style={styles.backdrop} pointerEvents='auto' />
				)}

				<View style={[styles.tooltip, tooltipStyle]} pointerEvents='auto'>
					<View style={styles.tooltipHeader}>
						<Text style={styles.title} numberOfLines={1}>
							{currentStep!.title}
						</Text>
						<Pressable
							onPress={tour.skipTour}
							hitSlop={12}
							style={({ pressed }) => [
								styles.skipBtn,
								pressed && styles.skipBtnPressed,
							]}
						>
							<Text style={styles.skipText}>Skip</Text>
						</Pressable>
					</View>
					<Text style={styles.body} numberOfLines={4}>
						{currentStep!.body}
					</Text>
					<View style={styles.actions}>
						{!tour.isFirstStep ? (
							<Pressable
								onPress={tour.prevStep}
								style={({ pressed }) => [
									styles.secondaryBtn,
									pressed && styles.btnPressed,
								]}
							>
								<Text style={styles.secondaryBtnText}>Back</Text>
							</Pressable>
						) : (
							<View style={styles.secondaryBtn} />
						)}
						<Pressable
							onPress={tour.nextStep}
							style={({ pressed }) => [
								styles.primaryBtn,
								pressed && styles.btnPressed,
							]}
						>
							<Text style={styles.primaryBtnText}>
								{tour.isLastStep
									? 'Done'
									: tour.isFirstStep
										? 'Continue'
										: 'Next'}
							</Text>
						</Pressable>
					</View>
				</View>
			</View>
		</Modal>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		marginTop: 50
	},
	backdrop: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: 'rgba(0,0,0,0.7)',
	},
	strip: {
		position: 'absolute',
		left: 0,
		right: 0,
		width: undefined,
		height: undefined,
	},
	darkStrip: {
		backgroundColor: 'rgba(0,0,0,0.7)',
	},
	spotlightBorder: {
		position: 'absolute',
		borderRadius: 12,
		borderWidth: 2,
		borderColor: '#F9C513',
		backgroundColor: 'transparent',
	},
	tooltip: {
		backgroundColor: '#1C1C1E',
		borderRadius: 16,
		borderWidth: 1,
		borderColor: 'rgba(249, 197, 19, 0.3)',
		paddingHorizontal: 16,
		paddingTop: 20,
		paddingBottom: 12,
		zIndex: 10,
		elevation: 10,
	},
	tooltipHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 6,
	},
	title: {
		fontSize: 18,
		fontWeight: '700',
		color: '#FFFFFF',
		flex: 1,
		marginRight: 8,
	},
	skipBtn: {
		paddingVertical: 4,
		paddingHorizontal: 8,
	},
	skipBtnPressed: {
		opacity: 0.7,
	},
	skipText: {
		fontSize: 14,
		color: '#8E8E93',
		fontWeight: '600',
	},
	body: {
		fontSize: 15,
		color: '#E5E5EA',
		lineHeight: 22,
		marginBottom: 12,
	},
	actions: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: 12,
		minHeight: 40,
	},
	secondaryBtn: {
		paddingVertical: 10,
		paddingHorizontal: 16,
		minWidth: 70,
	},
	secondaryBtnText: {
		fontSize: 16,
		color: '#8E8E93',
		fontWeight: '600',
	},
	primaryBtn: {
		backgroundColor: '#F9C513',
		paddingVertical: 10,
		paddingHorizontal: 24,
		borderRadius: 10,
		minWidth: 90,
		alignItems: 'center',
	},
	btnPressed: {
		opacity: 0.85,
	},
	primaryBtnText: {
		fontSize: 16,
		color: '#8E8E93',
		fontWeight: '700',
	},
});
