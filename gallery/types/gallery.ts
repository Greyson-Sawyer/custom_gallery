// types/gallery.ts

export type Cluster = {
	clustering_id: number
	cluster_index: number
	r: number
	g: number
	b: number
	l: number
	a: number
	b_channel: number
	c: number
	h: number
	count: number
	percentage: number
}

export type KMeansClustering = {
	id: number
	num_clusters: number
	Clusters: Cluster[]
}

export type Metrics = {
	luminance: {
		mean_luminance: number
		median_luminance: number
		std_luminance: number
		dynamic_range: number
		rms_contrast: number
		michelson_contrast: number
		luminance_skewness: number
		luminance_kurtosis: number
		min_luminance: number
		max_luminance: number
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

export type LuminanceMetrics = {
	mean_luminance: number
	median_luminance: number
	std_luminance: number
	dynamic_range: number
	rms_contrast: number
	michelson_contrast: number
	luminance_skewness: number
	luminance_kurtosis: number
	min_luminance: number
	max_luminance: number
	histogram?: any
}

export type SaturationMetrics = {
	mean_saturation: number
	median_saturation: number
	std_saturation: number
}

export type GLCMMetrics = {
	contrast: number
	correlation: number
}

export type LaplacianMetrics = {
	variance: number
}

export type KMeansClusteringMetrics = {
	id: number
	image_id: number
	num_clusters: number
	Clusters: Cluster[]
}

export type Post = {
	id: number
	shortcode: string
	username: string
	caption?: string
	post_date: string // Updated to string
}

export type ImageItem = {
	id: number
	absolute_file_path: string
	relative_file_path: string
	filename: string
	artist: string
	post_id: number
	post: Post
	processed_at: string
	width: number
	height: number
	Luminance: LuminanceMetrics
	Saturation: SaturationMetrics
	GLCM: GLCMMetrics
	Laplacian: LaplacianMetrics
	KMeansClustering: KMeansClusteringMetrics[]
}

export type GridData = ImageItem[] & { columns: number }

export type GalleryProps = {}

// Additional Types for Sorting and Filtering

export type SortOption = {
	label: string
	value: string
	group: string
	min: number
	max: number
}

export interface OptionGroup {
	groupName: string
	options: SortOption[]
}

export type SortOrder = 'asc' | 'desc'

export type FilterRange = {
	min: number
	max: number
}

export type LchFilters = {
	l: FilterRange
	c: FilterRange
	h: FilterRange
	percentage: FilterRange
}

export type Filters = {
	artist?: string
	lch?: LchFilters
	[key: string]: any
}
