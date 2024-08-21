import { Direction, Directionality } from '@angular/cdk/bidi';
import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, ElementRef, Provider, Type, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, flush, inject, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { dispatchMouseEvent } from '@koobiq/cdk/testing';
import { KbqTitleDirective } from '@koobiq/components/title';
import { KBQ_TOOLTIP_SCROLL_STRATEGY_FACTORY_PROVIDER } from '@koobiq/components/tooltip';
import {
    KbqDropdown,
    KbqDropdownModule,
    KbqDropdownTrigger,
    NESTED_PANEL_LEFT_PADDING,
    NESTED_PANEL_TOP_PADDING
} from './index';

describe('KbqDropdown', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    function createComponent<T>(
        component: Type<T>,
        providers: Provider[] = [],
        declarations: any[] = []
    ): ComponentFixture<T> {
        TestBed.configureTestingModule({
            imports: [KbqDropdownModule, NoopAnimationsModule],
            declarations: [component, ...declarations],
            providers
        }).compileComponents();

        inject([OverlayContainer], (oc: OverlayContainer) => {
            overlayContainer = oc;
            overlayContainerElement = oc.getContainerElement();
        })();

        return TestBed.createComponent<T>(component);
    }

    afterEach(inject([OverlayContainer], (currentOverlayContainer: OverlayContainer) => {
        // Since we're resetting the testing module in some of the tests,
        // we can potentially have multiple overlay containers.
        currentOverlayContainer.ngOnDestroy();
        overlayContainer.ngOnDestroy();
    }));

    describe('nested dropdown', () => {
        let fixture: ComponentFixture<NestedDropdown>;
        let instance: NestedDropdown;
        let overlay: HTMLElement;
        const compileTestComponent = (direction: Direction = 'ltr') => {
            fixture = createComponent(NestedDropdown, [
                {
                    provide: Directionality,
                    useFactory: () => ({ value: direction })
                }
            ]);

            fixture.detectChanges();
            instance = fixture.componentInstance;
            overlay = overlayContainerElement;
        };

        it('should position the nested dropdown to the right edge of the trigger in ltr', () => {
            compileTestComponent();
            instance.rootTriggerEl.nativeElement.style.position = 'fixed';
            instance.rootTriggerEl.nativeElement.style.left = '50px';
            instance.rootTriggerEl.nativeElement.style.top = '50px';
            instance.rootTrigger.open();
            fixture.detectChanges();

            instance.levelOneTrigger.open();
            fixture.detectChanges();

            const triggerRect = overlay.querySelector('#level-one-trigger')!.getBoundingClientRect();
            const panelRect = overlay.querySelectorAll('.cdk-overlay-pane')[1].getBoundingClientRect();

            expect(Math.round(triggerRect.right)).toBe(Math.round(panelRect.left) + NESTED_PANEL_LEFT_PADDING);
            expect(Math.round(triggerRect.top)).toBe(Math.round(panelRect.top) + NESTED_PANEL_TOP_PADDING);
        });

        it('should fall back to aligning to the left edge of the trigger in ltr', () => {
            compileTestComponent();
            instance.rootTriggerEl.nativeElement.style.position = 'fixed';
            instance.rootTriggerEl.nativeElement.style.right = '10px';
            instance.rootTriggerEl.nativeElement.style.top = '50%';
            instance.rootTrigger.open();
            fixture.detectChanges();

            instance.levelOneTrigger.open();
            fixture.detectChanges();

            const triggerRect = overlay.querySelector('#level-one-trigger')!.getBoundingClientRect();
            const panelRect = overlay.querySelectorAll('.cdk-overlay-pane')[1].getBoundingClientRect();

            expect(Math.round(triggerRect.left)).toBe(Math.round(panelRect.right) - NESTED_PANEL_LEFT_PADDING);
            expect(Math.round(triggerRect.top)).toBe(Math.round(panelRect.top) + NESTED_PANEL_TOP_PADDING);
        });

        it('should position the nested dropdown to the left edge of the trigger in rtl', () => {
            compileTestComponent('rtl');
            instance.rootTriggerEl.nativeElement.style.position = 'fixed';
            instance.rootTriggerEl.nativeElement.style.left = '50%';
            instance.rootTriggerEl.nativeElement.style.top = '50%';
            instance.rootTrigger.open();
            fixture.detectChanges();

            instance.levelOneTrigger.open();
            fixture.detectChanges();

            const triggerRect = overlay.querySelector('#level-one-trigger')!.getBoundingClientRect();
            const panelRect = overlay.querySelectorAll('.cdk-overlay-pane')[1].getBoundingClientRect();

            expect(Math.round(triggerRect.left)).toBe(Math.round(panelRect.right) + NESTED_PANEL_LEFT_PADDING);
            expect(Math.round(triggerRect.top)).toBe(Math.round(panelRect.top) + NESTED_PANEL_TOP_PADDING);
        });

        it('should fall back to aligning to the right edge of the trigger in rtl', fakeAsync(() => {
            compileTestComponent('rtl');
            instance.rootTriggerEl.nativeElement.style.position = 'fixed';
            instance.rootTriggerEl.nativeElement.style.left = '10px';
            instance.rootTriggerEl.nativeElement.style.top = '50%';
            instance.rootTrigger.open();
            fixture.detectChanges();
            tick(500);

            instance.levelOneTrigger.open();
            fixture.detectChanges();
            tick(500);

            const triggerRect = overlay.querySelector('#level-one-trigger')!.getBoundingClientRect();
            const panelRect = overlay.querySelectorAll('.cdk-overlay-pane')[1].getBoundingClientRect();

            expect(Math.round(triggerRect.right)).toBe(Math.round(panelRect.left) - NESTED_PANEL_LEFT_PADDING);
            expect(Math.round(triggerRect.top)).toBe(Math.round(panelRect.top) + NESTED_PANEL_TOP_PADDING);
        }));
    });

    describe('with KbqTitle directive', () => {
        let fixture: ComponentFixture<DropdownWithTooltip>;

        beforeEach(() => {
            fixture = createComponent(
                DropdownWithTooltip,
                [KBQ_TOOLTIP_SCROLL_STRATEGY_FACTORY_PROVIDER],
                [KbqTitleDirective]
            );
            fixture.detectChanges();
            fixture.componentInstance.trigger.open();
            fixture.detectChanges();
        });

        it('should display tooltip if text is overflown', fakeAsync(() => {
            const dropdownItems: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('[kbq-title]');

            dispatchMouseEvent(dropdownItems[0], 'mouseenter');
            fixture.detectChanges();
            flush();

            const tooltipInstance = overlayContainerElement.querySelector('.kbq-tooltip');

            expect(tooltipInstance).not.toBeNull();
        }));

        it('should display tooltip if text is complex and overflown', fakeAsync(() => {
            const dropdownItems: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('[kbq-title]');

            dispatchMouseEvent(dropdownItems[2], 'mouseenter');
            fixture.detectChanges();
            flush();

            const tooltipInstance = overlayContainerElement.querySelector('.kbq-tooltip');

            expect(tooltipInstance).not.toBeNull();
        }));
    });
});

