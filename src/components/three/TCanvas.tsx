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

	// Lightweight mobile fallback: avoid mounting heavy three/canvas on mobile
	if (isMobile) {
		return (
			<div
				aria-hidden
				style={{
					width: '100%',
					height: '100%',
					background: 'linear-gradient(180deg, rgba(4,18,40,0.6), rgba(2,8,20,0.8))',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				{/* lightweight visual for mobile; keeps aesthetic but saves resources */}
				<img src="/assets/icons/github.svg" alt="visual placeholder" style={{ opacity: 0.06, width: '32vw', maxWidth: 160 }} />
			</div>
		)
	}

	return (
		<Canvas camera={OrthographicCamera} dpr={window.devicePixelRatio}>
			{/* objects */}
			<ScreenPlane />
			{/* effects */}
			<Effects sRGBCorrection={false}>
				<FXAAPass />
				<BloomPass />
				<FocusPass />
				<TintPass />
			</Effects>
			{ }
		</Canvas>
	)
}
