import type { PaperFull } from '@/lib/types'
import papers from './papers.json'

// Copia de apps/api/data/papers.json para trabajar sin backend.
// Se elimina cuando services/paperpay.ts llame al API real.
const DISCIPLINES: Record<string, string> = {
  'autonomous-ai-micropayments': 'Informática',
  'quantum-cryptography-post-quantum': 'Criptografía',
  'crispr-nanomedicine-biotech': 'Biomedicina',
}

export const MOCK_PAPERS: PaperFull[] = (papers as PaperFull[]).map((paper) => ({
  ...paper,
  discipline: DISCIPLINES[paper.id],
}))
