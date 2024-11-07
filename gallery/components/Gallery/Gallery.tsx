// components/Gallery/Gallery.tsx

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import GalleryControls from './GalleryControls'
import ImageModal from './ImageModal'
import GalleryCell from './GalleryCell'
import { ImageItem, SortOrder, Filters } from '@/types/gallery'
import { useRouter } from 'next/navigation'
import { parseFiltersFromQuery, buildQueryParams } from './utils'

const Gallery: React.FC = () => {
	const router = useRouter()
	const [images, setImages] = useState<ImageItem[]>([])
	const [totalPages, setTotalPages] = useState<number>(1)
	const [totalImages, setTotalImages] = useState<number>(0)
	const pageSize = 200

	// Retrieve filters and sorting from URL
	const searchParams = new URLSearchParams(window.location.search)
	const initialFilters = parseFiltersFromQuery(searchParams)
	const initialSortKey = searchParams.get('sortKey') || 'post;post_date'
	const initialSortOrder = (searchParams.get('sortOrder') as SortOrder) || 'desc'
	const initialPage = parseInt(searchParams.get('page') || '1', 10)

	const [currentPage, setCurrentPage] = useState<number>(initialPage)
	const [sortKey, setSortKey] = useState<string>(initialSortKey)
	const [sortOrder, setSortOrder] = useState<SortOrder>(initialSortOrder)
	const [filters, setFilters] = useState<Filters>(initialFilters)

	const [loading, setLoading] = useState<boolean>(true)
	const [modalIsOpen, setModalIsOpen] = useState<boolean>(false)
	const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null)
	const [selectedIndex, setSelectedIndex] = useState<number>(-1)

	// Fetch images from API
	useEffect(() => {
		const fetchImages = async () => {
			const params = buildQueryParams({
				page: currentPage,
				pageSize,
				sortKey,
				sortOrder,
				filters,
			})

			const response = await fetch(`/api/images?${params.toString()}`)
			const data = await response.json()
			setImages(data.images)
			const totalImages = data.totalImages
			setTotalPages(Math.ceil(totalImages / pageSize))
			setTotalImages(totalImages)
		}

		try {
			setLoading(true)
			fetchImages()
		} catch (error) {
			console.error('Error fetching images:', error)
			setLoading(false)
		}
	}, [currentPage, sortKey, sortOrder, filters])

	// Update URL when filters or pagination change
	useEffect(() => {
		const params = buildQueryParams({
			page: currentPage,
			sortKey,
			sortOrder,
			filters,
		})
		router.push(`?${params.toString()}`, { shallow: true } as any)
		console.log(params)
	}, [currentPage, sortKey, sortOrder, filters])

	// Unique list of artists for filtering
	const [artists, setArtists] = useState<string[]>([])
	useEffect(() => {
		const fetchArtists = async () => {
			const response = await fetch('/api/artists')
			const data = await response.json()
			setArtists(data.artists.sort())
		}

		fetchArtists()
	}, [])

	// Modal handlers
	const handleImageSelect = (image: ImageItem) => {
		const index = images.findIndex(img => img.id === image.id)
		setSelectedIndex(index)
		setSelectedImage(image)
		if (!modalIsOpen) {
			setModalIsOpen(true)
		}
	}

	const closeModal = () => {
		setModalIsOpen(false)
		setSelectedImage(null)
		setSelectedIndex(-1)
	}

	const goToPrevious = () => {
		if (selectedIndex > 0) {
			const newIndex = selectedIndex - 1
			setSelectedIndex(newIndex)
			setSelectedImage(images[newIndex])
		}
	}

	const goToNext = () => {
		if (selectedIndex < images.length - 1) {
			const newIndex = selectedIndex + 1
			setSelectedIndex(newIndex)
			setSelectedImage(images[newIndex])
		}
	}

	// Keyboard navigation
	const handleKeyDown = useCallback(
		(e: KeyboardEvent) => {
			if (modalIsOpen) {
				if (e.key === 'ArrowLeft') {
					goToPrevious()
				} else if (e.key === 'ArrowRight') {
					goToNext()
				} else if (e.key === 'Escape') {
					closeModal()
				}
			}
		},
		[modalIsOpen, selectedIndex, images]
	)

	useEffect(() => {
		window.addEventListener('keydown', handleKeyDown as any)
		return () => {
			window.removeEventListener('keydown', handleKeyDown as any)
		}
	}, [handleKeyDown])

	// Page change handler
	const handlePageChange = async (newPage: number) => {
		setCurrentPage(newPage)
		window.scrollTo(0, 0)
	}

	return (
		<div>
			<GalleryControls
				sortKey={sortKey}
				setSortKey={setSortKey}
				sortOrder={sortOrder}
				setSortOrder={setSortOrder}
				filters={filters}
				setFilters={setFilters}
				artists={artists}
				totalImages={totalImages}
			/>

			<div className="">
				{/* Image Grid */}
				<div className="grid mr-80 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 p-4">
					{images.map(image => (
						<GalleryCell key={image.id} image={image} onClick={handleImageSelect} />
					))}
				</div>

				{/* Pagination Controls */}
				<div className="flex justify-center my-4">
					<button
						disabled={currentPage <= 1}
						onClick={() => handlePageChange(currentPage - 1)}
						className="px-4 py-2 mx-2 bg-gray-200 hover:bg-gray-300 dark:bg-slate-800 dark:hover:bg-slate-700 rounded disabled:opacity-50"
					>
						Prev
					</button>
					<span className="px-4 py-2 mx-2">
						Page {currentPage} of {totalPages}
					</span>
					<button
						disabled={currentPage >= totalPages}
						onClick={() => handlePageChange(currentPage + 1)}
						className="px-4 py-2 mx-2 bg-gray-200 hover:bg-gray-300 dark:bg-slate-800 dark:hover:bg-slate-700 rounded disabled:opacity-50"
					>
						Next
					</button>
				</div>
			</div>

			{selectedImage && (
				<ImageModal
					isOpen={modalIsOpen}
					onRequestClose={closeModal}
					image={selectedImage}
					onNext={goToNext}
					onPrevious={goToPrevious}
					onImageSelect={handleImageSelect}
				/>
			)}
		</div>
	)
}

export default Gallery
