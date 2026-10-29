import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KbqCodeBlockFile, KbqCodeBlockModule } from '@koobiq/components/code-block';
import { KBQ_WINDOW } from '@koobiq/components/core';

@Component({
    imports: [KbqCodeBlockModule],
    template: `
        <kbq-code-block [files]="files" />
    `,
    changeDetection: ChangeDetectionStrategy.Default
})
class LinkedFile {
    files: KbqCodeBlockFile[] = [{ content: 'koobiq', filename: 'a.ts', link: 'https://example.com/' }];
}

const clickLinkButton = (element: HTMLElement): void =>
    element.querySelector<HTMLButtonElement>('.kbq-code-block__actionbar__link-button')!.click();

describe('triage: openLink', () => {
    it('DEFECT: opens the link with window.open(url, "_blank") and no noopener, so the new page keeps window.opener', () => {
        const fixture = TestBed.createComponent(LinkedFile);

        fixture.autoDetectChanges();

        const open = vi.spyOn(TestBed.inject(KBQ_WINDOW), 'open').mockReturnValue(null);

        clickLinkButton(fixture.nativeElement);

        expect(open).toHaveBeenCalledTimes(1);
        // Exactly two arguments: no `windowFeatures` with `noopener` / `noreferrer`.
        expect(open.mock.calls[0]).toEqual(['https://example.com/', '_blank']);
    });

    it('DEFECT: a link the sanitizer rejects is still opened, prefixed with "unsafe:"', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const fixture = TestBed.createComponent(LinkedFile);

        fixture.componentInstance.files = [{ content: 'koobiq', filename: 'a.ts', link: 'javascript:alert(1)' }];
        fixture.autoDetectChanges();

        const open = vi.spyOn(TestBed.inject(KBQ_WINDOW), 'open').mockReturnValue(null);

        clickLinkButton(fixture.nativeElement);

        expect(warn).toHaveBeenCalledWith(expect.stringContaining('sanitizing unsafe URL value'));
        expect(open).toHaveBeenCalledWith('unsafe:javascript:alert(1)', '_blank');
    });
});
