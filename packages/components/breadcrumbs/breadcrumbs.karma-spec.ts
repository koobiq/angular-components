import { Component, DebugElement, QueryList, Type, ViewChild, ViewChildren } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter, RouterLink } from '@angular/router';
import { dispatchEvent } from '@koobiq/cdk/testing';
import { KbqButtonDropdownTrigger, KbqButtonModule } from '@koobiq/components/button';
import { KbqDefaultSizes } from '@koobiq/components/core';
import { KbqDropdownModule, KbqDropdownTrigger } from '@koobiq/components/dropdown';
import { KbqOverflowItem } from '@koobiq/components/overflow-items';
import {
    KbqBreadcrumbButton,
    KbqBreadcrumbItem,
    KbqBreadcrumbs,
    kbqBreadcrumbsConfigurationProvider,
    KbqBreadcrumbsSeparator,
    KbqBreadcrumbView
} from './breadcrumbs';

const createComponent = <T>(component: Type<T>, providers: any[] = [], imports: any[] = []): ComponentFixture<T> => {
    TestBed.configureTestingModule({ imports: [component, ...imports], providers }).compileComponents();
    const fixture = TestBed.createComponent<T>(component);

    fixture.autoDetectChanges();

    return fixture;
};

function getBreadcrumbsDebugElement(debugElement: DebugElement): DebugElement {
    return debugElement.query(By.directive(KbqBreadcrumbs));
}

function findAllBreadcrumbItems(debugElement: DebugElement): DebugElement[] {
    return debugElement.queryAll(By.css('.kbq-breadcrumb-item__container:not(.kbq-overflow-items-result)'));
}

function findAllBreadcrumbButtons(debugElement: DebugElement): DebugElement[] {
    return debugElement.queryAll(By.directive(KbqBreadcrumbButton));
}

function getBreadcrumbsElementRef(debugElement: DebugElement): DebugElement {
    return debugElement.query(By.directive(KbqBreadcrumbs));
}

function findVisibleOverflowItems(debugElement: DebugElement): DebugElement[] {
    return debugElement
        .queryAll(By.directive(KbqOverflowItem))
        .filter(({ injector }) => !injector.get(KbqOverflowItem).hidden());
}

function findAllCustomBreadcrumbItems(debugElement: DebugElement): DebugElement[] {
    return debugElement.queryAll(By.css('.custom-breadcrumb'));
}

function findAllCustomSeparators(debugElement: DebugElement): DebugElement[] {
    return findAllBreadcrumbItems(debugElement)
        .map((breadcrumbDebugElement) => breadcrumbDebugElement.query(By.css('.custom-separator')))
        .filter(Boolean);
}

const customBreadcrumbsProvider = kbqBreadcrumbsConfigurationProvider({ firstItemNegativeMargin: true, max: null });

