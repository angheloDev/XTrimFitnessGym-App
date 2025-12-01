import { Ionicons } from '@expo/vector-icons';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import React, { useEffect, useRef, useState } from 'react';
import {
	ActivityIndicator,
	Alert,
	Image,
	Modal,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';

interface CameraCaptureProps {
	visible: boolean;
	onClose: () => void;
	onCapture: (uri: string) => void;
	angle: 'front' | 'rightSide' | 'leftSide' | 'back';
	angleLabel: string;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({
	visible,
	onClose,
	onCapture,
	angle,
	angleLabel,
}) => {
	const [facing, setFacing] = useState<CameraType>('back');
	const [permission, requestPermission] = useCameraPermissions();
	const [capturedImage, setCapturedImage] = useState<string | null>(null);
	const [isCapturing, setIsCapturing] = useState(false);
	const cameraRef = useRef<any>(null);

	useEffect(() => {
		if (visible) {
			setCapturedImage(null);
		}
	}, [visible]);

	// Permission request modal
	if (!permission) {
		return (
			<Modal
				visible={visible}
				animationType='fade'
				transparent={false}
				onRequestClose={onClose}
			>
				<View style={styles.modalContainer}>
					<View style={styles.modalContent}>
						<ActivityIndicator size='large' color='#F9C513' />
						<Text style={styles.modalText}>
							Requesting camera permission...
						</Text>
					</View>
				</View>
			</Modal>
		);
	}

	if (!permission.granted) {
		return (
			<Modal
				visible={visible}
				animationType='slide'
				transparent={true}
				onRequestClose={onClose}
			>
				<View style={styles.modalOverlay}>
					<View style={styles.modalContent}>
						<Ionicons name='camera-outline' size={64} color='#F9C513' />
						<Text style={styles.modalTitle}>Camera Permission Required</Text>
						<Text style={styles.modalText}>
							We need access to your camera to capture progress photos. Please
							grant camera permission to continue.
						</Text>
						<TouchableOpacity
							onPress={async () => {
								const result = await requestPermission();
								if (!result.granted) {
									Alert.alert(
										'Permission Denied',
										'Camera permission is required to capture progress photos. Please enable it in your device settings.',
										[{ text: 'OK', onPress: onClose }]
									);
								}
							}}
							style={styles.modalButton}
						>
							<Text style={styles.modalButtonText}>Grant Permission</Text>
						</TouchableOpacity>
						<TouchableOpacity
							onPress={onClose}
							style={[styles.modalButton, styles.modalCancelButton]}
						>
							<Text
								style={[styles.modalButtonText, styles.modalCancelButtonText]}
							>
								Cancel
							</Text>
						</TouchableOpacity>
					</View>
				</View>
			</Modal>
		);
	}

	if (!visible) return null;

	const handleCapture = async () => {
		if (!cameraRef.current) return;

		setIsCapturing(true);
		try {
			const photo = await cameraRef.current.takePictureAsync({
				quality: 0.8,
				base64: false,
			});

			if (photo?.uri) {
				setCapturedImage(photo.uri);
			}
		} catch (error) {
			Alert.alert('Error', 'Failed to capture photo. Please try again.');
		} finally {
			setIsCapturing(false);
		}
	};

	const handleRetake = () => {
		setCapturedImage(null);
	};

	const handleUsePhoto = () => {
		if (capturedImage) {
			onCapture(capturedImage);
			setCapturedImage(null);
		}
	};

	return (
		<Modal
			visible={visible}
			animationType='slide'
			transparent={false}
			onRequestClose={onClose}
		>
			<View style={styles.container}>
				<View style={styles.header}>
					<Text style={styles.headerText}>Capture {angleLabel}</Text>
					<TouchableOpacity onPress={onClose}>
						<Ionicons name='close' size={28} color='#fff' />
					</TouchableOpacity>
				</View>

				{capturedImage ? (
					<View style={styles.previewContainer}>
						<Image source={{ uri: capturedImage }} style={styles.preview} />
						<View style={styles.previewActions}>
							<TouchableOpacity
								onPress={handleRetake}
								style={[styles.actionButton, styles.retakeButton]}
							>
								<Ionicons name='refresh' size={24} color='#fff' />
								<Text style={styles.actionButtonText}>Retake</Text>
							</TouchableOpacity>
							<TouchableOpacity
								onPress={handleUsePhoto}
								style={[styles.actionButton, styles.useButton]}
							>
								<Ionicons name='checkmark' size={24} color='#fff' />
								<Text style={styles.actionButtonText}>Use Photo</Text>
							</TouchableOpacity>
						</View>
					</View>
				) : (
					<View style={styles.cameraContainer}>
						<CameraView ref={cameraRef} style={styles.camera} facing={facing}>
							<View style={styles.overlay}>
								<View style={styles.angleLabelContainer}>
									<Text style={styles.angleLabel}>{angleLabel}</Text>
								</View>
								<View style={styles.cameraControls}>
									<TouchableOpacity
										onPress={() =>
											setFacing(facing === 'back' ? 'front' : 'back')
										}
										style={styles.flipButton}
									>
										<Ionicons name='camera-reverse' size={32} color='#fff' />
									</TouchableOpacity>
									<TouchableOpacity
										onPress={handleCapture}
										disabled={isCapturing}
										style={styles.captureButton}
									>
										{isCapturing ? (
											<ActivityIndicator size='small' color='#fff' />
										) : (
											<View style={styles.captureButtonInner} />
										)}
									</TouchableOpacity>
									<View style={styles.placeholder} />
								</View>
							</View>
						</CameraView>
					</View>
				)}
			</View>
		</Modal>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#000',
	},
	modalContainer: {
		flex: 1,
		backgroundColor: '#1C1C1E',
		justifyContent: 'center',
		alignItems: 'center',
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.8)',
		justifyContent: 'center',
		alignItems: 'center',
		padding: 20,
	},
	modalContent: {
		backgroundColor: '#1C1C1E',
		borderRadius: 20,
		padding: 30,
		alignItems: 'center',
		width: '90%',
		maxWidth: 400,
		borderWidth: 1,
		borderColor: '#F9C513',
	},
	modalTitle: {
		fontSize: 24,
		fontWeight: 'bold',
		color: '#fff',
		marginTop: 20,
		marginBottom: 10,
		textAlign: 'center',
	},
	modalText: {
		fontSize: 16,
		color: '#8E8E93',
		textAlign: 'center',
		marginBottom: 30,
		lineHeight: 24,
	},
	modalButton: {
		backgroundColor: '#F9C513',
		paddingVertical: 14,
		paddingHorizontal: 32,
		borderRadius: 10,
		marginTop: 10,
		width: '100%',
		alignItems: 'center',
	},
	modalButtonText: {
		color: '#000',
		fontSize: 16,
		fontWeight: '600',
	},
	modalCancelButton: {
		backgroundColor: 'transparent',
		borderWidth: 1,
		borderColor: '#8E8E93',
	},
	modalCancelButtonText: {
		color: '#8E8E93',
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		padding: 20,
		paddingTop: 50,
		backgroundColor: '#000',
	},
	headerText: {
		fontSize: 20,
		fontWeight: 'bold',
		color: '#fff',
	},
	cameraContainer: {
		flex: 1,
	},
	camera: {
		flex: 1,
	},
	overlay: {
		flex: 1,
		backgroundColor: 'transparent',
		justifyContent: 'space-between',
	},
	angleLabelContainer: {
		alignItems: 'center',
		paddingTop: 20,
	},
	angleLabel: {
		fontSize: 18,
		fontWeight: '600',
		color: '#fff',
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		paddingVertical: 8,
		paddingHorizontal: 16,
		borderRadius: 8,
	},
	cameraControls: {
		flexDirection: 'row',
		justifyContent: 'space-around',
		alignItems: 'center',
		paddingBottom: 40,
	},
	flipButton: {
		width: 60,
		height: 60,
		borderRadius: 30,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		justifyContent: 'center',
		alignItems: 'center',
	},
	captureButton: {
		width: 80,
		height: 80,
		borderRadius: 40,
		backgroundColor: '#fff',
		justifyContent: 'center',
		alignItems: 'center',
		borderWidth: 4,
		borderColor: '#F9C513',
	},
	captureButtonInner: {
		width: 60,
		height: 60,
		borderRadius: 30,
		backgroundColor: '#F9C513',
	},
	placeholder: {
		width: 60,
	},
	previewContainer: {
		flex: 1,
		backgroundColor: '#000',
	},
	preview: {
		flex: 1,
		width: '100%',
		resizeMode: 'contain',
	},
	previewActions: {
		flexDirection: 'row',
		justifyContent: 'space-around',
		padding: 20,
		backgroundColor: '#000',
	},
	actionButton: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 12,
		paddingHorizontal: 24,
		borderRadius: 8,
		gap: 8,
	},
	retakeButton: {
		backgroundColor: '#8E8E93',
	},
	useButton: {
		backgroundColor: '#F9C513',
	},
	actionButtonText: {
		color: '#fff',
		fontSize: 16,
		fontWeight: '600',
	},
});

export default CameraCapture;
