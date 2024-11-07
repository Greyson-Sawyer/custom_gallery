// components/Gallery/GalleryCell.tsx

import React from 'react'
import Image from 'next/image'
import { ImageItem } from '@/types/gallery'

type GalleryCellProps = {
	image: ImageItem
	onClick: (image: ImageItem) => void
}

const GalleryCell: React.FC<GalleryCellProps> = ({ image, onClick }) => {
	return (
		<div className="relative w-full h-64 cursor-pointer" onClick={() => onClick(image)}>
			<Image
				src={image.relative_file_path}
				alt={`${image.artist} - ${image.post_id} - ${image.filename}`}
				fill
				className="rounded object-cover"
				loading="lazy"
				sizes="(max-width: 768px) 30vw, 30vw"
			/>
		</div>
	)
}

export default GalleryCell
