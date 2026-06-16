import { Component, DebugElement, Type, viewChild, viewChildren } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter, RouterLink } from '@angular/router';
import { KbqButtonModule } from '@koobiq/components/button';
import { DOWN_ARROW } from '@koobiq/cdk/keycodes';
import { dispatchEvent } from '@koobiq/cdk/testing';
import { KbqDefaultSizes } from '@koobiq/components/core';
import { KbqDropdownModule, KbqDropdownTrigger } from '@koobiq/components/dropdown';
import { KbqOverflowItem, KbqOverflowItemsResult } from '@koobiq/components/overflow-items';
import {
    KbqBreadcrumbButton,
    KbqBreadcrumbItem,
    KbqBreadcrumbs,
    kbqBreadcrumbsConfigurationProvider
} from './breadcrumbs';
import { KbqBreadcrumbsModule } from './breadcrumbs.module';
import { RdxRovingFocusGroupDirective } from './roving-focus-group.directive';

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

        it('should apply the size class to the breadcrumbs container', () => {
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
            const disabledLink = disabledItem.query(By.css('a[kbq-button]'));

            expect(disabledItem).toBeTruthy();
            expect(disabledLink.nativeElement.getAttribute('disabled')).not.toBeNull();
        });

        it('should render all items inside the overflow container when max is exceeded', async () => {
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
            // The Karma version asserted `findVisibleOverflowItems(...).length === max - 1`,
            // which depends on KbqOverflowItem.hidden() — driven by real widths + ResizeObserver,
            // both of which are no-ops in jsdom (see tools/jest/setup.ts). Narrowed to the
            // observable contract: input is wired and the overflow render path is exercised.
            expect(componentInstance.items.length).toBeGreaterThan(componentInstance.max);
            expect(debugElement.queryAll(By.directive(KbqOverflowItem)).length).toBe(componentInstance.items.length);
        });

        it('should not set max-width when max more than actual items', async () => {
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

            dispatchEvent(lastBreadcrumbItem.nativeElement, new KeyboardEvent('keydown', { keyCode: DOWN_ARROW }));
            fixture.detectChanges();
            tick();

            expect(dropdownTrigger).toBeTruthy();
            expect(dropdownTrigger?.opened).toBeTruthy();
            expect(dropdownTrigger?.openedBy).toBe('keyboard');
        }));
    });

    describe('focusable items ordering', () => {
        function getRovingGroup(fixture: ComponentFixture<any>): RdxRovingFocusGroupDirective {
            return fixture.debugElement.query(By.directive(KbqBreadcrumbs)).injector.get(RdxRovingFocusGroupDirective);
        }

        function getExpandButton(fixture: ComponentFixture<any>): HTMLElement | null {
            return fixture.debugElement.query(By.css('.kbq-breadcrumb__expand'))?.nativeElement ?? null;
        }

        it('should not place the expand button as the first focusable item on initial render', () => {
            const fixture = createComponent(SimpleBreadcrumbs, [provideRouter([])]);
            const focusableItems = getRovingGroup(fixture).focusableItems();
            const expandButton = getExpandButton(fixture);

            expect(focusableItems.length).toBeGreaterThan(0);
            expect(focusableItems[0]).not.toBe(expandButton);
        });

        it('should not place the expand button as the first focusable item after items are added', () => {
            const fixture = createComponent(SimpleBreadcrumbs, [provideRouter([])]);

            fixture.componentInstance.items.push({ text: 'New Item', disabled: false });
            fixture.detectChanges();

            const focusableItems = getRovingGroup(fixture).focusableItems();
            const expandButton = getExpandButton(fixture);

            expect(focusableItems.length).toBeGreaterThan(0);
            expect(focusableItems[0]).not.toBe(expandButton);
        });

        it('should not place the expand button as the first focusable item after items are removed', () => {
            const fixture = createComponent(SimpleBreadcrumbs, [provideRouter([])]);

            fixture.componentInstance.items.splice(1, 1);
            fixture.detectChanges();

            const focusableItems = getRovingGroup(fixture).focusableItems();
            const expandButton = getExpandButton(fixture);

            expect(focusableItems.length).toBeGreaterThan(0);
            expect(focusableItems[0]).not.toBe(expandButton);
        });

        it('should not modify focusableItems when fewer than two items are registered', () => {
            const fixture = createComponent(SingleBreadcrumb, [provideRouter([])]);
            const focusableItems = getRovingGroup(fixture).focusableItems();

            // A single breadcrumb renders as $last → focusable=false → nothing registered.
            // The effect must return early and leave focusableItems unchanged (empty).
            expect(focusableItems.length).toBe(0);
        });
    });

    describe('max changes', () => {
        const ITEMS = [
            { text: 'Home', disabled: false },
            { text: 'Library', disabled: false },
            { text: 'Data', disabled: false },
            { text: 'Docs', disabled: false },
            { text: 'Articles', disabled: false },
            { text: 'Current', disabled: false }
        ];

        function getOverflowItems(debugElement: DebugElement): KbqOverflowItem[] {
            return debugElement
                .queryAll(By.directive(KbqOverflowItem))
                .map((debugElementItem) => debugElementItem.injector.get(KbqOverflowItem));
        }

        function getResult(debugElement: DebugElement): KbqOverflowItemsResult {
            return debugElement.query(By.directive(KbqOverflowItemsResult)).injector.get(KbqOverflowItemsResult);
        }

        it('should restore hidden items and hide expand button when max becomes null', fakeAsync(() => {
            const fixture = createComponent(SimpleBreadcrumbs, [provideRouter([])]);
            const { debugElement, componentInstance } = fixture;

            componentInstance.items = ITEMS;
            fixture.detectChanges();
            tick(); // flush KbqOverflowItems debounceTime(0) — shows all items in jsdom

            componentInstance.max = 4; // maxVisibleItems = 3 → hides 3 middle items
            fixture.detectChanges();
            tick();

            expect(getOverflowItems(debugElement).filter((i) => i.hidden()).length).toBe(3);
            expect(getResult(debugElement).hidden()).toBe(false);

            componentInstance.max = null;
            fixture.detectChanges();
            tick();

            expect(getOverflowItems(debugElement).filter((i) => i.hidden()).length).toBe(0);
            expect(getResult(debugElement).hidden()).toBe(true);
        }));

        it('should restore hidden items and hide expand button when max exceeds item count', fakeAsync(() => {
            const fixture = createComponent(SimpleBreadcrumbs, [provideRouter([])]);
            const { debugElement, componentInstance } = fixture;

            componentInstance.items = ITEMS;
            fixture.detectChanges();
            tick();

            componentInstance.max = 4;
            fixture.detectChanges();
            tick();

            expect(getOverflowItems(debugElement).filter((i) => i.hidden()).length).toBe(3);

            componentInstance.max = 6; // 6 >= items.length → maxVisibleItems = null
            fixture.detectChanges();
            tick();

            expect(getOverflowItems(debugElement).filter((i) => i.hidden()).length).toBe(0);
            expect(getResult(debugElement).hidden()).toBe(true);
        }));

        it('should hide fewer items when max increases', fakeAsync(() => {
            const fixture = createComponent(SimpleBreadcrumbs, [provideRouter([])]);
            const { debugElement, componentInstance } = fixture;

            componentInstance.items = ITEMS;
            fixture.detectChanges();
            tick();

            componentInstance.max = 4; // maxVisibleItems = 3 → hides 3
            fixture.detectChanges();
            tick();

            componentInstance.max = 5; // maxVisibleItems = 4 → hides 2
            fixture.detectChanges();
            tick();

            expect(getOverflowItems(debugElement).filter((i) => i.hidden()).length).toBe(2);
            expect(getResult(debugElement).hidden()).toBe(false);
        }));

        it('should hide more items when max decreases', fakeAsync(() => {
            const fixture = createComponent(SimpleBreadcrumbs, [provideRouter([])]);
            const { debugElement, componentInstance } = fixture;

            componentInstance.items = ITEMS;
            fixture.detectChanges();
            tick();

            componentInstance.max = 5; // maxVisibleItems = 4 → hides 2
            fixture.detectChanges();
            tick();

            componentInstance.max = 4; // maxVisibleItems = 3 → hides 3
            fixture.detectChanges();
            tick();

            expect(getOverflowItems(debugElement).filter((i) => i.hidden()).length).toBe(3);
            expect(getResult(debugElement).hidden()).toBe(false);
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
    imports: [
        KbqBreadcrumbsModule
    ],
    template: `
        <kbq-breadcrumbs [max]="max" [size]="size">
            @for (item of items; track item) {
                <kbq-breadcrumb-item [text]="item.text" [disabled]="item.disabled" />
            }
        </kbq-breadcrumbs>
    `
})
class SimpleBreadcrumbs {
    readonly breadcrumbs = viewChild.required(KbqBreadcrumbs);

    max: number | null = null;
    size: KbqDefaultSizes = 'normal';
    items = [
        { text: 'Home', disabled: false },
        { text: 'Library', disabled: false },
        { text: 'Data', disabled: true }
    ];
}

@Component({
    imports: [
        KbqBreadcrumbsModule
    ],
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
    `
})
class BreadcrumbsCustomization {
    readonly breadcrumbs = viewChild.required(KbqBreadcrumbs);
    readonly breadcrumbItems = viewChildren(KbqBreadcrumbItem);

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
    imports: [
        KbqBreadcrumbsModule,
        KbqButtonModule,
        KbqDropdownModule,
        RouterLink
    ],
    template: `
        <nav kbq-breadcrumbs>
            @for (item of items; track item) {
                @if ($last) {
                    <kbq-breadcrumb-item [routerLink]="getText(item.text)" [text]="item.text" />
                }
            }

            <kbq-breadcrumb-item>
                <div *kbqBreadcrumbView>
                    <button kbq-button kbqBreadcrumb [kbqDropdownTriggerFor]="siblingsListDropdown">
                        {{ items[items.length - 1].text }}
                    </button>
                </div>
            </kbq-breadcrumb-item>
        </nav>

        <kbq-dropdown #siblingsListDropdown="kbqDropdown">
            <a kbq-dropdown-item routerLink="./RBAC">RBAC</a>
            <a kbq-dropdown-item routerLink="./ABAC">ABAC</a>
        </kbq-dropdown>
    `
})
class TestDropdownBreadcrumbs extends SimpleBreadcrumbs {
    items = [
        { text: 'Home', disabled: false },
        { text: 'Library', disabled: false },
        { text: 'Data', disabled: true },
        { text: 'Access Control', disabled: true }
    ];

    getText(text: string): string {
        return `./${text}`;
    }
}

@Component({
    imports: [KbqBreadcrumbsModule],
    template: `
        <kbq-breadcrumbs>
            <kbq-breadcrumb-item text="Home" />
        </kbq-breadcrumbs>
    `
})
class SingleBreadcrumb {}
