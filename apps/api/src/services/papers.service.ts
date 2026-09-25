import fs from 'fs';
import path from 'path';
import { PaperFull, PaperPreview } from '@paperpay/shared';

export class PapersService {
  private papers: Map<string, PaperFull> = new Map();

  constructor() {
    this.loadCatalog();
  }

  private loadCatalog(): void {
    const catalogPath = path.resolve(__dirname, '../../data/papers.json');
    if (!fs.existsSync(catalogPath)) {
      console.warn(`[PapersService] Warning: Catalog file not found at ${catalogPath}`);
      return;
    }

    try {
      const rawData = fs.readFileSync(catalogPath, 'utf-8');
      const papersList: PaperFull[] = JSON.parse(rawData);
      for (const paper of papersList) {
        this.papers.set(paper.id, paper);
      }
      console.log(`[PapersService] Loaded ${this.papers.size} papers from catalog.`);
    } catch (err) {
      console.error('[PapersService] Error loading papers catalog:', err);
    }
  }

  public getAllPreviews(): PaperPreview[] {
    return Array.from(this.papers.values()).map(this.toPreview);
  }

  public getPaperById(id: string): PaperFull | null {
    return this.papers.get(id) || null;
  }

  public getPaperPreviewById(id: string): PaperPreview | null {
    const paper = this.papers.get(id);
    return paper ? this.toPreview(paper) : null;
  }

  private toPreview(paper: PaperFull): PaperPreview {
    return {
      id: paper.id,
      title: paper.title,
      authors: paper.authors,
      abstract: paper.abstract,
      publishedDate: paper.publishedDate,
      publisher: paper.publisher,
      doi: paper.doi,
      priceUsdc: paper.priceUsdc,
      previewSnippet: paper.previewSnippet,
      discipline: paper.discipline,
    };
  }
}

export const papersService = new PapersService();
