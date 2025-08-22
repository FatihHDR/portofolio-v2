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

	// Always mount Canvas and keep postprocessing so mobile looks like desktop.
	// Reduce rendering cost by capping DPR and setting a lower power preference on mobile.
	const canvasProps = {
		dpr: (typeof window !== 'undefined' ? (isMobile ? 1 : window.devicePixelRatio || 1) : 1),
		gl: { antialias: true, powerPreference: isMobile ? ('low-power' as const) : ('high-performance' as const) },
	}

	return (
		// @ts-ignore react-three-fiber accepts camera instance directly
		<Canvas camera={OrthographicCamera} {...(canvasProps as any)}>
			{/* objects */}
			<ScreenPlane />
			{/* keep postprocessing on mobile for parity; FXAA will help at low DPR */}
			<Effects sRGBCorrection={false}>
				<FXAAPass />
				<BloomPass />
				<FocusPass />
				<TintPass />
			</Effects>
		</Canvas>
	)
}
