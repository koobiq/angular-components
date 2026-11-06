import { TestBed } from '@angular/core/testing';
import { KbqMarkdownService } from '@koobiq/components/markdown';
import { marked } from 'marked';

describe('triage: KbqMarkdownService and the marked options', () => {
    let service: KbqMarkdownService;

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [KbqMarkdownService] });

        service = TestBed.inject(KbqMarkdownService);
    });

    it('DEFECT: async: true in the options makes parseToHtml throw a TypeError instead of rendering', () => {
        expect(() => service.parseToHtml('# Title', { async: true })).toThrow(TypeError);
    });

    it('DEFECT: an option set on the global marked instance changes the output of the service', () => {
        expect(service.parseToHtml('first\nsecond')).not.toContain('<br');

        marked.setOptions({ breaks: true });

        try {
            expect(service.parseToHtml('first\nsecond')).toContain('<br');
        } finally {
            marked.setOptions({ breaks: false });
        }
    });
});
