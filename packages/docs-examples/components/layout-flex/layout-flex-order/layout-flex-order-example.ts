import { Component } from '@angular/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqSelectModule } from '@koobiq/components/select';

/**
 * @title Layout-flex order
 */
@Component({
    standalone: true,
    selector: 'layout-flex-order-example',
    styleUrl: 'layout-flex-order-example.css',
    imports: [KbqSelectModule, KbqFormFieldModule],
    template: `
        <br />
        <br />

        <div class="docs-layout-flex-order">
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

            <br />
            <br />

            <div class="layout-row block">
                <div class="flex block {{ selectedFirstBlockOrder }}">Block 1</div>
                <div class="flex block {{ selectedSecondBlockOrder }}">Block 2</div>
                <div class="flex block {{ selectedThirdBlockOrder }}">Block 3</div>
            </div>
        </div>
    `
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
