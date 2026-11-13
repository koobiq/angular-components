import {
    ChangeDetectionStrategy,
    Component,
    Directive,
    inject,
    Injector,
    input,
    OnInit,
    TemplateRef,
    ViewContainerRef
} from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KBQ_DROPDOWN_PANEL, KbqDropdown, KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

@Directive({
    selector: '[exampleDropdownOutlet]'
})
export class ExampleDropdownPortal implements OnInit {
    private viewContainerRef = inject(ViewContainerRef);

    readonly context = input({}, { alias: 'exampleDropdownOutletContext' });
    readonly template = input<TemplateRef<any>>(undefined!, { alias: 'exampleDropdownOutlet' });

    ngOnInit() {
        this.viewContainerRef.createEmbeddedView(this.template(), this.context(), {
            injector: Injector.create({
                parent: this.viewContainerRef.injector,
                // Provides a custom dependency:
                // - It binds `KBQ_DROPDOWN_PANEL` to the existing `KbqDropdown` instance,
                //   ensuring that any injected `KBQ_DROPDOWN_PANEL` token resolves to closest `KbqDropdown`.
                providers: [
                    { provide: KBQ_DROPDOWN_PANEL, useExisting: KbqDropdown }
                ]
            })
        });
    }
}

/**
 * @title Dropdown Recursive Template
 */
@Component({
    selector: 'dropdown-recursive-template-example',
    imports: [
        KbqDropdownModule,
        KbqButtonModule,
        KbqIconModule,
        ExampleDropdownPortal
    ],
    template: `
        <button kbq-button [kbqDropdownTriggerFor]="egDropdown">
            dropdown
            <i kbq-icon="kbq-chevron-down-s_16"></i>
        </button>

        <kbq-dropdown #egDropdown="kbqDropdown">
            @for (item of t().items; track item) {
                <ng-container
                    [exampleDropdownOutlet]="dropdownItemTpl"
                    [exampleDropdownOutletContext]="{ item: item }"
                />
            }

            <ng-template #dropdownItemTpl let-item="item">
                @if (item.children) {
                    <button kbq-dropdown-item [kbqDropdownTriggerFor]="egDropdownNested">
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
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DropdownRecursiveTemplateExample {
    protected readonly t = injectTranslation(TRANSLATIONS);
}
