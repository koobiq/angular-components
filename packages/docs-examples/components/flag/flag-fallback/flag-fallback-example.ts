import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqFlag } from '@koobiq/components/flag';
import { FlagSrcPipe } from '../flag-string.pipe';

/**
 * @title Fallback for a missing flag
 */
@Component({
    selector: 'flag-fallback-example',
    imports: [KbqFlag, FlagSrcPipe],
    template: `
        <div class="example-flag-list">
            @for (country of countries; track country.name) {
                @let src = country.code | flagSrc;
                <span>
                    <kbq-flag decorative [class.kbq-flag_empty]="!src">
                        @if (src) {
                            <img alt="" [src]="src" />
                        }
                    </kbq-flag>
                    {{ country.name }}
                </span>
            }
        </div>
    `,
    styles: `
        .example-flag-list {
            display: flex;
            flex-direction: column;
            gap: var(--kbq-size-s);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlagFallbackExample {
    // "GND" and "WA" are not real ISO codes — they render a neutral placeholder.
    protected readonly countries = [
        { code: 'AL', name: 'Albania' },
        { code: 'GND', name: 'Gondor' },
        { code: 'PE', name: 'Peru' },
        { code: 'WA', name: 'Wakanda' }
    ];
}
