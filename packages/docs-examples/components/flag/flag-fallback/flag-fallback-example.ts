import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { KbqFlag, KbqFlagShadow } from '@koobiq/components/flag';
import { hasFlag } from 'country-flag-icons';
import * as flags3x2 from 'country-flag-icons/string/3x2';

type FallbackCountry = { code: string; name: string; custom?: string; shadow?: KbqFlagShadow };

/**
 * @title Fallback for a missing flag
 */
@Component({
    selector: 'flag-fallback-example',
    imports: [KbqFlag],
    template: `
        @for (country of countries; track country.name) {
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
export class FlagFallbackExample {
    private readonly sanitizer = inject(DomSanitizer);

    // "GND", "KRK" and "WA" are not real ISO codes. `hasFlag` guards the lookup — Gondor projects a
    // custom glyph, the rest render a neutral placeholder.
    protected readonly countries = (
        [
            { code: 'AL', name: 'Albania' },
            { code: 'GND', name: 'Gondor', custom: '🏇', shadow: 'none' },
            { code: 'KRK', name: 'Krakozhia' },
            { code: 'PE', name: 'Peru' },
            { code: 'WA', name: 'Wakanda' }
        ] satisfies FallbackCountry[]
    ).map((country) => ({
        ...country,
        svg: hasFlag(country.code) ? this.sanitizer.bypassSecurityTrustHtml(flags3x2[country.code]) : null
    }));
}
