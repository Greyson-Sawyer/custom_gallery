// components/Gallery/ImageModal.tsx

'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Modal from 'react-modal'
import { ImageItem } from '@/types/gallery'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import LuminanceHistogram from '@/components/Visualizations/LuminanceHistogram'

type ImageModalProps = {
	isOpen: boolean
	onRequestClose: () => void
	image: ImageItem
	onNext: () => void
	onPrevious: () => void
	onImageSelect: (image: ImageItem) => void
}

const ImageModal: React.FC<ImageModalProps> = ({
	isOpen,
	onRequestClose,
	image,
	onNext,
	onPrevious,
	onImageSelect,
}) => {
	const [otherImages, setOtherImages] = useState<ImageItem[]>([])

	useEffect(() => {
		if (image) {
			const fetchOtherImages = async () => {
				try {
					const res = await fetch(`/api/images?postId=${image.post_id}`)
					const data = await res.json()
					const filteredImages = data.images.filter(
						(img: ImageItem) => img.id !== image.id
					)
					setOtherImages(filteredImages)
				} catch (error) {
					console.error('Failed to fetch other images:', error)
				}
			}

			fetchOtherImages()
		}
	}, [image])

	if (!image) return null

	const handleImageClick = (selectedImage: ImageItem) => {
		onImageSelect(selectedImage)
	}

	// Access clusters
	const clusters = image.KMeansClustering?.[0]?.Clusters || []

	return (
		<Modal
			isOpen={isOpen}
			onRequestClose={onRequestClose}
			shouldCloseOnOverlayClick={true}
			shouldCloseOnEsc={true}
			contentLabel="Image Details"
			className="fixed inset-0 bg-black bg-opacity-75 overflow-hidden"
			overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-50"
		>
			<div className="h-full w-full flex flex-col relative">
				{/* Close Button */}
				<button
					onClick={onRequestClose}
					className="absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-2xl z-10"
				>
					&times;
				</button>

				{/* Navigation Arrows */}
				<button
					onClick={onPrevious}
					className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-gray-200 dark:bg-gray-700 rounded-full p-2 hover:bg-gray-300 dark:hover:bg-gray-600 z-10"
					aria-label="Previous Image"
				>
					&#8592;
				</button>
				<button
					onClick={onNext}
					className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-gray-200 dark:bg-gray-700 rounded-full p-2 hover:bg-gray-300 dark:hover:bg-gray-600 z-10"
					aria-label="Next Image"
				>
					&#8594;
				</button>

				{/* Panel Group */}
				<PanelGroup direction="horizontal" className="flex-grow">
					{/* Center Panel - Image and Post Info */}
					<Panel>
						<div className="h-full flex flex-col bg-gray-100 dark:bg-zinc-950/80">
							{/* Image Container */}
							<div className="flex-grow relative">
								<Image
									src={image.relative_file_path}
									alt={`${image.artist} - ${image.post_id} - ${image.filename}`}
									fill
									className="object-contain"
								/>
							</div>

							{/* Post Information and Other Images */}
							<div className="flex-shrink-0 overflow-auto p-4 bg-white border-t-2 border-t-zinc-800 dark:bg-zinc-950">
								<h2 className="text-xl font-semibold">{image.post.username}</h2>
								<p className="text-gray-600 dark:text-zinc-400 mt-1">
									{image.post.caption}
								</p>
								<p className="text-gray-500 dark:text-zinc-500 text-sm mt-1">
									Posted on: {new Date(image.post.post_date).toLocaleDateString()}
								</p>

								{/* Other Images in this Post */}
								{otherImages.length > 0 && (
									<div className="mt-4">
										<h2 className="text-xl font-semibold mb-2">
											Other Images in this Post
										</h2>
										<div className="flex space-x-2 overflow-x-auto">
											{otherImages.map(otherImage => (
												<div
													key={otherImage.id}
													className="flex-shrink-0 w-24 h-24 relative cursor-pointer"
													onClick={() => handleImageClick(otherImage)}
												>
													<Image
														src={otherImage.relative_file_path}
														alt={`${otherImage.artist} - ${otherImage.post_id} - ${otherImage.filename}`}
														fill
														className="rounded object-cover"
													/>
												</div>
											))}
										</div>
									</div>
								)}
							</div>
						</div>
					</Panel>
					<PanelResizeHandle className="w-0.5 bg-gray-300 dark:bg-zinc-800 cursor-col-resize" />

					{/* Right Panel - Visualizations and Statistics */}
					<Panel defaultSize={30} minSize={10}>
						<div className="h-full flex flex-col bg-gray-100 dark:bg-zinc-950">
							<div className="flex flex-col p-2 flex-grow">
								<h2 className="text-lg font-semibold mb-2">Visualizations</h2>
								{/* Luminance Histogram */}
								{image.Luminance && (
									<div className="mb-4 flex-grow max-h-80">
										<LuminanceHistogram
											imageSrc={image.relative_file_path}
											mean={image.Luminance.mean_luminance}
											median={image.Luminance.median_luminance}
											stdDev={image.Luminance.std_luminance}
											min={image.Luminance.min_luminance}
											max={image.Luminance.max_luminance}
										/>
									</div>
								)}

								{/* Color Swatches */}
								{clusters.length > 0 && (
									<div className="mt-4">
										<h3 className="text-base font-medium mb-2">
											Dominant Colors
										</h3>
										<div className="grid grid-cols-8 gap-4">
											{clusters.map((cluster, index) => (
												<div
													key={index}
													className="flex flex-col items-center w-full "
												>
													<div
														className="w-full h-12 rounded"
														style={{
															backgroundColor: `rgb(${cluster.r}, ${cluster.g}, ${cluster.b})`,
														}}
													></div>
													<span className="mt-1 text-sm text-center">
														{cluster.percentage.toFixed(1)}%
													</span>
												</div>
											))}
										</div>
									</div>
								)}
							</div>

							{/* Statistics Panel */}
							<div className="p-2 overflow-auto text-sm border-t-2 border-t-zinc-800">
								<h2 className="text-lg font-semibold mb-2">Statistics</h2>
								{/* Statistics content with smaller font */}
								{image.Luminance && (
									<div className="mb-4">
										<h3 className="text-base font-medium mb-1">Luminance</h3>
										<div className="grid grid-cols-2 gap-1">
											<div>Mean:</div>
											<div>{image.Luminance.mean_luminance.toFixed(2)}</div>
											<div>Median:</div>
											<div>{image.Luminance.median_luminance.toFixed(2)}</div>
											<div>Std Dev:</div>
											<div>{image.Luminance.std_luminance.toFixed(2)}</div>
											<div>Dynamic Range:</div>
											<div>{image.Luminance.dynamic_range.toFixed(2)}</div>
											<div>RMS Contrast:</div>
											<div>{image.Luminance.rms_contrast.toFixed(2)}</div>
											<div>Michelson Contrast:</div>
											<div>
												{image.Luminance.michelson_contrast.toFixed(2)}
											</div>
											<div>Skewness:</div>
											<div>
												{image.Luminance.luminance_skewness.toFixed(2)}
											</div>
											<div>Kurtosis:</div>
											<div>
												{image.Luminance.luminance_kurtosis.toFixed(2)}
											</div>
											<div>Min:</div>
											<div>{image.Luminance.min_luminance.toFixed(2)}</div>
											<div>Max:</div>
											<div>{image.Luminance.max_luminance.toFixed(2)}</div>
										</div>
									</div>
								)}
								{/* Repeat similar structure for other metrics (Saturation, GLCM, etc.) */}
								{image.Saturation && (
									<div className="mb-4">
										<h3 className="text-base font-medium mb-1">Saturation</h3>
										<div className="grid grid-cols-2 gap-1">
											<div>Mean:</div>
											<div>{image.Saturation.mean_saturation.toFixed(2)}</div>
											<div>Median:</div>
											<div>
												{image.Saturation.median_saturation.toFixed(2)}
											</div>
											<div>Std Dev:</div>
											<div>{image.Saturation.std_saturation.toFixed(2)}</div>
										</div>
									</div>
								)}
								{image.GLCM && (
									<div className="mb-4">
										<h3 className="text-base font-medium mb-1">GLCM</h3>
										<div className="grid grid-cols-2 gap-1">
											<div>Contrast:</div>
											<div>{image.GLCM.contrast.toFixed(2)}</div>
											<div>Correlation:</div>
											<div>{image.GLCM.correlation.toFixed(2)}</div>
										</div>
									</div>
								)}
								{image.Laplacian && (
									<div className="mb-4">
										<h3 className="text-base font-medium mb-1">Laplacian</h3>
										<div className="grid grid-cols-2 gap-1">
											<div>Variance:</div>
											<div>{image.Laplacian.variance.toFixed(2)}</div>
										</div>
									</div>
								)}
							</div>
						</div>
					</Panel>
				</PanelGroup>
			</div>
		</Modal>
	)
}

export default ImageModal
