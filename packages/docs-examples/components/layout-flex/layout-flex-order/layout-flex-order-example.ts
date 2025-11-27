import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqSelectModule } from '@koobiq/components/select';

/**
 * @title Layout-flex order
 */
@Component({
    selector: 'layout-flex-order-example',
    imports: [KbqSelectModule, KbqFormFieldModule],
    template: `
        <div class="example-layout-flex-order layout-margin-top-4xl">
            <div class="example-controls">
                <div class="layout-column flex">
                    <label class="layout-padding">'Block 1'</label>
                    <kbq-form-field>
                        <kbq-select [(value)]="selectedFirstBlockOrder">
                            @for (flexOrder of flexOrders; track flexOrder) {
                                <kbq-option [value]="flexOrder">
                                    {{ flexOrder }}
                                </kbq-option>
                            }
                        </kbq-select>
                    </kbq-form-field>
                </div>

                <div class="layout-column flex">
                    <label class="layout-padding">'Block 2'</label>
                    <kbq-form-field>
                        <kbq-select [(value)]="selectedSecondBlockOrder">
                            @for (flexOrder of flexOrders; track flexOrder) {
                                <kbq-option [value]="flexOrder">
                                    {{ flexOrder }}
                                </kbq-option>
                            }
                        </kbq-select>
                    </kbq-form-field>
                </div>

                <div class="layout-column flex">
                    <label class="layout-padding">'Block 3'</label>
                    <kbq-form-field>
                        <kbq-select [(value)]="selectedThirdBlockOrder">
                            @for (flexOrder of flexOrders; track flexOrder) {
                                <kbq-option [value]="flexOrder">
                                    {{ flexOrder }}
                                </kbq-option>
                            }
                        </kbq-select>
                    </kbq-form-field>
                </div>
            </div>
            <div class="layout-row example-block layout-margin-top-4xl">
                <div class="flex example-block {{ selectedFirstBlockOrder }}">Block 1</div>
                <div class="flex example-block {{ selectedSecondBlockOrder }}">Block 2</div>
                <div class="flex example-block {{ selectedThirdBlockOrder }}">Block 3</div>
            </div>
        </div>
    `,
    styleUrls: ['layout-flex-order-example.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LayoutFlexOrderExample {
    selectedFirstBlockOrder: string = 'flex-order-0';
    selectedSecondBlockOrder: string = 'flex-order-1';
    selectedThirdBlockOrder: string = 'flex-order-2';

    flexOrders = [
        'flex-order-0',
        'flex-order-1',
        'flex-order-2',
        'flex-order-3',
        'flex-order-4',
        'flex-order-5',
        'flex-order-6',
        'flex-order-7',
        'flex-order-8',
        'flex-order-9'
    ];
}
