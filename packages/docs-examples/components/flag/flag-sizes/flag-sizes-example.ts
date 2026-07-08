import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqFlag } from '@koobiq/components/flag';
import { FlagSrcPipe } from '../flag-string.pipe';

type FlagSizeItem = {
    width: number;
    height: number;
    /** Typography level (see `_typography.scss`) the size is meant to sit next to. */
    typography: string;
    label: string;
};

/**
 * @title Integer flag sizes
 */
@Component({
    selector: 'flag-sizes-example',
    imports: [KbqFlag, FlagSrcPipe],
    template: `
        @for (item of sizes; track $index) {
            <div class="layout-row layout-align-start-center layout-gap-s" style="width: 200px">
                <kbq-flag decorative [style.width.px]="item.width" [style.height.px]="item.height">
                    <img alt="" [src]="'AD' | flagSrc" />
                </kbq-flag>
                <span [class]="item.typography">{{ item.label }} {{ item.width }}×{{ item.height }}</span>
            </div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-column layout-align-center-center layout-gap-m'
    }
})
export class FlagSizesExample {
    // Dimensions are multiples of a pixel so the flag edges stay crisp, and match the typography
    // level each size is meant to sit next to.
    protected readonly sizes: FlagSizeItem[] = [
        { width: 24, height: 16, typography: 'kbq-subheading', label: 'Subheading' },
        { width: 21, height: 14, typography: 'kbq-subheading', label: 'Subheading' },
        { width: 18, height: 12, typography: 'kbq-text-normal', label: 'Text Normal' },
        { width: 15, height: 10, typography: 'kbq-text-normal', label: 'Text Normal' },
        { width: 15, height: 10, typography: 'kbq-text-compact', label: 'Text Compact' },
        { width: 12, height: 8, typography: 'kbq-text-compact', label: 'Text Compact' }
    ];
}
