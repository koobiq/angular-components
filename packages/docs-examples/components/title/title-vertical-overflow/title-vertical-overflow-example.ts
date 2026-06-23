import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqTitleModule } from '@koobiq/components/title';

/**
 * @title Multiline text
 */
@Component({
    selector: 'title-vertical-overflow-example',
    imports: [KbqTitleModule],
    template: `
        <div class="example-title-vertical-overflow kbq-text-normal" kbq-title>
            {{ longValue }}
        </div>
    `,
    styleUrls: ['./title-vertical-overflow-example.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TitleVerticalOverflowExample {
    longValue =
        'A long multiline text clamped to two lines. When it does not fit into the allotted lines, the title directive shows a tooltip with the full content.';
}
