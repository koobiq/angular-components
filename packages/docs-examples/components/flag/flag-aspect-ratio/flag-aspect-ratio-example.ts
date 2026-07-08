import { CdkVirtualScrollViewport, ScrollingModule } from '@angular/cdk/scrolling';
import { ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { KbqVirtualOption } from '@koobiq/components/core';
import { KbqFlag } from '@koobiq/components/flag';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqSelectModule } from '@koobiq/components/select';
import { countries } from 'country-flag-icons';
import { FlagSrcPipe } from '../flag-string.pipe';

const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });

const getCountryName = (code: string): string => {
    try {
        return regionNames.of(code) ?? code;
    } catch {
        // Subdivision / special codes (e.g. GB-ENG, EU) aren't valid ISO regions for Intl.DisplayNames.
        return code;
    }
};

type Country = { code: string; name: string };

/**
 * @title Flags in a select
 */
@Component({
    selector: 'flag-aspect-ratio-example',
    imports: [ReactiveFormsModule, ScrollingModule, KbqFormFieldModule, KbqSelectModule, KbqFlag, FlagSrcPipe],
    template: `
        <kbq-form-field>
            <kbq-flag kbqPrefix decorative class="example-flag-prefix layout-margin-left-s layout-margin-right-s">
                <img alt="" [src]="control.value?.code ?? '' | flagSrc" />
            </kbq-flag>
            <kbq-select
                placeholder="Select a country"
                [formControl]="control"
                [compareWith]="compareWith"
                [virtualOptionFactory]="virtualOptionFactory"
                (openedChange)="openedChange($event)"
            >
                <cdk-virtual-scroll-viewport itemSize="32" minBufferPx="300" maxBufferPx="300">
                    <kbq-option *cdkVirtualFor="let country of countries" [value]="country">
                        <kbq-flag decorative class="example-flag-option">
                            <img alt="" [src]="country.code | flagSrc" />
                        </kbq-flag>
                        {{ country.name }}
                    </kbq-option>
                </cdk-virtual-scroll-viewport>
            </kbq-select>
        </kbq-form-field>
    `,
    styles: `
        .kbq-form-field {
            width: 320px;
            --kbq-form-field-size-addon-width: 18px;
        }

        /* Match the prefix flag to the flag shown inside the options (21×14). */
        .example-flag-prefix,
        .example-flag-option {
            height: 12px;
        }

        .example-flag-option {
            margin-right: var(--kbq-size-xs);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-row layout-align-center-center layout-padding-l'
    }
})
export class FlagAspectRatioExample {
    // Every flag exported from country-flag-icons, resolved to a country name for display.
    protected readonly countries: Country[] = countries
        .map((code) => ({ code, name: getCountryName(code) }))
        .sort((a, b) => a.name.localeCompare(b.name));

    protected readonly control = new FormControl<Country | null>(this.countries[0] ?? null);
    protected readonly viewport = viewChild.required(CdkVirtualScrollViewport);

    protected readonly compareWith = (a: Country | null, b: Country | null) => a?.code === b?.code;
    protected readonly virtualOptionFactory = (value: Country) => new KbqVirtualOption(value, false, value.name);

    protected openedChange(isOpened: boolean): void {
        if (!isOpened) return;

        const index = this.countries.findIndex((country) => country.code === this.control.value?.code);

        if (index >= 0) {
            this.viewport().scrollToIndex(index);
        }
    }
}
