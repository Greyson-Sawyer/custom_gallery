// app/api/artists/route.ts

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
	try {
		const artists = await prisma.posts.findMany({
			select: {
				username: true,
			},
			distinct: ['username'],
		})

		const artistNames = artists.map(a => a.username)

		return NextResponse.json({ artists: artistNames })
	} catch (error) {
		console.error('Failed to fetch artists:', error)
		return NextResponse.json({ error: 'Failed to fetch artists.' }, { status: 500 })
	}
}
