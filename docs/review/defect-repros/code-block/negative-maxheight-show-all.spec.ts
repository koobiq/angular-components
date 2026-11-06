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
class NegativeMaxHeight {
    maxHeight: number | undefined = undefined;
    readonly files: KbqCodeBlockFile[] = [
        { filename: 'a.ts', language: 'typescript', content: 'const a = 1;\nconst b = 2;\nconst c = 3;' }
    ];
}

describe('triage: negative maxHeight', () => {
    it('DEFECT: a negative maxHeight sets no limit, yet "Show all" appears over code that is not clipped', () => {
        const fixture = TestBed.createComponent(NegativeMaxHeight);

        fixture.autoDetectChanges();

        const host: HTMLElement = fixture.nativeElement.querySelector('kbq-code-block');
        const main: HTMLElement = host.querySelector('.kbq-code-block__main')!;
        const pre: HTMLElement = host.querySelector('.kbq-code-block__pre')!;

        Object.defineProperty(pre, 'offsetHeight', { get: () => 60, configurable: true });

        fixture.componentInstance.maxHeight = -1;
        fixture.detectChanges();

        // `calculatedMaxHeight` ignores anything not above zero: no limit is applied...
        expect(main.style.maxHeight).toBe('');
        // ...but `measureContentOverflow` only checks `!!maxHeight`, and 60 > -1.
        expect(host.querySelector('.kbq-code-block__view-all__button')).toBeInstanceOf(HTMLButtonElement);
    });
});
