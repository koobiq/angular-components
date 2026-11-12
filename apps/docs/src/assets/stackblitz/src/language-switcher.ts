import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { KBQ_LOCALE_SERVICE } from '@koobiq/components/core';

/** Language switcher mounted into the header of the generated project by `main.ts`. */
@Component({
    selector: 'docs-language-switcher',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <select
            [value]="localeService.localeId()"
            (change)="localeService.setLocale(($event.target as HTMLSelectElement).value)"
            aria-label="Examples language"
        >
            @for (item of localeService.locales.items; track item.id) {
                <option [value]="item.id">{{ item.name }}</option>
            }
        </select>
    `,
    styles: `
        :host {
            display: block;
        }

        select {
            height: 32px;
            padding: 0 var(--kbq-size-s);
            font: inherit;
            color: var(--kbq-foreground-contrast);
            background: var(--kbq-background-bg);
            border: var(--kbq-size-border-width) solid var(--kbq-line-contrast-less);
            border-radius: var(--kbq-size-m);
            cursor: pointer;
        }
    `
})
export class DocsLanguageSwitcher {
    protected readonly localeService = inject(KBQ_LOCALE_SERVICE);
}
