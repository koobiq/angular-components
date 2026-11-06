import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DocsNextSiteState } from '../services/site-state';

/**
 * Stands where the blocks of a page will be while they load: grey bars the shape of paragraphs and a block of code. The
 * title of the page above is the real one, so nothing under it moves when the content arrives. It appears a moment late,
 * so a fast load does not flash it.
 */
@Component({
    selector: 'docs-next-content-skeleton',
    template: `
        <span class="docs-next-skeleton__status" role="status">{{ state.t('loading') }}</span>
        @for (lines of paragraphs; track $index) {
            <div class="docs-next-skeleton__paragraph" aria-hidden="true">
                @for (width of lines; track $index) {
                    <div class="docs-next-skeleton__line" [style.width.%]="width"></div>
                }
            </div>
        }
        <div class="docs-next-skeleton__code" aria-hidden="true"></div>
    `,
    styleUrl: './content-skeleton.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocsNextContentSkeleton {
    protected readonly state = inject(DocsNextSiteState);

    /** Widths of the lines of each paragraph, in percent. */
    protected readonly paragraphs = [
        [100, 96, 62],
        [100, 88, 94, 40]
    ];
}
