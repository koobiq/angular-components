import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTagsModule } from '@koobiq/components/tags';

@Component({
    standalone: true,
    imports: [KbqTagsModule, KbqIconModule],
    selector: 'dev-tag-state-and-style',
    host: {
        'data-testid': 'e2eTagStateAndStyle'
    },
    template: `
        <table data-testid="e2eScreenshotTarget">
            <tbody>
                @for (color of colors; track color) {
                    <tr>
                        @for (state of states; track state) {
                            <td>
                                @for (type of types; track type) {
                                    <kbq-tag
                                        [selected]="type === 'selected'"
                                        [color]="color"
                                        [class.kbq-hovered]="state === 'hovered'"
                                        [class.kbq-focused]="state === 'focused'"
                                        [disabled]="state === 'disabled'"
                                    >
                                        <i kbq-icon="kbq-check-circle_16"></i>
                                        Tag
                                        <i kbqTagRemove kbq-icon-button="kbq-xmark-s_16"></i>
                                    </kbq-tag>
                                }
                            </td>
                        }
                    </tr>
                }
            </tbody>
        </table>
    `,
    styles: `
        td {
            padding: var(--kbq-size-xs);
            width: 1px;
        }

        .kbq-tag:first-of-type {
            margin-bottom: var(--kbq-size-xs);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevTagStateAndStyle {
    readonly states = ['normal', 'hovered', 'focused', 'disabled'] as const;
    readonly colors = [
        KbqComponentColors.Theme,
        KbqComponentColors.ContrastFade,
        KbqComponentColors.Error,
        KbqComponentColors.Warning
    ];
    readonly types = ['default', 'selected'] as const;
}
