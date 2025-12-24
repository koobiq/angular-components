import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqComponentColors, KbqDefaultSizes, ThemePalette } from '@koobiq/components/core';
import { KbqHint } from '@koobiq/components/form-field';
import { KbqRadioButton, KbqRadioGroup } from './radio.component';

type RadioStates = {
    size: Omit<KbqDefaultSizes, 'compact'>;
    labelPosition: 'before' | 'after';
    hint?: boolean;
    disabled?: boolean;
    color?: ThemePalette;
    hovered?: boolean;
};

@Component({
    selector: 'e2e-radio-state-and-style',
    imports: [
        KbqHint,
        KbqRadioButton,
        KbqRadioGroup
    ],
    template: `
        <div>
            <table data-testid="e2eRadioTable">
                @for (state of states; track $index) {
                    <tr>
                        @for (cell of state; track $index) {
                            <td>
                                <kbq-radio-group [big]="cell.size === 'big'" [disabled]="cell.disabled">
                                    @for (option of [0, 1]; track option) {
                                        <kbq-radio-button
                                            [class.kbq-hovered]="cell.hovered ?? false"
                                            [checked]="$first"
                                            [value]="$index"
                                            [labelPosition]="cell.labelPosition"
                                            [color]="cell.color ?? kbqComponentColors.Empty"
                                            [disabled]="cell.disabled"
                                        >
                                            Option #{{ $index }}
                                            @if (cell.hint) {
                                                <kbq-hint>Hint #{{ $index }}</kbq-hint>
                                            }
                                        </kbq-radio-button>
                                    }
                                </kbq-radio-group>
                            </td>
                        }
                    </tr>
                }
            </table>
        </div>
    `,
    styles: `
        :host {
            td {
                vertical-align: top;
                padding: 4px;
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-margin-top-l layout-margin-bottom-l layout-column',
        'data-testid': 'e2eRadioStateAndStyle'
    }
})
export class E2eRadioStateAndStyle {
    protected readonly themePalette = ThemePalette;

    protected readonly states: RadioStates[][] = [
        [
            { size: 'normal', labelPosition: 'after' },
            { size: 'big', labelPosition: 'after' },
            { size: 'normal', labelPosition: 'after', color: ThemePalette.Error }
        ],
        [
            { size: 'normal', labelPosition: 'after', hovered: true },
            { size: 'big', labelPosition: 'after', hovered: true },
            { size: 'normal', labelPosition: 'after', color: ThemePalette.Error, hovered: true }
        ],
        [
            { size: 'normal', hint: true, labelPosition: 'after' },
            { size: 'big', hint: true, labelPosition: 'after' },
            { size: 'normal', hint: true, labelPosition: 'after', color: ThemePalette.Error }
        ],
        [
            { size: 'normal', hint: true, labelPosition: 'before' },
            { size: 'big', hint: true, labelPosition: 'before' },
            { size: 'normal', hint: true, labelPosition: 'before', color: ThemePalette.Error }
        ],
        [
            { size: 'normal', hint: true, labelPosition: 'after', disabled: true },
            { size: 'big', hint: true, labelPosition: 'after', disabled: true },
            { size: 'normal', hint: true, labelPosition: 'after', color: ThemePalette.Error, disabled: true }
        ]

    ];
    protected readonly kbqComponentColors = KbqComponentColors;
}
