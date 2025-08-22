import React, { VFC } from 'react';
import { TCanvas } from './three/TCanvas';
import { Hero } from './Hero';
import { LinkIconButton } from './LinkIconButton';
import BackgroundAudio from './BackgroundAudio';
import LoadingScreen from './LoadingScreen';
import useIsMobile from '../hooks/useIsMobile';

export const App: VFC = () => {
	return (
		<div className="viewport-cinemascope">
			{/* Letterbox bars */}
			<div className="letterbox__bar letterbox__bar--top" />
			<div className="letterbox__bar letterbox__bar--bottom" />

			{/* 2.39:1 content area */}
			<div className="viewport-cinemascope__content" style={{ position: 'relative' }}>
				<BackgroundAudio />
				<LoadingScreen />
				<TCanvas isMobile={useIsMobile()} />
				<Hero />
				<LinkIconButton
					imagePath="/assets/icons/github.svg"
					linkPath="https://github.com/your-username"
					position="top-right"
					size={[36, 36]}
				/>
			</div>
		</div>
	)
}
