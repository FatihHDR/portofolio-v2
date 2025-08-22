import { VFC } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { BloomPass } from './postprocessing/BloomPass';
import { Effects } from './postprocessing/Effects';
import { FocusPass } from './postprocessing/FocusPass';
import { FXAAPass } from './postprocessing/FXAAPass';
import { TintPass } from './postprocessing/TintPass';
import { ScreenPlane } from './ScreenPlane';

type Props = { isMobile?: boolean }

export const TCanvas: VFC<Props> = ({ isMobile = false }) => {
	const OrthographicCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, -10, 10)

	// Always mount Canvas so mobile still renders similar visual composition.
	// On mobile we use lighter GL settings and skip postprocessing to keep visuals close
	// while conserving resources.
	const canvasProps = isMobile
		? { dpr: 1, gl: { antialias: false, powerPreference: 'low-power' as const } }
		: { dpr: (typeof window !== 'undefined' ? window.devicePixelRatio : 1) }

	return (
		// @ts-ignore react-three-fiber accepts camera instance directly
		<Canvas camera={OrthographicCamera} {...(canvasProps as any)}>
			{/* objects */}
			<ScreenPlane />
			{/* on mobile skip heavy postprocessing passes to approximate look */}
			{!isMobile && (
				<Effects sRGBCorrection={false}>
					<FXAAPass />
					<BloomPass />
					<FocusPass />
					<TintPass />
				</Effects>
			)}
		</Canvas>
	)
}
