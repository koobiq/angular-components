import { FocusMonitor } from '@angular/cdk/a11y';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KbqCodeBlockFile, KbqCodeBlockModule } from '@koobiq/components/code-block';

const HOVER_DEBOUNCE_TIME = 100;

@Component({
    imports: [KbqCodeBlockModule],
    template: `
        <kbq-code-block [files]="files" />
    `,
    changeDetection: ChangeDetectionStrategy.Default
})
class SingleUnnamedFile {
    readonly files: KbqCodeBlockFile[] = [{ language: 'typescript', content: 'const value = 1;' }];
}

describe('triage: action bar of a block with hidden tabs', () => {
    afterEach(() => vi.useRealTimers());

    it('DEFECT: keyboard focus inside the block never reveals the action bar that is display:none without hover', async () => {
        vi.useFakeTimers();

        const fixture = TestBed.createComponent(SingleUnnamedFile);

        fixture.autoDetectChanges();

        const host: HTMLElement = fixture.nativeElement.querySelector('kbq-code-block');
        const main: HTMLElement = host.querySelector('.kbq-code-block__main')!;
        const copyButton: HTMLButtonElement = host.querySelector('.kbq-code-block__actionbar__copy-button')!;

        // A single unnamed file hides the tabs, which turns the bar into the floating one hidden by
        // `.kbq-code-block_hide-tabs .kbq-code-block__actionbar { display: none }` until `_show-actionbar`.
        expect(host.classList).toContain('kbq-code-block_hide-tabs');
        expect(host.classList).not.toContain('kbq-code-block_show-actionbar');
        expect(copyButton).toBeInstanceOf(HTMLButtonElement);

        // Overflowing code makes the code area the block's one tab stop.
        Object.defineProperties(main, { scrollWidth: { value: 800 }, clientWidth: { value: 300 } });
        fixture.detectChanges();
        expect(main.tabIndex).toBe(0);

        TestBed.inject(FocusMonitor).focusVia(main, 'keyboard');
        await vi.advanceTimersByTimeAsync(HOVER_DEBOUNCE_TIME * 2);
        fixture.detectChanges();

        expect(document.activeElement).toBe(main);
        expect(host.classList).not.toContain('kbq-code-block_show-actionbar');

        // Even focus on the copy button itself, which a browser would refuse while it is display:none,
        // does not reveal the bar: only `mouseenter` / `mouseleave` and `:hover` are tracked.
        TestBed.inject(FocusMonitor).focusVia(copyButton, 'keyboard');
        await vi.advanceTimersByTimeAsync(HOVER_DEBOUNCE_TIME * 2);
        fixture.detectChanges();

        expect(host.classList).not.toContain('kbq-code-block_show-actionbar');
    });
});