describe(KbqBreadcrumbs.name, () => {
    describe('core', () => {
        it('should have the correct number of breadcrumb items', () => {
            const fixture = createComponent(SimpleBreadcrumbs, [
                provideRouter([]),
                customBreadcrumbsProvider
            ]);
            const { debugElement, componentInstance } = fixture;
            const breadcrumbItems = findAllBreadcrumbItems(debugElement);

            expect(breadcrumbItems.length).toBe(componentInstance.items.length);
        });

        it('should apply the default size class to the breadcrumbs container', () => {
            const fixture = createComponent(SimpleBreadcrumbs, [
                provideRouter([]),
                customBreadcrumbsProvider
            ]);
            const { debugElement } = fixture;
            const { nativeElement } = getBreadcrumbsDebugElement(debugElement);

            expect(nativeElement.classList.contains('kbq-breadcrumbs_normal')).toBeTruthy();
        });

        it('should update when items change', () => {
            const fixture = createComponent(SimpleBreadcrumbs, [
                provideRouter([]),
                customBreadcrumbsProvider
            ]);
            const { debugElement, componentInstance } = fixture;
            const updatedLength = componentInstance.items.push({ text: 'New Item', disabled: false });

            fixture.autoDetectChanges();
            const breadcrumbItems = findAllBreadcrumbItems(debugElement);

            expect(breadcrumbItems.length).toBe(updatedLength);
        });

        it('should apply the disabled state correctly to specific breadcrumb items', () => {
            const fixture = createComponent(SimpleBreadcrumbs, [
                provideRouter([]),
                customBreadcrumbsProvider
            ]);
            const { debugElement } = fixture;

            fixture.detectChanges();
            const disabledItem = findAllBreadcrumbItems(debugElement)[2];

            expect(disabledItem).toBeTruthy();
        });

        it('should enforce the max limit of breadcrumb items displayed async ', async () => {
            // ARRANGE
            const fixture = createComponent(SimpleBreadcrumbs, [
                provideRouter([]),
                customBreadcrumbsProvider
            ]);
            const { debugElement, componentInstance } = fixture;

            componentInstance.max = 4;
            fixture.detectChanges();
            await fixture.whenStable();

            // ACT
            componentInstance.items.push({ text: 'New Item1', disabled: false });
            fixture.detectChanges();
            await fixture.whenStable();

            componentInstance.items.push({ text: 'New Item2', disabled: false });
            fixture.detectChanges();
            await fixture.whenStable();

            // ASSERT
            expect(componentInstance.items.length).toBeGreaterThan(componentInstance.max);
            expect(findVisibleOverflowItems(debugElement).length).toBe(componentInstance.max - 1);
        });

        it('should not set max-width when max more than actual items async', async () => {
            const fixture = createComponent(SimpleBreadcrumbs, [
                provideRouter([]),
                customBreadcrumbsProvider
            ]);
            const { debugElement, componentInstance } = fixture;

            fixture.detectChanges();
            await fixture.whenStable();
            componentInstance.max = 4;
            fixture.detectChanges();
            await fixture.whenStable();

            const breadcrumbsElementRef = getBreadcrumbsElementRef(debugElement);

            expect(componentInstance.items.length).toBeLessThan(componentInstance.max);
            expect(breadcrumbsElementRef.nativeElement.style.maxWidth).toBeFalsy();
        });

        it('should open dropdown on ArrowDown if item is Dropdown trigger', fakeAsync(() => {
            const fixture = createComponent(
                TestDropdownBreadcrumbs,
                [
                    provideRouter([]),
                    customBreadcrumbsProvider
                ],
                [
                    NoopAnimationsModule
                ]
            );
            const { debugElement } = fixture;

            fixture.detectChanges();
            const breadcrumbItems = findAllBreadcrumbButtons(debugElement);
            const lastBreadcrumbItem = breadcrumbItems[breadcrumbItems.length - 1];
            const dropdownTrigger = lastBreadcrumbItem.injector.get(KbqDropdownTrigger, null);

            dispatchEvent(lastBreadcrumbItem.nativeElement, new KeyboardEvent('keydown', { key: 'ArrowDown' }));
            fixture.detectChanges();
            tick();

            expect(dropdownTrigger).toBeTruthy();
            expect(dropdownTrigger?.opened).toBeTruthy();
            expect(dropdownTrigger?.openedBy).toBe('keyboard');
        }));
    });

    describe('customization', () => {
        it('should use the custom separator template', () => {
            const fixture = createComponent(BreadcrumbsCustomization, [
                provideRouter([]),
                customBreadcrumbsProvider
            ]);
            const { debugElement, componentInstance } = fixture;
            const customSeparators = findAllCustomSeparators(debugElement);

            expect(customSeparators.length).toBe(componentInstance.items.length - 1);
        });

        it('should use the custom view template', () => {
            const fixture = createComponent(BreadcrumbsCustomization, [
                provideRouter([]),
                customBreadcrumbsProvider
            ]);
            const { debugElement, componentInstance } = fixture;
            const customBreadcrumbs = findAllCustomBreadcrumbItems(debugElement);

            expect(customBreadcrumbs.length).toBe(componentInstance.items.length);
        });
    });
});

