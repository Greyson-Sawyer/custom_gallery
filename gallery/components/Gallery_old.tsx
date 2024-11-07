// components/Gallery.tsx

'use client'
import React, { useState, useMemo, useCallback } from 'react'
import Image from 'next/image'
import Modal from 'react-modal'
import { Bar } from 'react-chartjs-2'
import 'chart.js/auto'
import { FixedSizeGrid as Grid } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'

type Cluster = {
	clustering_id: number
	cluster_index: number
	r: number
	g: number
	b: number
	count: number
	percentage: number
}

type KMeansClustering = {
	id: number
	num_clusters: number
	Clusters: Cluster[]
}

type Metrics = {
	luminance: {
		mean_luminance: number
		median_luminance: number
		std_luminance: number
		dynamic_range: number
		rms_contrast: number
		michelson_contrast: number
		luminance_skewness: number
		luminance_kurtosis: number
	} | null
	saturation: {
		mean_saturation: number
		median_saturation: number
		std_saturation: number
	} | null
	glcm: {
		contrast: number
		correlation: number
	} | null
	laplacian: {
		variance: number
	} | null
	kmeans: KMeansClustering[] | null
}

type ImageItem = {
	id: number
	artist: string
	postId: string
	imageName: string
	filePath: string
	processedAt: string
	metrics: Metrics
}

type GridData = ImageItem[] & { columns: number }

type GalleryProps = {
	images: ImageItem[]
}

