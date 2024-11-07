// app/page.tsx

import React from 'react'
import Gallery from '@/components/Gallery/Gallery'

const HomePage = () => {
	return (
		<main className="min-h-screen dark:bg-slate-950 bg-gray-50 p-0">
			<Gallery />
		</main>
	)
}

export default HomePage
