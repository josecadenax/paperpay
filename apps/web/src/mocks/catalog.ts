import type { PaperFull } from '@/lib/types'
import papers from './papers.json'

// Copia de apps/api/data/papers.json para el modo mock (sin backend).
export const MOCK_PAPERS: PaperFull[] = papers as PaperFull[]
