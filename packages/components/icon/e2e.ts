import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIcon, KbqIconButton, KbqIconItem } from '@koobiq/components/icon';

type IconStates = {
    color: KbqComponentColors;
};

type IconItemStates = IconStates & {
    state?: 'big' | 'fade';
};

type IconButtonStates = IconStates & {
    state: 'disabled' | 'small' | 'focused' | 'hover';
};

@Component({
    selector: 'e2e-icon-state-and-style',
    imports: [
        KbqIconButton,
        KbqIconItem,
        KbqIcon
    ],
    template: `
        <div>
            <table data-testid="e2eIconTable">
                @for (row of iconStates; track $index) {
                    <tr>
                        @for (cell of row; track $index) {
                            <td>
                                <i kbq-icon="kbq-chevron-down-s_16" [color]="cell.color"></i>
                            </td>
                        }
                    </tr>
                }

                @for (row of iconItemStates; track $index) {
                    <tr>
                        @for (cell of row; track $index) {
                            <td>
                                <i
                                    kbq-icon-item="kbq-chevron-down-s_16"
                                    [color]="cell.color"
                                    [big]="cell.state === 'big'"
                                    [fade]="cell.state === 'fade'"
                                ></i>
                            </td>
                        }
                    </tr>
                }

                @for (row of iconButtonStates; track $index) {
                    <tr class="e2e-icon-button-row">
                        @for (cell of row; track $index) {
                            <td>
                                <i
                                    kbq-icon-button="kbq-chevron-down-s_16"
                                    [color]="cell.color"
                                    [small]="cell.state === 'small'"
                                    [disabled]="cell.state === 'disabled'"
                                    [class.kbq-hovered]="cell.state === 'hover'"
                                    [class.cdk-keyboard-focused]="cell.state === 'focused'"
                                ></i>
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
                width: 50px;
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-margin-top-l layout-margin-bottom-l layout-column',
        'data-testid': 'e2eIconStateAndStyle'
    }
})
export class E2eIconStateAndStyle {
    protected readonly colors: KbqComponentColors[] = Array.from(
        new Set(Object.values(KbqComponentColors)).values()
    ).filter((color) => color !== KbqComponentColors.ThemeFade);

    iconStates: IconStates[][] = [
        this.colors.map((color) => ({
            color
        }))
    ];

    iconItemStates: IconItemStates[][] = [
        this.colors.map((color) => ({
            color
        })),

        this.colors.map((color) => ({
            color,
            state: 'big'
        })),

        this.colors.map((color) => ({
            color,
            state: 'fade'
        }))
    ];

    iconButtonStates: IconButtonStates[][] = [
        this.colors.map((color) => ({
            color,
            state: 'hover'
        })),

        this.colors.map((color) => ({
            color,
            state: 'small'
        })),

        this.colors.map((color) => ({
            color,
            state: 'disabled'
        })),

        this.colors.map((color) => ({
            color,
            state: 'focused'
        }))
    ];
}
