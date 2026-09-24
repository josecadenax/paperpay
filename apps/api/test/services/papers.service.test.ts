import { describe, it, expect } from 'vitest';
import { papersService } from '../../src/services/papers.service';

describe('PapersService', () => {
  it('should load all papers in the catalog', () => {
    const previews = papersService.getAllPreviews();
    expect(previews.length).toBeGreaterThanOrEqual(3);

    const first = previews[0];
    expect(first.id).toBeDefined();
    expect(first.title).toBeDefined();
    expect(first.priceUsdc).toBe(0.50);
    expect(first.previewSnippet).toBeDefined();

    // Verify preview does NOT contain full content
    expect((first as unknown as { fullContentMarkdown?: string }).fullContentMarkdown).toBeUndefined();
  });

  it('should return full paper by valid ID', () => {
    const paper = papersService.getPaperById('autonomous-ai-micropayments');
    expect(paper).not.toBeNull();
    expect(paper?.id).toBe('autonomous-ai-micropayments');
    expect(paper?.fullContentMarkdown).toBeDefined();
    expect(paper?.fullContentMarkdown.length).toBeGreaterThan(100);
    expect(paper?.references).toBeInstanceOf(Array);
  });

  it('should return null for non-existent paper ID', () => {
    const paper = papersService.getPaperById('non-existent-paper-id-xyz');
    expect(paper).toBeNull();
  });

  it('should return preview by valid ID', () => {
    const preview = papersService.getPaperPreviewById('crispr-nanomedicine-biotech');
    expect(preview).not.toBeNull();
    expect(preview?.id).toBe('crispr-nanomedicine-biotech');
    expect((preview as unknown as { fullContentMarkdown?: string }).fullContentMarkdown).toBeUndefined();
  });

  it('should return null preview for non-existent paper ID', () => {
    const preview = papersService.getPaperPreviewById('non-existent-paper-id-xyz');
    expect(preview).toBeNull();
  });
});
