import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KbqCodeBlockFile, KbqCodeBlockModule } from '@koobiq/components/code-block';

@Component({
    imports: [KbqCodeBlockModule],
    template: `
        <kbq-code-block [files]="files" [maxHeight]="maxHeight" />
    `,
    changeDetection: ChangeDetectionStrategy.Default
})
class WideCode {
    maxHeight: number | undefined = undefined;
    readonly files: KbqCodeBlockFile[] = [
        { filename: 'wide.ts', language: 'typescript', content: `const wide = '${'x'.repeat(400)}';` }
    ];
}

describe('triage: maxHeight and a horizontally scrolling code area', () => {
    it('DEFECT: with maxHeight set and code that fits vertically, the horizontally scrolling code area keeps tabIndex -1', () => {
        const fixture = TestBed.createComponent(WideCode);

        fixture.autoDetectChanges();

        const host: HTMLElement = fixture.nativeElement.querySelector('kbq-code-block');
        const main: HTMLElement = host.querySelector('.kbq-code-block__main')!;
        const pre: HTMLElement = host.querySelector('.kbq-code-block__pre')!;

        // One line: it fits under any max height, but overflows the width.
        Object.defineProperty(pre, 'offsetHeight', { get: () => 20, configurable: true });
        Object.defineProperties(main, {
            scrollWidth: { value: 3000 },
            clientWidth: { value: 300 },
            scrollHeight: { value: 20 },
            clientHeight: { value: 20 }
        });
        fixture.detectChanges();

        // Control: without a max height the same overflow gets a tab stop.
        expect(main.tabIndex).toBe(0);

        fixture.componentInstance.maxHeight = 200;
        fixture.detectChanges();

        // No "Show all" button, so `:not(:has(.kbq-code-block__view-all)) .kbq-code-block__main { overflow: auto }`
        // applies and the code area still scrolls sideways...
        expect(host.querySelector('.kbq-code-block__view-all__button')).toBeNull();
        expect(main.style.maxHeight).toBe('200px');
        // ...but the keyboard can no longer reach it.
        expect(main.tabIndex).toBe(-1);
    });
});
