import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIcon, KbqIconButton, KbqIconItem } from '@koobiq/components/icon';

type IconStates = {
    color: KbqComponentColors;
};

type IconItemStates = IconStates & {
    fade?: boolean;
    big?: boolean;
};

type IconButtonStates = IconStates & {
    color: KbqComponentColors;
    disabled?: boolean;
    small?: boolean;
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
                                    [big]="cell.big ?? false"
                                    [fade]="cell.fade ?? false"
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
                                    [small]="cell.small ?? false"
                                    [disabled]="cell.disabled ?? false"
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
    protected readonly colors = Array.from(new Set(Object.values(KbqComponentColors)).values());

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
            big: true
        })),

        this.colors.map((color) => ({
            color,
            fade: true
        }))

    ];

    iconButtonStates: IconButtonStates[][] = [
        this.colors.map((color) => ({
            color
        })),

        this.colors.map((color) => ({
            color,
            small: true
        }))

    ];
}