@Component({
    template: `
        <button
            #rootTrigger="kbqDropdownTrigger"
            #rootTriggerEl
            [kbqDropdownTriggerFor]="root"
        >
            Toggle dropdown
        </button>

        <button
            #alternateTrigger="kbqDropdownTrigger"
            [kbqDropdownTriggerFor]="levelTwo"
        >
            Toggle alternate dropdown
        </button>

        <kbq-dropdown
            #root="kbqDropdown"
            [hasBackdrop]="true"
            (closed)="rootCloseCallback($event)"
        >
            <button
                id="level-one-trigger"
                #levelOneTrigger="kbqDropdownTrigger"
                [kbqDropdownTriggerFor]="levelOne"
                kbq-dropdown-item
            >
                One
            </button>
            <button kbq-dropdown-item>Two</button>
            <button
                id="lazy-trigger"
                #lazyTrigger="kbqDropdownTrigger"
                *ngIf="showLazy"
                [kbqDropdownTriggerFor]="lazy"
                kbq-dropdown-item
            >
                Three
            </button>
        </kbq-dropdown>

        <kbq-dropdown
            #levelOne="kbqDropdown"
            [hasBackdrop]="true"
            (closed)="levelOneCloseCallback($event)"
        >
            <button kbq-dropdown-item>Four</button>
            <button
                id="level-two-trigger"
                #levelTwoTrigger="kbqDropdownTrigger"
                [kbqDropdownTriggerFor]="levelTwo"
                kbq-dropdown-item
            >
                Five
            </button>
            <button kbq-dropdown-item>Six</button>
        </kbq-dropdown>

        <kbq-dropdown
            #levelTwo="kbqDropdown"
            [hasBackdrop]="true"
            (closed)="levelTwoCloseCallback($event)"
        >
            <button kbq-dropdown-item>Seven</button>
            <button kbq-dropdown-item>Eight</button>
            <button kbq-dropdown-item>Nine</button>
        </kbq-dropdown>

        <kbq-dropdown
            #lazy="kbqDropdown"
            [hasBackdrop]="true"
        >
            <button kbq-dropdown-item>Ten</button>
            <button kbq-dropdown-item>Eleven</button>
            <button kbq-dropdown-item>Twelve</button>
        </kbq-dropdown>
    `
})
class NestedDropdown {
    @ViewChild('root', { static: false }) rootDropdown: KbqDropdown;
    @ViewChild('rootTrigger', { static: false }) rootTrigger: KbqDropdownTrigger;
    @ViewChild('rootTriggerEl', { static: false }) rootTriggerEl: ElementRef<HTMLElement>;
    @ViewChild('alternateTrigger', { static: false }) alternateTrigger: KbqDropdownTrigger;
    readonly rootCloseCallback = jasmine.createSpy('root dropdown closed callback');

