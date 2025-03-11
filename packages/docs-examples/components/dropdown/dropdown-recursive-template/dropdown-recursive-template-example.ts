import { NgTemplateOutlet } from '@angular/common';
import { Component, Directive, Injector, Input, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KBQ_DROPDOWN_PANEL, KbqDropdown, KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';

type DropdownItem = {
    label: string;
    children?: DropdownItem[];
};

@Directive({
    standalone: true,
    selector: '[exampleDropdownOutlet]'
})
export class ExampleDropdownPortal implements OnInit {
    @Input('exampleDropdownOutletContext') context = {};
    @Input('exampleDropdownOutlet') template: TemplateRef<any>;

    constructor(private viewContainerRef: ViewContainerRef) {}

    ngOnInit() {
        this.viewContainerRef.createEmbeddedView(this.template, this.context, {
            injector: Injector.create({
                parent: this.viewContainerRef.injector,
                // Provides a custom dependency:
                // - It binds `KBQ_DROPDOWN_PANEL` to the existing `KbqDropdown` instance,
                //   ensuring that any injected `KBQ_DROPDOWN_PANEL` token resolves to closest `KbqDropdown`.
                providers: [
                    { provide: KBQ_DROPDOWN_PANEL, useExisting: KbqDropdown }]
            })
        });
    }
}

/**
 * @title Dropdown Recursive Template
 */
@Component({
    standalone: true,
    selector: 'dropdown-recursive-template-example',
    imports: [
        NgTemplateOutlet,
        KbqDropdownModule,
        KbqButtonModule,
        KbqIconModule,
        ExampleDropdownPortal
    ],
    template: `
        <button [kbqDropdownTriggerFor]="egDropdown" kbq-button>
            dropdown
            <i kbq-icon="kbq-chevron-down-s_16"></i>
        </button>

        <kbq-dropdown #egDropdown="kbqDropdown">
            @for (item of items; track item) {
                <ng-container
                    [exampleDropdownOutlet]="dropdownItemTpl"
                    [exampleDropdownOutletContext]="{ item: item }"
                />
            }

            <ng-template #dropdownItemTpl let-item="item">
                @if (item.children) {
                    <button [kbqDropdownTriggerFor]="egDropdownNested" kbq-dropdown-item>
                        {{ item.label }}
                    </button>

                    <kbq-dropdown #egDropdownNested="kbqDropdown">
                        @for (child of item.children; track child) {
                            <ng-container
                                [exampleDropdownOutlet]="dropdownItemTpl"
                                [exampleDropdownOutletContext]="{ item: child }"
                            />
                        }
                    </kbq-dropdown>
                } @else {
                    <button kbq-dropdown-item>{{ item.label }}</button>
                }
            </ng-template>
        </kbq-dropdown>
    `
})
export class DropdownRecursiveTemplateExample {
    items: DropdownItem[] = [
        { label: 'Search settings' },
        {
            label: 'Text',
            children: [
                { label: 'Border and shading' },
                {
                    label: 'Normal text',
                    children: [
                        { label: 'Apply', children: [
                                { label: 'Border and shading' },
                                { label: 'Normal text' },
                                { label: 'Title' }] },
                        { label: 'Update' }]
                },
                { label: 'Title' }
            ]
        },
        {
            label: 'Paragraph styles',
            children: [
                { label: 'Border and shading' },
                { label: 'Normal text' },
                { label: 'Title' }]
        }
    ];
}
