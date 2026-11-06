import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KbqMarkdown, KbqMarkdownModule } from '@koobiq/components/markdown';

@Component({
    selector: 'standalone-markdown',
    imports: [KbqMarkdown],
    template: `
        <kbq-markdown markdownText="# Title" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class StandaloneMarkdown {}

@Component({
    selector: 'module-markdown',
    imports: [KbqMarkdownModule],
    template: `
        <kbq-markdown markdownText="# Title" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class ModuleMarkdown {}

describe('triage: KbqMarkdown imported on its own', () => {
    it('DEFECT: the standalone component cannot be created without KbqMarkdownModule (no provider for KbqMarkdownService)', () => {
        TestBed.configureTestingModule({ imports: [StandaloneMarkdown] });

        expect(() => {
            const fixture = TestBed.createComponent(StandaloneMarkdown);

            fixture.detectChanges();
        }).toThrow(/KbqMarkdownService/);
    });

    it('control: the same template renders when the module is imported', async () => {
        TestBed.configureTestingModule({ imports: [ModuleMarkdown] });
        const fixture = TestBed.createComponent(ModuleMarkdown);

        fixture.detectChanges();
        await fixture.whenStable();

        expect(fixture.nativeElement.querySelector('.kbq-markdown__h1')?.textContent).toBe('Title');
    });
});
