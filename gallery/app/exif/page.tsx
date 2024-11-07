// pages/index.tsx
'use client'
import React from 'react'
import ImageMetricsViewer from '../../components/ImageWithMetrics'

const imageUrl =
	'/img/cameronmarygold/2023-02-13_17-37-29_ConHictJyXu/330257550_869215664158675_3796246925761316888_n.jpg' // Replace with your image path or URL

const HomePage: React.FC = () => {
	return (
		<div className="min-h-screen dark:bg-slate-950 bg-gray-50 flex items-center justify-center">
			<ImageMetricsViewer imageUrl={imageUrl} />
		</div>
	)
}

export default HomePage
