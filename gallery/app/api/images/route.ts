// app/api/images/route.ts

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url)
		const page = parseInt(searchParams.get('page') || '1')
		const pageSize = parseInt(searchParams.get('pageSize') || '50')
		const skip = (page - 1) * pageSize

		const sortKey = searchParams.get('sortKey') || 'post;post_date'
		const sortOrder = searchParams.get('sortOrder') || 'desc'

		let orderBy: any = {}
		if (sortKey.includes(';')) {
			const [relation, key] = sortKey.split(';')
			orderBy = { [relation]: { [key]: sortOrder } }
		} else {
			orderBy = { [sortKey]: sortOrder }
		}

		const filters: any = {}
		const nestedFilters: any = {}

		// Handle artist filter
		const artist = searchParams.get('artist')
		if (artist) {
			filters.post = { username: artist }
		}

		// Handle postId filter
		const postId = searchParams.get('postId')
		if (postId) {
			filters.post_id = parseInt(postId)
		}

		// LCH Filters
		const l_min = parseFloat(searchParams.get('l_min') || '0')
		const l_max = parseFloat(searchParams.get('l_max') || '100')
		const c_min = parseFloat(searchParams.get('c_min') || '0')
		const c_max = parseFloat(searchParams.get('c_max') || '100')
		const h_min = parseFloat(searchParams.get('h_min') || '0')
		const h_max = parseFloat(searchParams.get('h_max') || '360')
		const percentage_min = parseFloat(searchParams.get('percentage_min') || '0')
		const percentage_max = parseFloat(searchParams.get('percentage_max') || '100')

		const hasLchFilter =
			l_min !== 0 ||
			l_max !== 100 ||
			c_min !== 0 ||
			c_max !== 100 ||
			h_min !== 0 ||
			h_max !== 360 ||
			percentage_min !== 0 ||
			percentage_max !== 100

		if (hasLchFilter) {
			filters.KMeansClustering = {
				some: {
					Clusters: {
						some: {
							l: { gte: l_min, lte: l_max },
							c: { gte: c_min, lte: c_max },
							h:
								h_min <= h_max
									? { gte: h_min, lte: h_max }
									: {
											OR: [
												{ gte: h_min, lte: 360 },
												{ gte: 0, lte: h_max },
											],
									  },
							percentage: { gte: percentage_min, lte: percentage_max },
						},
					},
				},
			}
		}

		// Handle metric filters
		for (const [key, value] of searchParams.entries()) {
			if (key.endsWith('_min') || key.endsWith('_max')) {
				const metric = key.replace(/_(min|max)$/, '')

				// Skip LCH filters as they are already handled
				if (['l', 'c', 'h', 'percentage'].includes(metric)) continue

				const condition = key.endsWith('_min') ? 'gte' : 'lte'
				const numericValue = parseFloat(value)
				if (!isNaN(numericValue)) {
					// Map metrics to their respective relations
					switch (metric) {
						case 'mean_luminance':
						case 'median_luminance':
						case 'std_luminance':
						case 'dynamic_range':
						case 'rms_contrast':
						case 'michelson_contrast':
						case 'luminance_skewness':
						case 'luminance_kurtosis':
						case 'min_luminance':
						case 'max_luminance':
							if (!nestedFilters.Luminance) nestedFilters.Luminance = {}
							nestedFilters.Luminance[metric] = {
								...(nestedFilters.Luminance[metric] || {}),
								[condition]: numericValue,
							}
							break
						case 'mean_saturation':
						case 'median_saturation':
						case 'std_saturation':
							if (!nestedFilters.Saturation) nestedFilters.Saturation = {}
							nestedFilters.Saturation[metric] = {
								...(nestedFilters.Saturation[metric] || {}),
								[condition]: numericValue,
							}
							break
						case 'contrast':
						case 'correlation':
							if (!nestedFilters.GLCM) nestedFilters.GLCM = {}
							nestedFilters.GLCM[metric] = {
								...(nestedFilters.GLCM[metric] || {}),
								[condition]: numericValue,
							}
							break
						case 'variance':
							if (!nestedFilters.Laplacian) nestedFilters.Laplacian = {}
							nestedFilters.Laplacian[metric] = {
								...(nestedFilters.Laplacian[metric] || {}),
								[condition]: numericValue,
							}
							break
						// Add more cases as needed for other metrics
						default:
							// Handle unknown metrics or throw an error
							break
					}
				}
			}
		}

		// Merge nested filters into the main filters object
		Object.keys(nestedFilters).forEach(relation => {
			filters[relation] = { ...filters[relation], ...nestedFilters[relation] }
		})

		console.log('Filters:', JSON.stringify(filters, null, 2))

		// Fetch images with applied filters
		const images = await prisma.images.findMany({
			skip,
			take: pageSize,
			where: filters,
			orderBy,
			include: {
				post: true,
				Luminance: true,
				Saturation: true,
				GLCM: true,
				Laplacian: true,
				KMeansClustering: {
					include: {
						Clusters: true,
					},
				},
			},
		})

		// Get total count
		const totalImages = await prisma.images.count({
			where: filters,
		})

		return NextResponse.json({ images, totalImages })
	} catch (error) {
		console.error('Failed to fetch images:', error)
		return NextResponse.json({ error: 'Failed to fetch images.' }, { status: 500 })
	}
}