@Component({
    template: `
        <kbq-breadcrumbs [max]="max" [size]="size">
            @for (item of items; track item) {
                <kbq-breadcrumb-item [text]="item.text" [disabled]="item.disabled" />
            }
        </kbq-breadcrumbs>
    `,
    standalone: true,
    imports: [
        KbqBreadcrumbs,
        KbqBreadcrumbItem
    ]
})
class SimpleBreadcrumbs {
    @ViewChild(KbqBreadcrumbs) breadcrumbs: KbqBreadcrumbs;

    max: number | null = null;
    size: KbqDefaultSizes = 'normal';
    items = [
        { text: 'Home', disabled: false },
        { text: 'Library', disabled: false },
        { text: 'Data', disabled: true }
    ];
}

@Component({
    template: `
        <kbq-breadcrumbs [max]="max" [size]="size">
            <ng-template kbqBreadcrumbsSeparator>
                <div class="custom-separator">CUSTOM_SEPARATOR</div>
            </ng-template>

            @for (item of items; track item) {
                <kbq-breadcrumb-item [text]="item.text" [disabled]="item.disabled">
                    <a *kbqBreadcrumbView class="custom-breadcrumb">CUSTOM_BREADCRUMB_TEMPLATE</a>
                </kbq-breadcrumb-item>
            }
        </kbq-breadcrumbs>
    `,
    standalone: true,
    imports: [
        KbqBreadcrumbs,
        KbqBreadcrumbItem,
        KbqBreadcrumbsSeparator,
        KbqBreadcrumbView
    ]
})
class BreadcrumbsCustomization {
    @ViewChild(KbqBreadcrumbs) breadcrumbs: KbqBreadcrumbs;
    @ViewChildren(KbqBreadcrumbItem) breadcrumbItems: QueryList<KbqBreadcrumbItem>;

    max: number | null = null;
    size: KbqDefaultSizes = 'normal';
    items = [
        { text: 'Home', disabled: false },
        { text: 'Library', disabled: false },
        { text: 'Data', disabled: false },
        { text: 'Person', disabled: false }
    ];
}

@Component({
    template: `
        <nav kbq-breadcrumbs>
            @for (item of items; track item) {
                @if ($index < items.length - 1) {
                    <kbq-breadcrumb-item [routerLink]="'./' + item.text" [text]="item.text" />
                }
            }

            <kbq-breadcrumb-item>
                <div *kbqBreadcrumbView>
                    <button
                        kbq-button
                        kbqBreadcrumb
                        [kbqDropdownTriggerFor]="siblingsListDropdown"
                        [openByArrowDown]="false"
                    >
                        {{ items[items.length - 1].text }}
                    </button>
                </div>
            </kbq-breadcrumb-item>
        </nav>

        <kbq-dropdown #siblingsListDropdown="kbqDropdown">
            <a kbq-dropdown-item routerLink="./RBAC">RBAC</a>
            <a kbq-dropdown-item routerLink="./ABAC">ABAC</a>
        </kbq-dropdown>
    `,
    standalone: true,
    imports: [
        KbqBreadcrumbs,
        KbqBreadcrumbItem,
        KbqBreadcrumbButton,
        KbqBreadcrumbView,
        KbqButtonDropdownTrigger,
        KbqButtonModule,
        KbqDropdownModule,
        RouterLink
    ]
})
class TestDropdownBreadcrumbs extends SimpleBreadcrumbs {
    items = [
        { text: 'Home', disabled: false },
        { text: 'Library', disabled: false },
        { text: 'Data', disabled: true },
        { text: 'Access Control', disabled: true }
    ];
}
