// components/Gallery/utils.ts

import { ImageItem, Filters } from '@/types/gallery'
import { color, lch } from 'd3-color'

export function lchToHex(l: number, c: number, h: number): string {
	console.log('lchToHex', l, c, h)
	// Create LCH color
	const lchColor = lch(l, c, h)
	// Convert to RGB and then to Hex
	console.log('lchColor', lchColor)
	return lchColor?.formatHex() || '#000000'
}

export const getMetric = (image: ImageItem, key: string): number => {
	switch (key) {
		// Luminance metrics
		case 'mean_luminance':
			return image.Luminance?.mean_luminance || 0
		case 'median_luminance':
			return image.Luminance?.median_luminance || 0
		case 'std_luminance':
			return image.Luminance?.std_luminance || 0
		case 'dynamic_range':
			return image.Luminance?.dynamic_range || 0
		case 'rms_contrast':
			return image.Luminance?.rms_contrast || 0
		case 'michelson_contrast':
			return image.Luminance?.michelson_contrast || 0
		case 'luminance_skewness':
			return image.Luminance?.luminance_skewness || 0
		case 'luminance_kurtosis':
			return image.Luminance?.luminance_kurtosis || 0
		case 'min_luminance':
			return image.Luminance?.min_luminance || 0
		case 'max_luminance':
			return image.Luminance?.max_luminance || 0

		// Saturation metrics
		case 'mean_saturation':
			return image.Saturation?.mean_saturation || 0
		case 'median_saturation':
			return image.Saturation?.median_saturation || 0
		case 'std_saturation':
			return image.Saturation?.std_saturation || 0

		// GLCM metrics
		case 'glcm_contrast':
			return image.GLCM?.contrast || 0
		case 'glcm_correlation':
			return image.GLCM?.correlation || 0

		// Laplacian metrics
		case 'laplacian_variance':
			return image.Laplacian?.variance || 0

		default:
			return 0
	}
}

// Function to filter images based on filter ranges
export const filterImages = (images: ImageItem[], filters: Filters): ImageItem[] => {
	return images.filter(image => {
		for (const key in filters) {
			if (key === 'artist') {
				return image.artist === filters.artist
			}
			const metricValue = getMetric(image, key)
			const { min, max } = filters[key as keyof Filters] as { min: number; max: number }
			if (metricValue < min || metricValue > max) {
				return false
			}
		}
		return true
	})
}

export const parseFiltersFromQuery = (searchParams: URLSearchParams): Filters => {
	const filters: Filters = {}

	// Artist filter
	const artist = searchParams.get('artist')
	if (artist) filters.artist = artist

	// LCH filters
	const l_min = parseFloat(searchParams.get('l_min') || '0')
	const l_max = parseFloat(searchParams.get('l_max') || '100')
	const c_min = parseFloat(searchParams.get('c_min') || '0')
	const c_max = parseFloat(searchParams.get('c_max') || '100')
	const h_min = parseFloat(searchParams.get('h_min') || '0')
	const h_max = parseFloat(searchParams.get('h_max') || '360')
	const percentage_min = parseFloat(searchParams.get('percentage_min') || '0')
	const percentage_max = parseFloat(searchParams.get('percentage_max') || '100')

	if (
		l_min !== 0 ||
		l_max !== 100 ||
		c_min !== 0 ||
		c_max !== 100 ||
		h_min !== 0 ||
		h_max !== 360 ||
		percentage_min !== 0 ||
		percentage_max !== 100
	) {
		filters.lch = {
			l: { min: l_min, max: l_max },
			c: { min: c_min, max: c_max },
			h: { min: h_min, max: h_max },
			percentage: { min: percentage_min, max: percentage_max },
		}
	}

	// Other filters

	for (const [key, value] of searchParams.entries()) {
		if (key === 'page' || key === 'sortKey' || key === 'sortOrder') continue
		if (key === 'artist') {
			filters.artist = value
		} else if (key.endsWith('_min')) {
			const metric = key.replace('_min', '')
			if (!filters[metric]) filters[metric] = {}
			filters[metric].min = parseFloat(value)
		} else if (key.endsWith('_max')) {
			const metric = key.replace('_max', '')
			if (!filters[metric]) filters[metric] = {}
			filters[metric].max = parseFloat(value)
		}
	}
	return filters
}

export const buildQueryParams = ({
	page,
	pageSize,
	sortKey,
	sortOrder,
	filters,
}: {
	page: number
	pageSize?: number
	sortKey: string
	sortOrder: string
	filters: Filters
}): URLSearchParams => {
	const params = new URLSearchParams()
	params.set('page', page.toString())
	if (pageSize) params.set('pageSize', pageSize.toString())
	params.set('sortKey', sortKey)
	params.set('sortOrder', sortOrder)

	for (const key in filters) {
		if (key === 'lch') {
			const lch = filters.lch
			if (lch) {
				params.set('l_min', lch.l.min.toString())
				params.set('l_max', lch.l.max.toString())
				params.set('c_min', lch.c.min.toString())
				params.set('c_max', lch.c.max.toString())
				params.set('h_min', lch.h.min.toString())
				params.set('h_max', lch.h.max.toString())
				params.set('percentage_min', lch.percentage.min.toString())
				params.set('percentage_max', lch.percentage.max.toString())
			}
		} else if (key === 'artist' && filters.artist) {
			params.set('artist', filters.artist)
		} else {
			// Handle other filters if any
			const filter = filters[key]
			if (filter.min !== undefined && filter.max !== undefined) {
				params.set(`${key}_min`, filter.min.toString())
				params.set(`${key}_max`, filter.max.toString())
			}
		}
	}

	return params
}