    @ViewChild('levelOne', { static: false }) levelOneDropdown: KbqDropdown;
    @ViewChild('levelOneTrigger', { static: false }) levelOneTrigger: KbqDropdownTrigger;
    readonly levelOneCloseCallback = jasmine.createSpy('level one dropdown closed callback');

    @ViewChild('levelTwo', { static: false }) levelTwoDropdown: KbqDropdown;
    @ViewChild('levelTwoTrigger', { static: false }) levelTwoTrigger: KbqDropdownTrigger;
    readonly levelTwoCloseCallback = jasmine.createSpy('level one dropdown closed callback');

    @ViewChild('lazy', { static: false }) lazyDropdown: KbqDropdown;
    @ViewChild('lazyTrigger', { static: false }) lazyTrigger: KbqDropdownTrigger;
    showLazy = false;
}

@Component({
    template: `
        <button
            #triggerEl
            [kbqDropdownTriggerFor]="dropdown"
        >
            Toggle dropdown
        </button>
        <kbq-dropdown #dropdown="kbqDropdown">
            <button
                style="max-width: 150px; width: 150px"
                kbq-dropdown-item
                kbq-title
            >
                {{ longValue }}
            </button>
            <button
                style="max-width: 150px; width: 150px"
                kbq-dropdown-item
                kbq-title
            >
                {{ defaultValue }}
            </button>
            <button
                style="max-width: 150px; width: 150px"
                kbq-dropdown-item
                kbq-title
            >
                <div #kbqTitleContainer>
                    <div>Complex header</div>
                    <div #kbqTitleText>{{ longValue }}</div>
                </div>
            </button>
            <button
                style="max-width: 150px; width: 150px"
                kbq-dropdown-item
                kbq-title
            >
                <div #kbqTitleContainer>
                    <div>Complex header</div>
                    <div #kbqTitleText>{{ defaultValue }}</div>
                </div>
            </button>
        </kbq-dropdown>
    `
})
class DropdownWithTooltip {
    @ViewChild(KbqDropdownTrigger, { static: false }) trigger: KbqDropdownTrigger;
    @ViewChild('triggerEl', { static: false }) triggerEl: ElementRef<HTMLElement>;

    defaultValue = 'Just a text';
    longValue = `${this.defaultValue} and a long text and a long text and a long text and a long text and a long text and a long text`;
}
