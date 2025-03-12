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
        { label: 'Level 1 - Security Settings' },
        {
            label: 'Level 1 - Encryption',
            children: [
                { label: 'Level 2 - SSL/TLS' },
                {
                    label: 'Level 2 - AES Encryption',
                    children: [
                        {
                            label: 'Level 3 - Key Management',
                            children: [
                                { label: 'Level 4 - Public Key Infrastructure (PKI)' },
                                { label: 'Level 4 - Symmetric Key Management' },
                                { label: 'Level 4 - Key Exchange Algorithms' }]
                        },
                        { label: 'Level 3 - Encryption Standards' }
                    ]
                },
                { label: 'Level 2 - Digital Signatures' }
            ]
        },
        {
            label: 'Level 1 - Access Control',
            children: [
                { label: 'Level 2 - Role-Based Access Control (RBAC)' },
                { label: 'Level 2 - Multi-Factor Authentication (MFA)' },
                { label: 'Level 2 - Least Privilege Principle' }]
        }
    ];
}
