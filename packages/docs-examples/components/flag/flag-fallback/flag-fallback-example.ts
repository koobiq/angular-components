import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqFlag, KbqFlagShadow } from '@koobiq/components/flag';
import { hasFlag } from 'country-flag-icons';
import { FlagSvgPipe } from '../flag-string.pipe';

type FallbackCountry = { code: string; name: string; custom?: string; shadow?: KbqFlagShadow };

/**
 * @title Fallback for a missing flag
 */
@Component({
    selector: 'flag-fallback-example',
    imports: [KbqFlag, FlagSvgPipe],
    template: `
        @for (country of countries; track country.name) {
            <span>
                <kbq-flag decorative [isEmpty]="isEmpty(country)" [shadow]="country.shadow ?? 'inset'">
                    @if (hasFlag(country.code)) {
                        <span class="layout-fill layout-row" [innerHTML]="country.code | flagSvg"></span>
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
    // `hasFlag` from country-flag-icons tells whether a flag exists for the given code.
    protected readonly hasFlag = hasFlag;

    // "GND", "KRK" and "WA" are not real ISO codes. Gondor projects a custom glyph, the rest render
    // a neutral placeholder.
    protected readonly countries: FallbackCountry[] = [
        { code: 'AL', name: 'Albania' },
        { code: 'GND', name: 'Gondor', custom: '🏇', shadow: 'none' },
        { code: 'KRK', name: 'Krakozhia' },
        { code: 'PE', name: 'Peru' },
        { code: 'WA', name: 'Wakanda' }
    ];

    protected isEmpty(country: FallbackCountry): boolean {
        return !hasFlag(country.code) && !country.custom;
    }
}
