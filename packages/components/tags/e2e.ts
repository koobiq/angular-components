import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTagsModule } from './index';

@Component({
    selector: 'e2e-tag-state-and-style',
    imports: [KbqTagsModule, KbqIconModule],
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
                                        [class.cdk-keyboard-focused]="state === 'focused'"
                                        [disabled]="state === 'disabled'"
                                    >
                                        <i kbq-icon="kbq-circle-check_16"></i>
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
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eTagStateAndStyle'
    }
})
export class E2eTagStateAndStyle {
    readonly states = ['normal', 'hovered', 'focused', 'disabled'] as const;
    readonly colors = [
        KbqComponentColors.Theme,
        KbqComponentColors.ContrastFade,
        KbqComponentColors.Error,
        KbqComponentColors.Warning
    ];
    readonly types = ['default', 'selected'] as const;
}

@Component({
    selector: 'e2e-tag-editable',
    imports: [KbqTagsModule, KbqIconModule, FormsModule],
    template: `
        <kbq-tag editable>
            <i kbq-icon="kbq-circle-check_16"></i>
            {{ tag() }}
            <input kbqInput kbqTagEditInput [(ngModel)]="tag" />
            @if (tag().length > 0) {
                <i kbq-icon-button="kbq-check-s_16" kbqTagEditSubmit [color]="color.Theme"></i>
            } @else {
                <i kbq-icon-button="kbq-xmark-s_16" kbqTagEditSubmit [color]="color.Theme"></i>
            }
            <i kbqTagRemove kbq-icon-button="kbq-xmark-s_16"></i>
        </kbq-tag>
        <kbq-tag editable>
            <i kbq-icon="kbq-circle-check_16"></i>
            {{ tag() }}
            <input kbqInput kbqTagEditInput [(ngModel)]="tag" />
            @if (tag().length > 0) {
                <i kbq-icon-button="kbq-check-s_16" kbqTagEditSubmit [color]="color.Theme"></i>
            } @else {
                <i kbq-icon-button="kbq-xmark-s_16" kbqTagEditSubmit [color]="color.Theme"></i>
            }
            <i kbqTagRemove kbq-icon-button="kbq-xmark-s_16"></i>
        </kbq-tag>
    `,
    styles: `
        :host {
            display: inline-flex;
            flex-direction: column;
            gap: var(--kbq-size-xs);
            padding: var(--kbq-size-xs);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eTagEditable'
    }
})
export class E2eTagEditable {
    readonly tag = model('Editable tag');
    readonly color = KbqComponentColors;
}
