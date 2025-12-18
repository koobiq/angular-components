import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqToggleModule } from '@koobiq/components/toggle';

@Component({
    selector: 'e2e-toggle-state-and-style',
    imports: [KbqToggleModule, FormsModule],
    template: `
        <input type="checkbox" data-testid="e2eIndeterminateToggle" [(ngModel)]="indeterminate" />
        <input type="checkbox" data-testid="e2eBigToggle" [(ngModel)]="big" />

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
                                            [indeterminate]="indeterminate()"
                                            [class.kbq-hovered]="state === 'hovered'"
                                            [class.cdk-keyboard-focused]="state === 'focused'"
                                            [checked]="type === 'checked'"
                                            [loading]="state === 'loading'"
                                            [big]="big()"
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
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eToggleStateAndStyle'
    }
})
export class E2eToggleStateAndStyle {
    readonly states = ['normal', 'hovered', 'focused', 'disabled', 'loading'] as const;
    readonly colors = [KbqComponentColors.Theme, KbqComponentColors.Error];
    readonly types = ['default', 'checked'] as const;

    readonly indeterminate = model(false);
    readonly big = model(false);
}

@Component({
    selector: 'e2e-toggle-with-text-and-caption',
    imports: [KbqToggleModule, KbqFormFieldModule, FormsModule],
    template: `
        <input type="checkbox" data-testid="e2eBigToggle" [(ngModel)]="big" />

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
                                        [big]="big()"
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
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eToggleWithTextAndCaption'
    }
})
export class E2eToggleWithTextAndCaption {
    readonly states = ['normal', 'disabled'] as const;
    readonly positions = ['left', 'right'] as const;

    readonly big = model(false);
}
