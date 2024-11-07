import { Component } from '@angular/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqSelectModule } from '@koobiq/components/select';

/**
 * @title Layout-flex offsets
 */
@Component({
    standalone: true,
    selector: 'layout-flex-offsets-example',
    styleUrl: 'layout-flex-offsets-example.css',
    imports: [KbqSelectModule, KbqFormFieldModule],
    template: `
        <div class="docs-layout-flex-offsets layout-margin-top-4xl">
            <div class="example-controls">
                <kbq-form-field>
                    <kbq-select [(value)]="selectedSize">
                        @for (flexSize of flexSizes; track flexSize) {
                            <kbq-option [value]="flexSize">
                                {{ flexSize }}
                            </kbq-option>
                        }
                    </kbq-select>
                </kbq-form-field>

                <kbq-form-field>
                    <kbq-select [(value)]="selectedOffset">
                        @for (flexOffset of flexOffsets; track flexOffset) {
                            <kbq-option [value]="flexOffset">
                                {{ flexOffset }}
                            </kbq-option>
                        }
                    </kbq-select>
                </kbq-form-field>
            </div>
            <div class="layout-row block  layout-margin-top-4xl">
                <div class="{{ selectedSize }} {{ selectedOffset }} block">{{ selectedSize }} {{ selectedOffset }}</div>
                <div class="{{ selectedSize }} {{ selectedOffset }} block">{{ selectedSize }} {{ selectedOffset }}</div>
                <div class="{{ selectedSize }} {{ selectedOffset }} block">{{ selectedSize }} {{ selectedOffset }}</div>
            </div>
        </div>
    `
})
export class LayoutFlexOffsetsExample {
    selectedSize: string = 'flex-10';
    selectedOffset: string = 'flex-offset-10';

    flexSizes = [
        'flex-0',
        'flex-5',
        'flex-10',
        'flex-15',
        'flex-20',
        'flex-25',
        'flex-30',
        'flex-33',
        'flex-35',
        'flex-40',
        'flex-45',
        'flex-50',
        'flex-60',
        'flex-65',
        'flex-66',
        'flex-70',
        'flex-75',
        'flex-80',
        'flex-85',
        'flex-90',
        'flex-95',
        'flex-100'
    ];

    flexOffsets = [
        'flex-offset-0',
        'flex-offset-5',
        'flex-offset-10',
        'flex-offset-15',
        'flex-offset-20',
        'flex-offset-25',
        'flex-offset-30',
        'flex-offset-33',
        'flex-offset-35',
        'flex-offset-40',
        'flex-offset-45',
        'flex-offset-50',
        'flex-offset-60',
        'flex-offset-65',
        'flex-offset-66',
        'flex-offset-70',
        'flex-offset-75',
        'flex-offset-80',
        'flex-offset-85',
        'flex-offset-90',
        'flex-offset-95',
        'flex-offset-100'
    ];
}
