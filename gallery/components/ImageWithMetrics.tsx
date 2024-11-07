// components/ImageMetricsViewer.tsx
import React, { useState, useEffect } from 'react'
import exifr from 'exifr'
import { ImageMetrics } from '../types/ImageMetrics'

interface ImageMetricsViewerProps {
	imageUrl?: string // Optional prop to display metrics for a given image URL
}

const ImageMetricsViewer: React.FC<ImageMetricsViewerProps> = ({ imageUrl }) => {
	const [metrics, setMetrics] = useState<ImageMetrics | null>(null)
	const [loading, setLoading] = useState<boolean>(false)
	const [error, setError] = useState<string | null>(null)
	const [selectedImage, setSelectedImage] = useState<File | null>(null)

	const extractMetrics = async (file: File) => {
		setLoading(true)
		setError(null)
		setMetrics(null)

		try {
			// Parse EXIF data
			const exifData = await exifr.parse(file, { userComment: true })

			// console.log('EXIF Data:', exifData) // Debugging: Inspect the EXIF data

			if (!exifData || !exifData.userComment) {
				// Changed to 'userComment'
				throw new Error('No UserComment found in EXIF data.')
			}

			// 'userComment' is a Uint8Array
			const userCommentBytes = exifData.userComment as Uint8Array

			// Decode the Uint8Array to a string using TextDecoder
			const decoder = new TextDecoder('utf-8')
			let userComment = decoder.decode(userCommentBytes)

			// Handle potential encoding prefixes
			if (userComment.startsWith('ASCII\0\0\0')) {
				userComment = userComment.slice(8)
			} else if (userComment.startsWith('UNICODE\0\0\0')) {
				userComment = userComment.slice(10)
			}

			// Parse JSON string
			const parsedMetrics: ImageMetrics = JSON.parse(userComment)
			console.log('Parsed Metrics:', parsedMetrics) // Debugging: Inspect the parsed metrics
			setMetrics(parsedMetrics)
		} catch (err: any) {
			console.error(err)
			setError(err.message || 'An error occurred while extracting metrics.')
		} finally {
			setLoading(false)
		}
	}

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files
		if (files && files[0]) {
			const file = files[0]
			setSelectedImage(file)
			extractMetrics(file)
		}
	}

	const handleUrlExtraction = async () => {
		if (!imageUrl) return
		setLoading(true)
		setError(null)
		setMetrics(null)

		try {
			const response = await fetch(imageUrl)
			if (!response.ok) {
				throw new Error(`Failed to fetch image. Status: ${response.status}`)
			}
			const blob = await response.blob()
			const file = new File([blob], 'image.jpg', { type: blob.type })
			await extractMetrics(file)
		} catch (err: any) {
			console.error(err)
			setError(err.message || 'Failed to fetch or parse the image.')
		} finally {
			setLoading(false)
		}
	}

	// If imageUrl is provided, extract metrics on component mount
	useEffect(() => {
		if (imageUrl) {
			handleUrlExtraction()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [imageUrl])

	return (
		<div className="p-4">
			{!imageUrl && (
				<div className="mb-4">
					<label
						htmlFor="image-upload"
						className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
					>
						Upload Image to View Metrics
					</label>
					<input
						type="file"
						id="image-upload"
						accept="image/jpeg"
						onChange={handleFileChange}
						className="block w-full text-sm text-gray-500 dark:text-gray-400
						file:mr-4 file:py-2 file:px-4
						file:rounded-full file:border-0
						file:text-sm file:font-semibold
						file:bg-blue-50 dark:file:bg-gray-700 file:text-blue-700 dark:file:text-blue-300
						hover:file:bg-blue-100 dark:hover:file:bg-gray-600"
					/>
				</div>
			)}

			{loading && (
				<div className="flex items-center justify-center">
					<svg
						className="animate-spin h-8 w-8 text-blue-600 dark:text-blue-400"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
					>
						<circle
							className="opacity-25"
							cx="12"
							cy="12"
							r="10"
							stroke="currentColor"
							strokeWidth="4"
						></circle>
						<path
							className="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8v8H4z"
						></path>
					</svg>
					<span className="ml-2 text-blue-600 dark:text-blue-400">
						Loading metrics...
					</span>
				</div>
			)}

			{error && (
				<div className="p-4 mb-4 text-sm text-red-700 dark:text-red-300 bg-red-100 dark:bg-gray-800 rounded-lg">
					<span>Error: {error}</span>
				</div>
			)}

			{metrics && (
				<div className="mt-4">
					<h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">
						Image Metrics
					</h2>
					<div className="overflow-x-auto">
						<table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
							<thead>
								<tr>
									<th className="py-2 px-4 border-b border-gray-200 dark:border-gray-700 text-left text-gray-700 dark:text-gray-300">
										Metric
									</th>
									<th className="py-2 px-4 border-b border-gray-200 dark:border-gray-700 text-left text-gray-700 dark:text-gray-300">
										Value
									</th>
								</tr>
							</thead>
							<tbody>
								{Object.entries(metrics).map(([metric, value]) => (
									<tr
										key={metric}
										className="hover:bg-gray-100 dark:hover:bg-gray-700"
									>
										<td className="py-2 px-4 border-b border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200">
											{metric}
										</td>
										<td className="py-2 px-4 border-b border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200">
											{typeof value === 'object'
												? JSON.stringify(value)
												: value}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			)}

			{/* Display the selected image */}
			{selectedImage && (
				<div className="mt-6">
					<h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">
						Selected Image
					</h2>
					<img
						src={URL.createObjectURL(selectedImage)}
						alt="Selected"
						className="max-w-full h-auto rounded shadow dark:shadow-gray-700"
					/>
				</div>
			)}

			{/* Display image from URL */}
			{imageUrl && (
				<div className="mt-6">
					<h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">
						Image from URL
					</h2>
					<img
						src={imageUrl}
						alt="From URL"
						className="max-w-full h-auto rounded shadow dark:shadow-gray-700"
					/>
				</div>
			)}
		</div>
	)
}

export default ImageMetricsViewer
