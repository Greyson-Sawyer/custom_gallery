import React, { useEffect, useState } from 'react'
import { Chart, ChartData, ChartOptions, registerables } from 'chart.js'
import { Bar } from 'react-chartjs-2'
import annotationPlugin from 'chartjs-plugin-annotation'

Chart.register(...registerables, annotationPlugin)

type LuminanceHistogramProps = {
	imageSrc: string
	mean: number
	median: number
	stdDev: number
	min: number
	max: number
}

const LuminanceHistogram: React.FC<LuminanceHistogramProps> = ({
	imageSrc,
	mean,
	median,
	stdDev,
	min,
	max,
}) => {
	const [computedHistogramData, setComputedHistogramData] = useState<number[]>([])

	useEffect(() => {
		const img = new Image()
		img.crossOrigin = 'anonymous'
		img.src = imageSrc
		img.onload = () => {
			const canvas = document.createElement('canvas')
			canvas.width = img.naturalWidth
			canvas.height = img.naturalHeight
			const ctx = canvas.getContext('2d')

			if (ctx) {
				ctx.drawImage(img, 0, 0)
				const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
				const data = imageData.data
				const histogram = new Array(101).fill(0) // 0% to 100%

				for (let i = 0; i < data.length; i += 4) {
					const r = data[i]
					const g = data[i + 1]
					const b = data[i + 2]
					const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
					const percentage = Math.floor((luminance / 255) * 100)
					histogram[percentage] += 1
				}

				setComputedHistogramData(histogram)
			}
		}
	}, [imageSrc])

	if (computedHistogramData.length === 0) {
		return <div>Loading histogram...</div>
	}

	// Map labels from 0% to 100%
	const labels = computedHistogramData.map((_, i) => `${i}%`)

	const data: ChartData<'bar'> = {
		labels: labels,
		datasets: [
			{
				label: 'Luminance Frequency',
				data: computedHistogramData,
				backgroundColor: 'rgba(75,192,192,0.4)',
				borderColor: 'rgba(75,192,192,1)',
				borderWidth: 1,
			},
		],
	}

	// Convert mean, median, and stdDev to percentage scale

	const options: ChartOptions<'bar'> = {
		responsive: true,
		maintainAspectRatio: false,
		scales: {
			x: {
				title: {
					display: true,
					text: 'Luminance Value (%)',
				},
				ticks: {
					maxTicksLimit: 11, // Show ticks at every 10%
				},
			},
			y: {
				title: {
					display: true,
					text: 'Frequency',
				},
			},
		},
		plugins: {
			legend: {
				display: false,
			},
			annotation: {
				annotations: {
					meanLine: {
						type: 'line',
						xMin: mean,
						xMax: mean,
						borderColor: 'red',
						borderWidth: 2,
						label: {
							content: 'Mean',
							display: true,
							position: 'end',
						},
					},
					medianLine: {
						type: 'line',
						xMin: median,
						xMax: median,
						borderColor: 'blue',
						borderWidth: 2,
						label: {
							content: 'Median',
							display: true,
							position: 'end',
						},
					},
					stdDevPlus: {
						type: 'line',
						xMin: mean + stdDev,
						xMax: mean + stdDev,
						borderColor: 'green',
						borderWidth: 1,
						borderDash: [5, 5],
						label: {
							content: '+1σ',
							display: true,
							position: 'end',
						},
					},
					stdDevMinus: {
						type: 'line',
						xMin: mean - stdDev,
						xMax: mean - stdDev,
						borderColor: 'green',
						borderWidth: 1,
						borderDash: [5, 5],
						label: {
							content: '-1σ',
							display: true,
							position: 'end',
						},
					},
					minLine: {
						type: 'line',
						xMin: min,
						xMax: min,
						borderColor: 'gray',
						borderWidth: 1,
						label: {
							content: 'Min',
							display: true,
							position: 'end',
						},
					},
					maxLine: {
						type: 'line',
						xMin: max,
						xMax: max,
						borderColor: 'white',
						borderWidth: 1,
						label: {
							content: 'Max',
							display: true,
							position: 'end',
						},
					},
				},
			},
		},
	}

	return (
		<div className="h-full w-full">
			<Bar data={data} options={options} />
		</div>
	)
}

export default LuminanceHistogram
