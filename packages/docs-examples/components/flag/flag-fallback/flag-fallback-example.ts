import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { KbqFlag, KbqFlagShadow } from '@koobiq/components/flag';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { hasFlag } from 'country-flag-icons';
import * as flags3x2 from 'country-flag-icons/string/3x2';
import { ExampleTranslation, TRANSLATIONS } from './l10n';

/**
 * @title Fallback for a missing flag
 */
@Component({
    selector: 'flag-fallback-example',
    imports: [KbqFlag],
    template: `
        @for (country of countries(); track country.name) {
            <span>
                <kbq-flag decorative [empty]="!country.svg && !country.custom" [shadow]="country.shadow ?? 'inset'">
                    @if (country.svg) {
                        <span class="layout-fill layout-row" [innerHTML]="country.svg"></span>
                    } @else if (country.custom) {
                        <span class="layout-fill layout-row layout-align-center-center">
                            {{ country.custom }}
                        </span>
                    }
                </kbq-flag>
                {{ country.name }}
            </span>
        }
    `,
    styles: `
        .kbq-flag {
            height: 12px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-row layout-align-center-center layout-gap-l'
    }
})
export class FlagFallbackExample extends BaseLocalizedExample<ExampleTranslation> {
    private readonly sanitizer = inject(DomSanitizer);

    // "GND", "KRK" and "WA" are not real ISO codes. `hasFlag` guards the lookup — Gondor projects a
    // custom glyph, the rest render a neutral placeholder.
    private readonly countriesMeta = [
        { code: 'AL' },
        { code: 'GND', custom: '🏇', shadow: 'none' as KbqFlagShadow },
        { code: 'KRK' },
        { code: 'PE' },
        { code: 'WA' }
    ];

    protected readonly countries = computed(() =>
        this.countriesMeta.map((meta, index) => ({
            ...meta,
            name: this.t().fallbackCountries[index],
            svg: hasFlag(meta.code) ? this.sanitizer.bypassSecurityTrustHtml(flags3x2[meta.code]) : null
        }))
    );

    constructor() {
        super(TRANSLATIONS);
    }
}