const Gallery: React.FC<GalleryProps> = ({ images }) => {
	// State for sorting and filtering
	const [sortKey, setSortKey] = useState<string>('processedAt')
	const [filterArtist, setFilterArtist] = useState<string>('')
	const [filterDate, setFilterDate] = useState<string>('')

	// State for modal
	const [modalIsOpen, setModalIsOpen] = useState<boolean>(false)
	const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null)

	// Unique list of artists for filtering
	const artists = useMemo(() => {
		const uniqueArtists = Array.from(new Set(images.map(img => img.artist)))
		return uniqueArtists
	}, [images])

	// Helper function to get a specific metric
	const getMetric = (image: ImageItem, key: string): number => {
		switch (key) {
			// Luminance metrics
			case 'mean_luminance':
				return image.metrics.luminance?.mean_luminance || 0
			case 'median_luminance':
				return image.metrics.luminance?.median_luminance || 0
			case 'std_luminance':
				return image.metrics.luminance?.std_luminance || 0
			case 'dynamic_range':
				return image.metrics.luminance?.dynamic_range || 0
			case 'rms_contrast':
				return image.metrics.luminance?.rms_contrast || 0
			case 'michelson_contrast':
				return image.metrics.luminance?.michelson_contrast || 0
			case 'luminance_skewness':
				return image.metrics.luminance?.luminance_skewness || 0
			case 'luminance_kurtosis':
				return image.metrics.luminance?.luminance_kurtosis || 0

			// Saturation metrics
			case 'mean_saturation':
				return image.metrics.saturation?.mean_saturation || 0
			case 'median_saturation':
				return image.metrics.saturation?.median_saturation || 0
			case 'std_saturation':
				return image.metrics.saturation?.std_saturation || 0

			// GLCM (Gray-Level Co-Occurrence Matrix) metrics
			case 'glcm_contrast':
				return image.metrics.glcm?.contrast || 0
			case 'glcm_correlation':
				return image.metrics.glcm?.correlation || 0

			// Laplacian (used for image sharpness) metrics
			case 'laplacian_variance':
				return image.metrics.laplacian?.variance || 0

			// You could extend this to KMeansClustering metrics if needed (e.g., using clustering_id or any cluster-based calculations)

			default:
				return 0
		}
	}

	// Filtered and sorted images
	const filteredImages = useMemo(() => {
		let filtered = [...images]

		if (filterArtist) {
			filtered = filtered.filter(img => img.artist === filterArtist)
		}

		if (filterDate) {
			const selectedDate = new Date(filterDate)
			filtered = filtered.filter(img => {
				const imgDate = new Date(img.processedAt)
				return (
					imgDate.getFullYear() === selectedDate.getFullYear() &&
					imgDate.getMonth() === selectedDate.getMonth() &&
					imgDate.getDate() === selectedDate.getDate()
				)
			})
		}

		// Sorting
		filtered.sort((a, b) => {
			if (sortKey === 'artist') {
				return a.artist.localeCompare(b.artist)
			} else if (sortKey === 'processedAt') {
				return new Date(b.processedAt).getTime() - new Date(a.processedAt).getTime()
			} else {
				// Handle metric sorting
				const aMetric = getMetric(a, sortKey)
				const bMetric = getMetric(b, sortKey)
				return bMetric - aMetric
			}
		})

		return filtered
	}, [images, sortKey, filterArtist, filterDate])

	// Handler to open modal with selected image
	const openModal = (image: ImageItem) => {
		console.log('Opening modal for image:', image)
		setSelectedImage(image)
		setModalIsOpen(true)
	}

	// Handler to close modal
	const closeModal = () => {
		setModalIsOpen(false)
		setSelectedImage(null)
	}

	// Cell Renderer for react-window Grid
	const Cell = ({
		columnIndex,
		rowIndex,
		style,
		data,
	}: {
		columnIndex: number
		rowIndex: number
		style: React.CSSProperties
		data: GridData
	}) => {
		const index = rowIndex * data.columns + columnIndex
		const image = data[index]

		if (!image) {
			return null
		}

		return (
			<div
				style={style}
				className="relative w-full h-full cursor-pointer"
				onClick={() => openModal(image)}
			>
				<Image
					src={image.filePath}
					alt={`${image.artist} - ${image.postId} - ${image.imageName}`}
					fill
					className="rounded object-cover p-1.5"
					loading="lazy"
					sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 20vw"
				/>
			</div>
		)
	}

	return (
		<div className="flex-grow flex flex-col  ">
			{/* Sorting and Filtering Controls */}
			<div className="flex flex-col md:flex-row items-start md:items-center justify-between px-8 mb-6 space-y-4 md:space-y-0">
				{/* Sorting */}
				<div>
					<label className="mr-2 font-semibold">Sort By:</label>
					<select
						value={sortKey}
						onChange={e => setSortKey(e.target.value)}
						className="border dark:border-slate-500 rounded p-2 dark:bg-slate-600"
					>
						<optgroup label="Artist & Date">
							<option value="artist">Artist</option>
							<option value="processedAt">Date Processed</option>
						</optgroup>
						<optgroup label="Luminance Metrics">
							<option value="mean_luminance">Mean Luminance</option>
							<option value="median_luminance">Median Luminance</option>
							<option value="std_luminance">Standard Deviation of Luminance</option>
							<option value="dynamic_range">Dynamic Range</option>
							<option value="rms_contrast">RMS Contrast</option>
							<option value="michelson_contrast">Michelson Contrast</option>
							<option value="luminance_skewness">Luminance Skewness</option>
							<option value="luminance_kurtosis">Luminance Kurtosis</option>
						</optgroup>

						<optgroup label="Saturation Metrics">
							<option value="mean_saturation">Mean Saturation</option>
							<option value="median_saturation">Median Saturation</option>
							<option value="std_saturation">Standard Deviation of Saturation</option>
						</optgroup>

						<optgroup label="GLCM Metrics">
							<option value="glcm_contrast">GLCM Contrast</option>
							<option value="glcm_correlation">GLCM Correlation</option>
						</optgroup>

						<optgroup label="Laplacian Metrics">
							<option value="laplacian_variance">Laplacian Variance</option>
						</optgroup>
					</select>
				</div>

				{/* Filtering by Artist */}
				<div>
					<label className="mr-2 font-semibold">Filter by Artist:</label>
					<select
						value={filterArtist}
						onChange={e => setFilterArtist(e.target.value)}
						className="border dark:border-slate-500 rounded p-2 dark:bg-slate-600"
					>
						<option value="">All Artists</option>
						{artists.map(artist => (
							<option key={artist} value={artist}>
								{artist}
							</option>
						))}
					</select>
				</div>

				{/* Filtering by Date */}
				<div>
					<label className="mr-2 font-semibold">Filter by Date:</label>
					<input
						type="date"
						value={filterDate}
						onChange={e => setFilterDate(e.target.value)}
						className="border dark:border-slate-500 rounded p-2 dark:bg-slate-600"
					/>
				</div>
			</div>

			{/* Virtualized Images Grid */}
			<div className="w-full h-[80vh] flex-grow">
				<AutoSizer>
					{({ height, width }) => {
						const columnCount = Math.floor(width / 300) || 1 // Each image cell approx 200px wide
						const rowCount = Math.ceil(filteredImages.length / columnCount)

						return (
							<Grid
								columnCount={columnCount}
								columnWidth={width / columnCount}
								height={height}
								rowCount={rowCount}
								rowHeight={240}
								width={width}
								itemData={
									{
										...filteredImages,
										columns: columnCount,
									} as GridData
								}
							>
								{Cell}
							</Grid>
						)
					}}
				</AutoSizer>
			</div>

			{/* Modal for Image and Stats */}
			{selectedImage && (
				<Modal
					isOpen={modalIsOpen}
					onRequestClose={closeModal}
					shouldCloseOnOverlayClick={true}
					shouldCloseOnEsc={true}
					contentLabel="Image Details"
					className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 p-20"
					overlayClassName="fixed inset-0 bg-black bg-opacity-50"
				>
					<div className="bg-white dark:bg-zinc-950 rounded-lg p-6 w-full relative">
						{/* Close Button */}
						<button
							onClick={closeModal}
							className="absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
						>
							&#10005;
						</button>

						<div className="flex flex-col md:flex-row">
							{/* Image */}
							<div className="relative w-full h-64 md:h-auto">
								<Image
									src={selectedImage.filePath}
									alt={`${selectedImage.artist} - ${selectedImage.postId} - ${selectedImage.imageName}`}
									fill
									className="rounded object-contain"
								/>
							</div>

							{/* Statistics */}
							<div className="md:w-1/2 mt-4 md:mt-0 md:ml-6">
								<h2 className="text-2xl font-semibold mb-4">Statistics</h2>

								{/* Luminance Metrics */}
								{selectedImage.metrics.luminance && (
									<div className="mb-6">
										<h3 className="text-xl font-medium mb-2">Luminance</h3>
										<ul className="list-disc list-inside">
											<li>
												Mean Luminance:{' '}
												{selectedImage.metrics.luminance.mean_luminance.toFixed(
													2
												)}
											</li>
											<li>
												Median Luminance:{' '}
												{selectedImage.metrics.luminance.median_luminance.toFixed(
													2
												)}
											</li>
											<li>
												Std Luminance:{' '}
												{selectedImage.metrics.luminance.std_luminance.toFixed(
													2
												)}
											</li>
											<li>
												Dynamic Range:{' '}
												{selectedImage.metrics.luminance.dynamic_range.toFixed(
													2
												)}
											</li>
											<li>
												RMS Contrast:{' '}
												{selectedImage.metrics.luminance.rms_contrast.toFixed(
													2
												)}
											</li>
											<li>
												Michelson Contrast:{' '}
												{selectedImage.metrics.luminance.michelson_contrast.toFixed(
													2
												)}
											</li>
											<li>
												Luminance Skewness:{' '}
												{selectedImage.metrics.luminance.luminance_skewness.toFixed(
													2
												)}
											</li>
											<li>
												Luminance Kurtosis:{' '}
												{selectedImage.metrics.luminance.luminance_kurtosis.toFixed(
													2
												)}
											</li>
										</ul>
									</div>
								)}

								{/* Saturation Metrics */}
								{selectedImage.metrics.saturation && (
									<div className="mb-6">
										<h3 className="text-xl font-medium mb-2">Saturation</h3>
										<ul className="list-disc list-inside">
											<li>
												Mean Saturation:{' '}
												{selectedImage.metrics.saturation.mean_saturation.toFixed(
													2
												)}
											</li>
											<li>
												Median Saturation:{' '}
												{selectedImage.metrics.saturation.median_saturation.toFixed(
													2
												)}
											</li>
											<li>
												Std Saturation:{' '}
												{selectedImage.metrics.saturation.std_saturation.toFixed(
													2
												)}
											</li>
										</ul>
									</div>
								)}

								{/* GLCM Metrics */}
								{selectedImage.metrics.glcm && (
									<div className="mb-6">
										<h3 className="text-xl font-medium mb-2">GLCM</h3>
										<ul className="list-disc list-inside">
											<li>
												Contrast:{' '}
												{selectedImage.metrics.glcm.contrast.toFixed(2)}
											</li>
											<li>
												Correlation:{' '}
												{selectedImage.metrics.glcm.correlation.toFixed(2)}
											</li>
										</ul>
									</div>
								)}

								{/* Laplacian Metrics */}
								{selectedImage.metrics.laplacian && (
									<div className="mb-6">
										<h3 className="text-xl font-medium mb-2">Laplacian</h3>
										<ul className="list-disc list-inside">
											<li>
												Variance:{' '}
												{selectedImage.metrics.laplacian.variance.toFixed(
													2
												)}
											</li>
										</ul>
									</div>
								)}

								{/* KMeans Clustering Metrics */}
								{selectedImage.metrics.kmeans &&
									selectedImage.metrics.kmeans.length > 0 && (
										<div className="mb-6">
											<h3 className="text-xl font-medium mb-2">
												KMeans Clustering
											</h3>
											{selectedImage.metrics.kmeans.map(kmeans => (
												<div key={kmeans.id} className="mb-4">
													{/* <h4 className="text-lg font-semibold mb-2">
														Cluster #{kmeans.id}
													</h4> */}
													<p>Number of Clusters: {kmeans.num_clusters}</p>
													<div className="mt-2">
														<Bar
															data={{
																labels: kmeans.Clusters.map(
																	cluster =>
																		`Cluster ${cluster.cluster_index}`
																),
																datasets: [
																	{
																		label: 'Percentage',
																		data: kmeans.Clusters.map(
																			cluster =>
																				cluster.percentage
																		),
																		backgroundColor:
																			kmeans.Clusters.map(
																				cluster =>
																					`rgb(${cluster.r}, ${cluster.g}, ${cluster.b})`
																			),
																	},
																],
															}}
															options={{
																responsive: true,
																scales: {
																	y: {
																		beginAtZero: true,
																		max: 100,
																	},
																},
															}}
														/>
													</div>
												</div>
											))}
										</div>
									)}
							</div>
						</div>
					</div>
				</Modal>
			)}
		</div>
	)
}

export default Gallery
