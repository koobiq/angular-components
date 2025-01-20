import { Component, DebugElement, QueryList, Type, ViewChild, ViewChildren } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { KbqDefaultSizes } from '@koobiq/components/core';
import {
    KBQ_BREADCRUMBS_CONFIGURATION,
    KbqBreadcrumbItem,
    KbqBreadcrumbs,
    KbqBreadcrumbsConfiguration,
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
    return debugElement.queryAll(By.css('.kbq-breadcrumb-item'));
}

function findAllCustomBreadcrumbItems(debugElement: DebugElement): DebugElement[] {
    return debugElement.queryAll(By.css('.custom-breadcrumb'));
}

function findAllCustomSeparators(debugElement: DebugElement): DebugElement[] {
    return debugElement.queryAll(By.css('.custom-separator'));
}

describe(KbqBreadcrumbs.name, () => {
    describe('core', () => {
        let fixture: ComponentFixture<SimpleBreadcrumbs>;
        let debugElement: DebugElement;
        let component: SimpleBreadcrumbs;

        beforeEach(() => {
            fixture = createComponent(SimpleBreadcrumbs, [
                provideRouter([]),
                {
                    provide: KBQ_BREADCRUMBS_CONFIGURATION,
                    useValue: { max: null, size: 'normal' } satisfies KbqBreadcrumbsConfiguration
                }
            ]);
            debugElement = fixture.debugElement;
            component = fixture.componentInstance;
        });

        it('should have the correct number of breadcrumb items', () => {
            const breadcrumbItems = findAllBreadcrumbItems(debugElement);
            expect(breadcrumbItems.length).toBe(component.items.length);
        });

        it('should apply the default size class to the breadcrumbs container', () => {
            const { nativeElement } = getBreadcrumbsDebugElement(debugElement);
            expect(nativeElement.classList).toMatchSnapshot();
        });

        it('should update when items change', () => {
            const updatedLength = component.items.push({ text: 'New Item', disabled: false });
            fixture.autoDetectChanges();
            const breadcrumbItems = findAllBreadcrumbItems(debugElement);
            expect(breadcrumbItems.length).toBe(updatedLength);
        });

        it('should apply the disabled state correctly to specific breadcrumb items', () => {
            fixture.detectChanges();
            const disabledItem = findAllBreadcrumbItems(debugElement)[2];
            expect(disabledItem).toBeTruthy();
        });

        it('should enforce the max limit of breadcrumb items displayed', () => {
            component.max = 4;
            component.items.push({ text: 'New Item1', disabled: false });
            component.items.push({ text: 'New Item2', disabled: false });
            fixture.detectChanges();
            const displayedBreadcrumbItems = findAllBreadcrumbItems(debugElement);
            expect(component.items.length).toBeGreaterThan(component.max);
            expect(displayedBreadcrumbItems.length).toBe(component.max);
        });
    });

    describe('customization', () => {
        let fixture: ComponentFixture<BreadcrumbsCustomization>;
        let debugElement: DebugElement;
        let component: BreadcrumbsCustomization;

        beforeEach(() => {
            fixture = createComponent(BreadcrumbsCustomization, [
                provideRouter([]),
                {
                    provide: KBQ_BREADCRUMBS_CONFIGURATION,
                    useValue: { max: null, size: 'normal' } satisfies KbqBreadcrumbsConfiguration
                }
            ]);
            debugElement = fixture.debugElement;
            component = fixture.componentInstance;
        });

        it('should use the custom separator template', () => {
            const customSeparators = findAllCustomSeparators(debugElement);
            expect(customSeparators.length).toBe(component.items.length - 1);
        });

        it('should use the custom view template', () => {
            const customBreadcrumbs = findAllCustomBreadcrumbItems(debugElement);
            expect(customBreadcrumbs.length).toBe(component.items.length);
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
        KbqBreadcrumbItem,
        KbqBreadcrumbsSeparator,
        KbqBreadcrumbView
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
