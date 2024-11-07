// components/ModalProvider.tsx
'use client'

import React, { useEffect, useState } from 'react'
import Modal from 'react-modal'

const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [isModalReady, setIsModalReady] = useState(false)

	useEffect(() => {
		const appElement = document.body
		if (appElement) {
			Modal.setAppElement(appElement)
			setIsModalReady(true)
		} else {
			console.error('App element not found for react-modal.')
		}
	}, [])

	if (!isModalReady) {
		// Optionally, render a loading spinner or null to prevent rendering modals prematurely
		return null
	}

	return <>{children}</>
}

export default ModalProvider
