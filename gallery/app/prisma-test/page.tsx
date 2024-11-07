'use client'

import { useEffect, useState } from 'react'

type Image = {
	id: number
	file_path: string
	filename: string
	processed_at: string
	Luminance: Array<{
		mean_luminance: number
		median_luminance: number
		std_luminance: number
		dynamic_range: number
		rms_contrast: number
		michelson_contrast: number
		luminance_skewness: number
		luminance_kurtosis: number
	}>
	// Include other relations as needed
}

export default function PrismaPage() {
	const [images, setImages] = useState<Image[]>([])
	const [loading, setLoading] = useState<boolean>(true)

	useEffect(() => {
		const fetchImages = async () => {
			const res = await fetch('/api/images')
			const data = await res.json()
			setImages(data)
			setLoading(false)
		}

		fetchImages()
	}, [])

	if (loading) return <div>Loading...</div>

	return (
		<div className="p-4">
			<h1 className="text-2xl font-bold mb-4">Image Gallery</h1>
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				{images.map(image => (
					<div key={image.id} className="border rounded p-2">
						<img
							src={image.file_path.split('public')[1]}
							alt={image.filename}
							className="w-full h-auto"
						/>
						<h2 className="text-lg font-semibold mt-2">{image.filename}</h2>
						<p>Processed At: {new Date(image.processed_at).toLocaleString()}</p>
						{/* Display other metrics as needed */}
					</div>
				))}
			</div>
		</div>
	)
}
