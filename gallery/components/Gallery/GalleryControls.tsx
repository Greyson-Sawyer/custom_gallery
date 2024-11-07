// components/Gallery/GalleryControls.tsx

'use client'

import React, { useState, useEffect } from 'react'
import { SortOption, SortOrder, Filters, OptionGroup } from '@/types/gallery'
import MetricFilter from './MetricFilter'
import CollapsibleSection from '../CollapsibleSection'
import { lchToHex } from './utils' // We'll create this utility

type GalleryControlsProps = {
	sortKey: string
	setSortKey: (key: string) => void
	sortOrder: SortOrder
	setSortOrder: (order: SortOrder) => void
	filters: Filters
	setFilters: (filters: Filters) => void
	artists: string[]
	totalImages: number
}

const optionGroups: OptionGroup[] = [
	{
		groupName: 'Luminance',
		options: [
			{
				label: 'Mean Luminance',
				group: 'Luminance',
				value: 'mean_luminance',
				min: 0,
				max: 100,
			},
			{
				label: 'Median Luminance',
				group: 'Luminance',
				value: 'median_luminance',
				min: 0,
				max: 100,
			},
			{
				label: 'Standard Deviation of Luminance',
				group: 'Luminance',
				value: 'std_luminance',
				min: 0,
				max: 50,
			},
			{
				label: 'Dynamic Range',
				group: 'Luminance',
				value: 'dynamic_range',
				min: 0,
				max: 100,
			},
			{ label: 'RMS Contrast', group: 'Luminance', value: 'rms_contrast', min: 0, max: 100 },
			{
				label: 'Michelson Contrast',
				group: 'Luminance',
				value: 'michelson_contrast',
				min: 0,
				max: 1,
			},
			{
				label: 'Luminance Skewness',
				group: 'Luminance',
				value: 'luminance_skewness',
				min: -5,
				max: 15,
			},
			{
				label: 'Luminance Kurtosis',
				group: 'Luminance',
				value: 'luminance_kurtosis',
				min: -2,
				max: 200,
			},
			{
				label: 'Min Luminance',
				group: 'Luminance',
				value: 'min_luminance',
				min: 0,
				max: 100,
			},
			{
				label: 'Max Luminance',
				group: 'Luminance',
				value: 'max_luminance',
				min: 0,
				max: 100,
			},
		],
	},
	{
		groupName: 'Saturation',
		options: [
			{
				label: 'Mean Saturation',
				group: 'Saturation',
				value: 'mean_saturation',
				min: 0,
				max: 1,
			},
			{
				label: 'Median Saturation',
				group: 'Saturation',
				value: 'median_saturation',
				min: 0,
				max: 1,
			},
			{
				label: 'Standard Deviation of Saturation',
				group: 'Saturation',
				value: 'std_saturation',
				min: 0,
				max: 0.5,
			},
		],
	},
	{
		groupName: 'GLCM',
		options: [
			{ label: 'GLCM Contrast', group: 'GLCM', value: 'contrast', min: 0, max: 1500 },
			{ label: 'GLCM Correlation', group: 'GLCM', value: 'correlation', min: 0, max: 1 },
		],
	},
	{
		groupName: 'Laplacian',
		options: [
			{
				label: 'Laplacian Variance',
				group: 'Laplacian',
				value: 'variance',
				min: 0,
				max: 2500,
			},
		],
	},
]

