import { Component, DebugElement, QueryList, signal, Type, ViewChild, ViewChildren } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { KbqDefaultSizes } from '@koobiq/components/core';
import { KbqOverflowItem } from '@koobiq/components/overflow-items';
import {
    KbqBreadcrumbItem,
    KbqBreadcrumbs,
    kbqBreadcrumbsConfigurationProvider,
    KbqBreadcrumbsSeparator,
    KbqBreadcrumbView
} from './breadcrumbs';

const createComponent = <T>(component: Type<T>, providers: any[] = []): ComponentFixture<T> => {
    TestBed.configureTestingModule({ imports: [component], providers }).compileComponents();
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
            expect(nativeElement.classList).toBeTruthy();
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
        <kbq-breadcrumbs [max]="max" [size]="size" [style.min-width.px]="containerWidth()">
            @for (item of items; track item) {
                <kbq-breadcrumb-item [text]="item.text" [disabled]="item.disabled" />
            }
        </kbq-breadcrumbs>
    `,
    standalone: true,
    imports: [
        KbqBreadcrumbs,
        KbqBreadcrumbItem,
        KbqBreadcrumbsSeparator,
        KbqBreadcrumbView
    ],
    styles: `
        /* set min-width directly since overflow-items won't do it automatically */
        ::ng-deep .kbq-overflow-items {
            min-width: 284px;
        }
    `
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

    readonly containerWidth = signal(284);
}

@Component({
    template: `
        <kbq-breadcrumbs [max]="max" [size]="size">
            <ng-template kbqBreadcrumbsSeparator>
                <div class="custom-separator">CUSTOM_SEPARATOR</div>
            </ng-template>

            @for (item of items; track item) {
                <kbq-breadcrumb-item [text]="item.text" [disabled]="item.disabled">
                    <a class="custom-breadcrumb" *kbqBreadcrumbView>CUSTOM_BREADCRUMB_TEMPLATE</a>
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
