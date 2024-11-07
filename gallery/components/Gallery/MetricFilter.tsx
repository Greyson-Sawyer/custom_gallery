'use client'

import React, { useState, useCallback, useEffect } from 'react'
import Slider from 'rc-slider'
import { Filters, FilterRange } from '@/types/gallery'
import 'rc-slider/assets/index.css'
import debounce from 'lodash/debounce'

type MetricFilterProps = {
	label: string
	metricKey: keyof Filters
	filterRange?: FilterRange
	step?: number
	min: number
	max: number
	handleFilterChange: (key: keyof Filters, min: number, max: number) => void
}

const MetricFilter: React.FC<MetricFilterProps> = ({
	label,
	metricKey,
	filterRange,
	min,
	max,
	handleFilterChange,
}) => {
	const [localMin, setLocalMin] = useState<number>(filterRange?.min ?? min)
	const [localMax, setLocalMax] = useState<number>(filterRange?.max ?? max)
	const step = (max - min) / 100

	useEffect(() => {
		setLocalMin(filterRange?.min ?? min)
		setLocalMax(filterRange?.max ?? max)
	}, [filterRange, min, max])

	const debouncedHandleFilterChange = useCallback(
		debounce((key: keyof Filters, min: number, max: number) => {
			handleFilterChange(key, min, max)
		}, 300),
		[handleFilterChange]
	)

	useEffect(() => {
		return () => {
			debouncedHandleFilterChange.cancel()
		}
	}, [debouncedHandleFilterChange])

	const onSliderChange = (values: number | number[]) => {
		const [newMin, newMax] = values as number[]
		setLocalMin(newMin)
		setLocalMax(newMax)
		debouncedHandleFilterChange(metricKey, newMin, newMax)
	}

	const onMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newMin = Math.max(min, Number(e.target.value) || min)
		setLocalMin(newMin)
		debouncedHandleFilterChange(metricKey, newMin, localMax)
	}

	const onMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newMax = Math.min(max, Number(e.target.value) || max)
		setLocalMax(newMax)
		debouncedHandleFilterChange(metricKey, localMin, newMax)
	}

	return (
		<div className="border-b dark:border-gray-700 p-4">
			<label className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
				{label}
			</label>

			<Slider
				range
				min={min}
				max={max}
				step={step}
				allowCross={false}
				value={[localMin, localMax]}
				onChange={onSliderChange}
				trackStyle={{ backgroundColor: '#3b82f6' }}
				handleStyle={[{ borderColor: '#3b82f6' }, { borderColor: '#3b82f6' }]}
				railStyle={{ backgroundColor: '#d1d5db' }}
			/>

			<div className="flex mt-2">
				<div className="flex w-1/2 items-center">
					<span className="mr-2 text-sm text-gray-600 dark:text-gray-400">Min</span>
					<input
						type="number"
						min={min}
						max={localMax}
						value={localMin}
						onChange={onMinChange}
						className="w-full px-3 py-1 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
				</div>
				<div className="flex w-1/2 items-center">
					<span className="mr-2 text-sm text-gray-600 dark:text-gray-400">Max</span>
					<input
						type="number"
						min={localMin}
						max={max}
						value={localMax}
						onChange={onMaxChange}
						className="w-full px-3 py-1 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
				</div>
			</div>
		</div>
	)
}

export default React.memo(MetricFilter)
