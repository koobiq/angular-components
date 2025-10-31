import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqToggleModule } from '@koobiq/components/toggle';

@Component({
    standalone: true,
    imports: [KbqToggleModule],
    selector: 'dev-toggle-state-and-style',
    host: {
        'data-testid': 'e2eToggleStateAndStyle'
    },
    template: `
        <table data-testid="e2eScreenshotTarget">
            <tbody>
                @for (color of colors; track color) {
                    <tr>
                        @for (state of states; track state) {
                            <td>
                                <div>
                                    @for (type of types; track type) {
                                        <kbq-toggle
                                            [color]="color"
                                            [disabled]="state === 'disabled'"
                                            [indeterminate]="state === 'indeterminate'"
                                            [class.kbq-hovered]="state === 'hovered'"
                                            [class.cdk-keyboard-focused]="state === 'focused'"
                                            [checked]="type === 'checked'"
                                            [loading]="state === 'loading'"
                                        />
                                    }
                                </div>
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

        div {
            display: flex;
            flex-direction: column;
            gap: var(--kbq-size-xxs);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevToggleStateAndStyle {
    readonly states = ['normal', 'hovered', 'focused', 'disabled', 'indeterminate', 'loading'] as const;
    readonly colors = [KbqComponentColors.Theme, KbqComponentColors.Error];
    readonly types = ['default', 'checked'] as const;
}

@Component({
    standalone: true,
    imports: [KbqToggleModule, KbqFormFieldModule],
    selector: 'dev-toggle-with-text-and-caption',
    host: {
        'data-testid': 'e2eToggleWithTextAndCaption'
    },
    template: `
        <table data-testid="e2eScreenshotTarget">
            <tbody>
                @for (state of states; track state) {
                    <tr>
                        @for (position of positions; track position) {
                            <td>
                                <div>
                                    <kbq-toggle
                                        [disabled]="state === 'disabled'"
                                        [labelPosition]="position"
                                        [big]="state === 'big'"
                                    >
                                        Text
                                        <kbq-hint>Caption</kbq-hint>
                                    </kbq-toggle>
                                </div>
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

        div {
            display: flex;
            flex-direction: column;
            gap: var(--kbq-size-m);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevToggleWithTextAndCaption {
    readonly states = ['normal', 'disabled', 'big'] as const;
    readonly positions = ['left', 'right'] as const;
}