const GalleryControls: React.FC<GalleryControlsProps> = ({
	sortKey,
	setSortKey,
	sortOrder,
	setSortOrder,
	filters,
	setFilters,
	artists,
	totalImages,
}) => {
	const [localFilters, setLocalFilters] = useState<Filters>({ ...filters })
	// LCH Filter State
	const [lchFilters, setLchFilters] = useState({
		l: { min: 0, max: 100 },
		c: { min: 0, max: 100 },
		h: { min: 0, max: 360 },
		percentage: { min: 0, max: 100 },
	})

	// Create metricRanges mapping
	const metricRanges = optionGroups.reduce((acc, group) => {
		group.options.forEach(option => {
			acc[option.value] = { min: option.min, max: option.max }
		})
		return acc
	}, {} as Record<string, { min: number; max: number }>)

	const handleFilterChange = (key: keyof Filters, min: number, max: number) => {
		const defaultMin = metricRanges[key]?.min ?? 0
		const defaultMax = metricRanges[key]?.max ?? 100

		setLocalFilters(prev => {
			if (min === defaultMin && max === defaultMax) {
				const { [key]: _, ...rest } = prev
				return rest
			}

			return {
				...prev,
				[key]: { min, max },
			}
		})
	}
	// Update filters when LCH filters change
	useEffect(() => {
		setFilters((prev: Filters) => ({
			...prev,
			lch: lchFilters,
		}))
	}, [lchFilters, setFilters])

	useEffect(() => {
		setFilters(localFilters)
	}, [localFilters, setFilters])

	return (
		<div className="w-80 fixed right-0 top-0 p-6 shadow-lg max-h-screen overflow-y-auto bg-white dark:bg-gray-800">
			<h2 className="text-2xl mb-1 font-semibold text-gray-800 dark:text-gray-200">
				Filters & Sorting
			</h2>
			{/* Total Images Information */}
			<div className="mb-6">
				<p className="text-gray-700 dark:text-gray-300">{totalImages} images found</p>
			</div>

			{/* Sorting Section */}
			<CollapsibleSection title="Sorting">
				<div className="space-y-4">
					<div>
						<label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">
							Sort By:
						</label>
						<select
							value={sortKey}
							onChange={e => setSortKey(e.target.value)}
							className="w-full border dark:border-slate-500 rounded p-2 dark:bg-slate-700 mb-2 text-gray-700 dark:text-gray-300"
						>
							{[
								{
									groupName: 'Post',
									options: [
										{ label: 'Artist', group: 'post', value: 'username' },
										{ label: 'Date Posted', group: 'post', value: 'post_date' },
									],
								},
								...optionGroups,
							].map(group => (
								<optgroup label={group.groupName} key={group.groupName}>
									{group.options.map(option => (
										<option
											key={option.value}
											value={`${option.group};${option.value}`}
										>
											{option.label}
										</option>
									))}
								</optgroup>
							))}
						</select>
					</div>

					<div>
						<label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">
							Sort Order:
						</label>
						<select
							value={sortOrder}
							onChange={e => setSortOrder(e.target.value as SortOrder)}
							className="w-full border dark:border-slate-500 rounded p-2 dark:bg-slate-700 text-gray-700 dark:text-gray-300"
						>
							<option value="asc">Ascending</option>
							<option value="desc">Descending</option>
						</select>
					</div>
				</div>
			</CollapsibleSection>

			{/* Artist Filter Section */}
			<CollapsibleSection title="Artist">
				<div>
					<label className="block font-semibold mb-2 text-gray-700 dark:text-gray-300">
						Filter by Artist:
					</label>
					<select
						value={localFilters.artist || ''}
						onChange={e => {
							const value = e.target.value
							setLocalFilters(prev => {
								if (value === '') {
									const { artist, ...rest } = prev
									return rest
								}
								return { ...prev, artist: value }
							})
						}}
						className="w-full border dark:border-slate-500 rounded p-2 dark:bg-slate-700 text-gray-700 dark:text-gray-300"
					>
						<option value="">All Artists</option>
						{artists.map(artist => (
							<option key={artist} value={artist}>
								{artist}
							</option>
						))}
					</select>
				</div>
			</CollapsibleSection>

			{/* LCH Filter Section */}
			<CollapsibleSection title="Color (LCH)">
				{/* L Slider */}
				<MetricFilter
					label="Lightness (L)"
					metricKey="l"
					filterRange={lchFilters.l}
					min={0}
					max={100}
					handleFilterChange={(key, min, max) => {
						setLchFilters(prev => ({ ...prev, l: { min, max } }))
					}}
				/>

				{/* C Slider */}
				<MetricFilter
					label="Chroma (C)"
					metricKey="c"
					filterRange={lchFilters.c}
					min={0}
					max={100}
					handleFilterChange={(key, min, max) => {
						setLchFilters(prev => ({ ...prev, c: { min, max } }))
					}}
				/>

				{/* H Slider */}
				<MetricFilter
					label="Hue (H)"
					metricKey="h"
					filterRange={lchFilters.h}
					min={0}
					max={360}
					handleFilterChange={(key, min, max) => {
						setLchFilters(prev => ({ ...prev, h: { min, max } }))
					}}
				/>

				{/* Percentage Slider */}
				<MetricFilter
					label="Cluster Percentage"
					metricKey="percentage"
					filterRange={lchFilters.percentage}
					min={0}
					max={100}
					handleFilterChange={(key, min, max) => {
						setLchFilters(prev => ({ ...prev, percentage: { min, max } }))
					}}
				/>

				{/* Color Visualization */}
				<div
					className="w-full h-12 mt-4 rounded"
					style={{
						backgroundColor: lchToHex(
							(lchFilters.l.min + lchFilters.l.max) / 2,
							(lchFilters.c.min + lchFilters.c.max) / 2,
							(lchFilters.h.min + lchFilters.h.max) / 2
						),
					}}
				></div>
			</CollapsibleSection>

			{/* Metrics Sections */}
			{optionGroups.map(group => (
				<CollapsibleSection key={group.groupName} title={group.groupName}>
					<div className="space-y-4">
						{group.options.map(option => (
							<MetricFilter
								key={option.value}
								label={option.label}
								metricKey={option.value as keyof Filters}
								filterRange={filters[option.value as keyof Filters]}
								min={option.min}
								max={option.max}
								handleFilterChange={handleFilterChange}
							/>
						))}
					</div>
				</CollapsibleSection>
			))}
		</div>
	)
}

export default GalleryControls
