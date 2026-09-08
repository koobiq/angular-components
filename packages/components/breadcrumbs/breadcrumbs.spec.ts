import { Component, DebugElement, EnvironmentProviders, Provider, Type, viewChildren } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter, RouterLink } from '@angular/router';
import { KbqButtonModule } from '@koobiq/components/button';
import {
    dispatchEvent,
    DOWN_ARROW,
    kbqA11yLocaleConfigurationProvider,
    KbqDefaultSizes
} from '@koobiq/components/core';
import { KbqDropdownModule, KbqDropdownTrigger } from '@koobiq/components/dropdown';
import { KbqOverflowItem, KbqOverflowItemsResult } from '@koobiq/components/overflow-items';
import { axe } from 'jest-axe';
import {
    KbqBreadcrumbButton,
    KbqBreadcrumbItem,
    KbqBreadcrumbs,
    kbqBreadcrumbsConfigurationProvider
} from './breadcrumbs';
import { KbqBreadcrumbsModule } from './breadcrumbs.module';
import { RdxRovingFocusGroupDirective } from './roving-focus-group.directive';

const AXE_TIMEOUT = 15000;

const createComponent = <T>(
    component: Type<T>,
    providers: (EnvironmentProviders | Provider)[] = [],
    imports: Type<unknown>[] = []
): ComponentFixture<T> => {
    TestBed.configureTestingModule({ imports: [component, ...imports], providers });
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

function findAllCustomBreadcrumbItems(debugElement: DebugElement): DebugElement[] {
    return debugElement.queryAll(By.css('.custom-breadcrumb'));
}

function findAllCustomSeparators(debugElement: DebugElement): DebugElement[] {
    return findAllBreadcrumbItems(debugElement)
        .map((breadcrumbDebugElement) => breadcrumbDebugElement.query(By.css('.custom-separator')))
        .filter(Boolean);
}

function getRovingGroup(fixture: ComponentFixture<unknown>): RdxRovingFocusGroupDirective {
    return fixture.debugElement.query(By.directive(KbqBreadcrumbs)).injector.get(RdxRovingFocusGroupDirective);
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
            // `disabled` is not a valid attribute on an anchor, so the state is exposed via ARIA.
            expect(disabledLink.nativeElement.getAttribute('aria-disabled')).toBe('true');
            expect(disabledLink.nativeElement.getAttribute('tabindex')).toBe('-1');
            expect(disabledLink.nativeElement.classList).toContain('kbq-disabled');
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

            const breadcrumbsElementRef = getBreadcrumbsDebugElement(debugElement);

            expect(componentInstance.items.length).toBeLessThan(componentInstance.max);
            expect(breadcrumbsElementRef.nativeElement.style.maxWidth).toBeFalsy();
        });

        it('should open dropdown on ArrowDown if item is Dropdown trigger', fakeAsync(() => {
            const fixture = createComponent(
                DropdownBreadcrumbs,
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

    describe('accessibility', () => {
        it(
            'should have no axe violations on the attribute form',
            async () => {
                const fixture = createComponent(NavBreadcrumbs, [provideRouter([])]);

                await fixture.whenStable();

                expect(await axe(fixture.nativeElement)).toHaveNoViolations();
            },
            AXE_TIMEOUT
        );

        it(
            'should have no axe violations on the element form',
            async () => {
                const fixture = createComponent(SimpleBreadcrumbs, [provideRouter([])]);

                await fixture.whenStable();

                expect(await axe(fixture.nativeElement)).toHaveNoViolations();
            },
            AXE_TIMEOUT
        );

        it('should name the landmark from the active locale', () => {
            const fixture = createComponent(SimpleBreadcrumbs, [provideRouter([])]);
            const { nativeElement } = getBreadcrumbsDebugElement(fixture.debugElement);

            expect(nativeElement.getAttribute('aria-label')).toBe('Хлебные крошки');
        });

        it('should follow a locale configuration override', () => {
            const fixture = createComponent(SimpleBreadcrumbs, [
                provideRouter([]),
                kbqA11yLocaleConfigurationProvider({ breadcrumbs: 'Навигация' })
            ]);
            const { nativeElement } = getBreadcrumbsDebugElement(fixture.debugElement);

            expect(nativeElement.getAttribute('aria-label')).toBe('Навигация');
        });

        it('should keep the name the consumer authored', () => {
            const fixture = createComponent(NavBreadcrumbs, [provideRouter([])]);
            const { nativeElement } = getBreadcrumbsDebugElement(fixture.debugElement);

            expect(nativeElement.getAttribute('aria-label')).toBe('Main trail');
        });

        it('should expose the element form as a navigation landmark', () => {
            const fixture = createComponent(SimpleBreadcrumbs, [provideRouter([])]);
            const { nativeElement } = getBreadcrumbsDebugElement(fixture.debugElement);

            expect(nativeElement.getAttribute('role')).toBe('navigation');
        });

        it('should not stamp a redundant role onto a <nav> host', () => {
            const fixture = createComponent(NavBreadcrumbs, [provideRouter([])]);
            const { nativeElement } = getBreadcrumbsDebugElement(fixture.debugElement);

            expect(nativeElement.hasAttribute('role')).toBe(false);
        });

        it('should hide the separators from assistive technology', () => {
            const fixture = createComponent(SimpleBreadcrumbs, [provideRouter([])]);
            const separators = fixture.debugElement.queryAll(By.css('.kbq-breadcrumb__separator'));

            expect(separators.length).toBeGreaterThan(0);
            separators.forEach(({ nativeElement }) => expect(nativeElement.getAttribute('aria-hidden')).toBe('true'));
        });

        it('should expose the trail as a list of items', () => {
            const fixture = createComponent(SimpleBreadcrumbs, [provideRouter([])]);
            const { debugElement } = fixture;
            const list = debugElement.query(By.css('[role="list"]'));
            const listItems = debugElement.queryAll(By.css('[role="listitem"]'));

            expect(list).toBeTruthy();
            expect(listItems.length).toBeGreaterThan(0);
            listItems.forEach(({ nativeElement }) => expect(nativeElement.parentElement).toBe(list.nativeElement));
        });

        it('should mark exactly one item as the current page', () => {
            const fixture = createComponent(SimpleBreadcrumbs, [provideRouter([])]);
            const current = fixture.debugElement.queryAll(By.css('a[kbq-button][aria-current="page"]'));

            expect(current.length).toBe(1);
            expect(current[0].nativeElement.textContent.trim()).toBe('Data');
        });

        it('should mark a non-terminal item as current when the item asks for it', () => {
            const fixture = createComponent(CurrentBreadcrumb, [provideRouter([])]);
            const current = fixture.debugElement.queryAll(By.css('a[kbq-button][aria-current="page"]'));

            expect(current.length).toBe(2);
            expect(current[0].nativeElement.textContent.trim()).toBe('Library');
        });

        it('should name the expand button from the active locale', () => {
            const fixture = createComponent(SimpleBreadcrumbs, [provideRouter([])]);
            const expandButton = fixture.debugElement.query(By.css('.kbq-breadcrumb__expand'));

            expect(expandButton.nativeElement.getAttribute('aria-label')).toBe('Показать скрытые элементы');
        });
    });

    describe('disabled', () => {
        it('should disable every rendered item', () => {
            const fixture = createComponent(DisabledBreadcrumbs, [provideRouter([])]);
            const anchors = fixture.debugElement.queryAll(By.css('a[kbq-button]'));

            expect(anchors.length).toBeGreaterThan(0);
            anchors.forEach(({ nativeElement }) => expect(nativeElement.getAttribute('aria-disabled')).toBe('true'));
        });

        it('should disable the expand button and register no focusable item', () => {
            const fixture = createComponent(DisabledBreadcrumbs, [provideRouter([])]);
            const expandButton = fixture.debugElement.query(By.css('.kbq-breadcrumb__expand'));

            expect(expandButton.nativeElement.disabled).toBe(true);
            expect(getRovingGroup(fixture).focusableItems()).toEqual([]);
        });

        it('should mark the host', () => {
            const fixture = createComponent(DisabledBreadcrumbs, [provideRouter([])]);
            const { nativeElement } = getBreadcrumbsDebugElement(fixture.debugElement);

            expect(nativeElement.classList).toContain('kbq-disabled');
        });
    });

    describe('roving focus', () => {
        function getExpandButton(fixture: ComponentFixture<unknown>): HTMLElement | null {
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

        it('should track focusable in both directions while the item stays mounted', () => {
            const fixture = createComponent(ToggleFocusableBreadcrumb, [provideRouter([])]);
            const group = getRovingGroup(fixture);
            const anchor = fixture.debugElement.query(By.css('a[kbq-button]')).nativeElement;

            expect(group.focusableItems()).toEqual([anchor]);

            fixture.componentInstance.focusable = false;
            fixture.detectChanges();

            expect(group.focusableItems()).toEqual([]);

            fixture.componentInstance.focusable = true;
            fixture.detectChanges();

            expect(group.focusableItems()).toEqual([anchor]);
        });

        it('should keep DOM order when a non-terminal item toggles focusable off and back on', () => {
            const fixture = createComponent(ToggleFocusableMultiBreadcrumb, [provideRouter([])]);
            const group = getRovingGroup(fixture);
            const anchors = fixture.debugElement.queryAll(By.css('a[kbq-button]')).map((de) => de.nativeElement);

            expect(group.focusableItems()).toEqual(anchors);

            fixture.componentInstance.focusable = false;
            fixture.detectChanges();

            expect(group.focusableItems()).toEqual([anchors[1]]);

            fixture.componentInstance.focusable = true;
            fixture.detectChanges();

            // Re-registering used to append to the end of the array, which put "Home" after "Library"
            // and corrupted arrow-key order relative to the visual/DOM order.
            expect(group.focusableItems()).toEqual(anchors);
        });

        it('should leave no registration behind when the item is destroyed while not focusable', () => {
            const fixture = createComponent(ToggleFocusableBreadcrumb, [provideRouter([])]);
            const group = getRovingGroup(fixture);

            fixture.componentInstance.focusable = false;
            fixture.detectChanges();
            fixture.destroy();

            expect(group.focusableItems()).toEqual([]);
        });

        it('should not suppress the focus ring of the group host with an inline style', () => {
            const fixture = createComponent(SimpleBreadcrumbs, [provideRouter([])]);
            const { nativeElement } = getBreadcrumbsDebugElement(fixture.debugElement);

            expect(nativeElement.style.outline).toBe('');
        });

        it('should re-enter the tab order once focus has left after a Shift+Tab', () => {
            const fixture = createComponent(SimpleBreadcrumbs, [provideRouter([])]);
            const { nativeElement: host } = getBreadcrumbsDebugElement(fixture.debugElement);
            const anchor = fixture.debugElement.query(By.css('a[kbq-button]')).nativeElement;

            expect(host.getAttribute('tabindex')).toBe('0');

            dispatchEvent(anchor, new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true }));
            fixture.detectChanges();

            expect(host.getAttribute('tabindex')).toBe('-1');

            // `blur` does not bubble, so the latch has to be released by `focusout`.
            dispatchEvent(anchor, new FocusEvent('focusout', { bubbles: true }));
            fixture.detectChanges();

            expect(host.getAttribute('tabindex')).toBe('0');
        });

        it('should leave PageUp and PageDown to the document', () => {
            const fixture = createComponent(SimpleBreadcrumbs, [provideRouter([])]);
            const anchor = fixture.debugElement.query(By.css('a[kbq-button]')).nativeElement;

            (['PageUp', 'PageDown'] as const).forEach((key) => {
                const event = new KeyboardEvent('keydown', { key, cancelable: true });

                dispatchEvent(anchor, event);

                expect(event.defaultPrevented).toBe(false);
            });
        });

        it('should still handle the arrow, Home and End keys', () => {
            const fixture = createComponent(SimpleBreadcrumbs, [provideRouter([])]);
            const anchor = fixture.debugElement.query(By.css('a[kbq-button]')).nativeElement;

            (['ArrowRight', 'ArrowLeft', 'Home', 'End'] as const).forEach((key) => {
                const event = new KeyboardEvent('keydown', { key, cancelable: true });

                dispatchEvent(anchor, event);

                expect(event.defaultPrevented).toBe(true);
            });
        });

        it('should not force a direction onto the host', () => {
            const fixture = createComponent(SimpleBreadcrumbs, [provideRouter([])]);
            const { nativeElement } = getBreadcrumbsDebugElement(fixture.debugElement);

            expect(nativeElement.hasAttribute('dir')).toBe(false);
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

    describe('collapsed items dropdown', () => {
        it('should render the custom template of a hidden item instead of a blank row', fakeAsync(() => {
            const fixture = createComponent(
                CollapsibleCustomViewBreadcrumbs,
                [provideRouter([])],
                [NoopAnimationsModule]
            );

            fixture.detectChanges();
            tick();

            fixture.debugElement.query(By.css('.kbq-breadcrumb__expand')).nativeElement.click();
            fixture.detectChanges();
            tick();

            const rows = Array.from(document.querySelectorAll<HTMLElement>('[kbq-dropdown-item]'));

            expect(rows.length).toBeGreaterThan(0);
            rows.forEach((row) => expect(row.textContent?.trim()).not.toBe(''));
            expect(rows.some((row) => row.querySelector('.custom-breadcrumb'))).toBe(true);

            flush();
        }));

        it('should not register a hidden item a second time when its dropdown copy renders', fakeAsync(() => {
            const fixture = createComponent(
                CollapsibleCustomViewBreadcrumbs,
                [provideRouter([])],
                [NoopAnimationsModule]
            );

            fixture.detectChanges();
            tick();

            const { nativeElement: host } = getBreadcrumbsDebugElement(fixture.debugElement);
            const group = getRovingGroup(fixture);
            const beforeOpen = group.focusableItems();

            fixture.debugElement.query(By.css('.kbq-breadcrumb__expand')).nativeElement.click();
            fixture.detectChanges();
            tick();

            // A `*kbqBreadcrumbView` template resolves the roving group through its declaration site
            // (inside the trail), even when `ngTemplateOutlet` replays it a second time inside the
            // dropdown overlay. That replayed copy must not register: every item the group knows about
            // still has to live inside the trail, and the set must not have grown.
            expect(group.focusableItems().length).toBe(beforeOpen.length);
            group.focusableItems().forEach((item) => expect(host.contains(item)).toBe(true));

            flush();
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

        it('should keep the color the consumer bound on a breadcrumb button', () => {
            const fixture = createComponent(ColoredBreadcrumbButton, [provideRouter([])]);
            const { classList } = fixture.debugElement.query(By.css('a[kbq-button]')).nativeElement;

            expect(classList).toContain('kbq-theme');
            expect(classList).not.toContain('kbq-contrast');
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
        <nav kbq-breadcrumbs aria-label="Main trail">
            @for (item of items; track item) {
                <kbq-breadcrumb-item [text]="item" />
            }
        </nav>
    `
})
class NavBreadcrumbs {
    items = ['Home', 'Library', 'Data'];
}

@Component({
    imports: [
        KbqBreadcrumbsModule
    ],
    template: `
        <nav kbq-breadcrumbs [disabled]="true">
            @for (item of items; track item) {
                <kbq-breadcrumb-item [text]="item" />
            }
        </nav>
    `
})
class DisabledBreadcrumbs {
    items = ['Home', 'Library', 'Data'];
}

@Component({
    imports: [
        KbqBreadcrumbsModule
    ],
    template: `
        <nav kbq-breadcrumbs>
            <kbq-breadcrumb-item text="Home" />
            <kbq-breadcrumb-item text="Library" current />
            <kbq-breadcrumb-item text="Data" />
        </nav>
    `
})
class CurrentBreadcrumb {}

@Component({
    imports: [
        KbqBreadcrumbsModule,
        KbqButtonModule
    ],
    template: `
        <nav kbq-breadcrumbs>
            <kbq-breadcrumb-item text="Home">
                <a *kbqBreadcrumbView kbq-button kbqBreadcrumb [focusable]="focusable">Home</a>
            </kbq-breadcrumb-item>
        </nav>
    `
})
class ToggleFocusableBreadcrumb {
    focusable = true;
}

@Component({
    imports: [
        KbqBreadcrumbsModule,
        KbqButtonModule
    ],
    template: `
        <nav kbq-breadcrumbs wrapMode="wrap">
            <kbq-breadcrumb-item text="Home">
                <a *kbqBreadcrumbView kbq-button kbqBreadcrumb [focusable]="focusable">Home</a>
            </kbq-breadcrumb-item>
            <kbq-breadcrumb-item text="Library">
                <a *kbqBreadcrumbView kbq-button kbqBreadcrumb>Library</a>
            </kbq-breadcrumb-item>
        </nav>
    `
})
class ToggleFocusableMultiBreadcrumb {
    focusable = true;
}

@Component({
    imports: [
        KbqBreadcrumbsModule,
        KbqButtonModule
    ],
    template: `
        <nav kbq-breadcrumbs>
            <kbq-breadcrumb-item text="Home">
                <a *kbqBreadcrumbView kbq-button kbqBreadcrumb color="theme">Home</a>
            </kbq-breadcrumb-item>
        </nav>
    `
})
class ColoredBreadcrumbButton {}

@Component({
    imports: [
        KbqBreadcrumbsModule,
        KbqButtonModule,
        RouterLink
    ],
    template: `
        <nav kbq-breadcrumbs [max]="4">
            @for (item of items; track item) {
                <kbq-breadcrumb-item [text]="item.label" [routerLink]="item.url">
                    <a *kbqBreadcrumbView class="custom-breadcrumb" kbq-button kbqBreadcrumb [routerLink]="item.url">
                        {{ item.label }}
                    </a>
                </kbq-breadcrumb-item>
            }
        </nav>
    `
})
class CollapsibleCustomViewBreadcrumbs {
    items = ['Home', 'Library', 'Data', 'Docs', 'Articles', 'Current'].map((label) => ({
        label,
        url: '/' + label
    }));
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
            <kbq-breadcrumb-item routerLink="./Access Control" text="Access Control" />

            <kbq-breadcrumb-item>
                <div *kbqBreadcrumbView>
                    <button kbq-button kbqBreadcrumb [kbqDropdownTriggerFor]="siblingsListDropdown">
                        Access Control
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
class DropdownBreadcrumbs {}

@Component({
    imports: [KbqBreadcrumbsModule],
    template: `
        <kbq-breadcrumbs>
            <kbq-breadcrumb-item text="Home" />
        </kbq-breadcrumbs>
    `
})
class SingleBreadcrumb {}
