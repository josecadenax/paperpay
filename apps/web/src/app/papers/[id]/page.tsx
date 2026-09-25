import type { Metadata } from 'next'
import papers from '@/mocks/papers.json'
import type { PaperFull } from '@/lib/types'
import { ArticleView } from '@/views/ArticleView'

const CATALOG = papers as PaperFull[]

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const paper = CATALOG.find((p) => p.id === id)
  if (!paper) return { title: 'Artículo' }

  const description = paper.abstract.length > 200 ? `${paper.abstract.slice(0, 197)}…` : paper.abstract
  return {
    title: paper.title,
    description,
    openGraph: {
      type: 'article',
      title: paper.title,
      description,
      images: [{ url: '/brand/og-banner.jpg', width: 1376, height: 768, alt: 'PaperPay' }],
    },
    twitter: { card: 'summary_large_image', title: paper.title, description },
  }
}

export default async function PaperPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <ArticleView paperId={id} />
}
