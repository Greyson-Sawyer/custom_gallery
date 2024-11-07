// components/CollapsibleSection.tsx

'use client'

import React, { useState } from 'react'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid' // Ensure you have Heroicons installed

type CollapsibleSectionProps = {
	title: string
	children: React.ReactNode
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ title, children }) => {
	const [isOpen, setIsOpen] = useState<boolean>(false)

	const toggleOpen = () => {
		setIsOpen(!isOpen)
	}

	return (
		<div className="mb-4">
			<button
				onClick={toggleOpen}
				className="flex items-center justify-between w-full p-3 bg-gray-200 dark:bg-gray-700 rounded-md focus:outline-none transition-colors duration-200"
			>
				<span className="font-semibold text-gray-800 dark:text-gray-200">{title}</span>
				{isOpen ? (
					<ChevronUpIcon className="w-5 h-5 text-gray-800 dark:text-gray-200" />
				) : (
					<ChevronDownIcon className="w-5 h-5 text-gray-800 dark:text-gray-200" />
				)}
			</button>
			{isOpen && (
				<div className="mt-2 pl-4 border-l-2 border-gray-300 dark:border-gray-600 ">
					{children}
				</div>
			)}
		</div>
	)
}

export default CollapsibleSection
