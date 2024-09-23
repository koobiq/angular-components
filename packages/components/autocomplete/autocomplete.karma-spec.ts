import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, NgZone, OnDestroy, Provider, QueryList, Type, ViewChild, ViewChildren } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, inject, tick } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DOWN_ARROW, UP_ARROW } from '@koobiq/cdk/keycodes';
import { MockNgZone, createKeyboardEvent, dispatchFakeEvent } from '@koobiq/cdk/testing';
import { KbqLocaleServiceModule, KbqOption } from '@koobiq/components/core';
import { KbqFormField, KbqFormFieldModule } from '@koobiq/components/form-field';
import { Subscription } from 'rxjs';
import { KbqInputModule } from '../input/index';
import {
    KBQ_AUTOCOMPLETE_DEFAULT_OPTIONS,
    KbqAutocomplete,
    KbqAutocompleteModule,
    KbqAutocompleteTrigger
} from './index';

describe('KbqAutocomplete', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;
    let zone: MockNgZone;

    // Creates a test component fixture.
    function createComponent<T>(component: Type<T>, providers: Provider[] = []) {
        TestBed.configureTestingModule({
            imports: [
                KbqAutocompleteModule,
                KbqFormFieldModule,
                KbqInputModule,
                FormsModule,
                ReactiveFormsModule,
                NoopAnimationsModule,
                KbqLocaleServiceModule
            ],
            declarations: [component],
            providers: [
                { provide: NgZone, useFactory: () => (zone = new MockNgZone()) },
                { provide: KBQ_AUTOCOMPLETE_DEFAULT_OPTIONS, useFactory: () => ({ autoActiveFirstOption: false }) },
                ...providers
            ]
        });

        TestBed.compileComponents();

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

    describe('panel toggling', () => {
        let fixture: ComponentFixture<SimpleAutocomplete>;

        beforeEach(() => {
            fixture = createComponent(SimpleAutocomplete);
            fixture.detectChanges();
        });

        it('should scroll to active options below the fold for options with custom height', () => {
            const DOWN_ARROW_EVENT = createKeyboardEvent('keydown', DOWN_ARROW);
            const trigger = fixture.componentInstance.trigger;

            fixture.componentInstance.kbqOptionWidth = 50;
            fixture.detectChanges();

            fixture.componentInstance.trigger.openPanel();
            fixture.detectChanges();
            const scrollContainer = document.querySelector('.cdk-overlay-pane .kbq-autocomplete-panel')!;

            trigger.handleKeydown(DOWN_ARROW_EVENT);
            fixture.detectChanges();
            expect(scrollContainer.scrollTop).withContext(`Expected panel not to scroll.`).toEqual(4);

            // These down arrows will set the 6th option active, below the fold.
            const keydownEvents = [1, 2, 3, 4, 5];
            keydownEvents.forEach(() => trigger.handleKeydown(DOWN_ARROW_EVENT));

            // Expect option bottom minus the panel height (50 * 6 - 256 = 44)
            expect(Math.floor(scrollContainer.scrollTop)).toEqual(275);

            expect(fixture.componentInstance.panel.keyManager.activeItemIndex).toEqual(5);
        });
    });

    describe('keyboard events', () => {
        let fixture: ComponentFixture<SimpleAutocomplete>;
        let DOWN_ARROW_EVENT: KeyboardEvent;
        let UP_ARROW_EVENT: KeyboardEvent;

        beforeEach(fakeAsync(() => {
            fixture = createComponent(SimpleAutocomplete);
            fixture.detectChanges();

            DOWN_ARROW_EVENT = createKeyboardEvent('keydown', DOWN_ARROW);
            UP_ARROW_EVENT = createKeyboardEvent('keydown', UP_ARROW);

            fixture.componentInstance.trigger.openPanel();
            fixture.detectChanges();
            zone.simulateZoneExit();
        }));

        it('should scroll to active options below the fold', () => {
            const trigger = fixture.componentInstance.trigger;
            const scrollContainer = document.querySelector('.cdk-overlay-pane .kbq-autocomplete-panel')!;

            trigger.handleKeydown(DOWN_ARROW_EVENT);
            fixture.detectChanges();
            expect(scrollContainer.scrollTop).withContext(`Expected panel not to scroll.`).toEqual(0);

            // These down arrows will set the 6th option active, below the fold.
            [1, 2, 3, 4, 5, 6, 7, 8].forEach(() => trigger.handleKeydown(DOWN_ARROW_EVENT));

            // Expect option bottom minus the panel height (288 - 256 - 4 = 32)
            expect(scrollContainer.scrollTop).withContext(`Expected panel to reveal the sixth option.`).toEqual(28);
        });

        it('should not scroll to active options that are fully in the panel', () => {
            const trigger = fixture.componentInstance.trigger;
            const scrollContainer = document.querySelector('.cdk-overlay-pane .kbq-autocomplete-panel')!;

            trigger.handleKeydown(DOWN_ARROW_EVENT);
            fixture.detectChanges();

            expect(scrollContainer.scrollTop).withContext(`Expected panel not to scroll.`).toEqual(0);

            // These down arrows will set the 6th option active, below the fold.
            [1, 2, 3, 4, 5, 6, 7, 8].forEach(() => trigger.handleKeydown(DOWN_ARROW_EVENT));

            // Expect option bottom minus the panel height (288 - 256 - 4 = 28)
            expect(scrollContainer.scrollTop).withContext(`Expected panel to reveal the sixth option.`).toEqual(28);

            // These up arrows will set the 2nd option active
            [4, 3, 2, 1].forEach(() => trigger.handleKeydown(UP_ARROW_EVENT));

            // Expect no scrolling to have occurred. Still showing bottom of 6th option.
            expect(scrollContainer.scrollTop)
                .withContext(`Expected panel not to scroll up since sixth option still fully visible.`)
                .toEqual(28);
        });

        it('should scroll to active options that are above the panel', () => {
            const trigger = fixture.componentInstance.trigger;
            const scrollContainer = document.querySelector('.cdk-overlay-pane .kbq-autocomplete-panel')!;

            trigger.handleKeydown(DOWN_ARROW_EVENT);
            fixture.detectChanges();

            expect(scrollContainer.scrollTop).withContext(`Expected panel not to scroll.`).toEqual(0);

            // These down arrows will set the 7th option active, below the fold.
            [1, 2, 3, 4, 5, 6, 7, 8].forEach(() => trigger.handleKeydown(DOWN_ARROW_EVENT));

            // These up arrows will set the 2nd option active
            [7, 6, 5, 4, 3, 2, 1].forEach(() => trigger.handleKeydown(UP_ARROW_EVENT));

            // Expect to show the top of the 2nd option at the top of the panel
            expect(scrollContainer.scrollTop)
                .withContext(`Expected panel to scroll up when option is above panel.`)
                .toEqual(28);
        });
    });

    it('should have correct width when opened', () => {
        const widthFixture = createComponent(SimpleAutocomplete);
        widthFixture.componentInstance.width = 300;
        widthFixture.detectChanges();

        widthFixture.componentInstance.trigger.openPanel();
        widthFixture.detectChanges();

        const overlayPane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;
        // Firefox, edge return a decimal value for width, so we need to parse and round it to verify
        expect(Math.ceil(parseFloat(overlayPane.style.width as string))).toBe(298);

        widthFixture.componentInstance.trigger.closePanel();
        widthFixture.detectChanges();

        widthFixture.componentInstance.width = 500;
        widthFixture.detectChanges();

        widthFixture.componentInstance.trigger.openPanel();
        widthFixture.detectChanges();

        // Firefox, edge return a decimal value for width, so we need to parse and round it to verify
        expect(Math.ceil(parseFloat(overlayPane.style.width as string))).toBe(498);
    });

    it('should update the width while the panel is open', () => {
        const widthFixture = createComponent(SimpleAutocomplete);

        widthFixture.componentInstance.width = 300;
        widthFixture.detectChanges();

        widthFixture.componentInstance.trigger.openPanel();
        widthFixture.detectChanges();

        const overlayPane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;
        const input = widthFixture.debugElement.query(By.css('input')).nativeElement;

        expect(Math.ceil(parseFloat(overlayPane.style.width as string))).toBe(298);

        widthFixture.componentInstance.width = 500;
        widthFixture.detectChanges();

        input.focus();
        dispatchFakeEvent(input, 'input');
        widthFixture.detectChanges();

        expect(Math.ceil(parseFloat(overlayPane.style.width as string))).toBe(498);
    });

    it('should update the panel width if the window is resized', fakeAsync(() => {
        const widthFixture = createComponent(SimpleAutocomplete);

        widthFixture.componentInstance.width = 300;
        widthFixture.detectChanges();

        widthFixture.componentInstance.trigger.openPanel();
        widthFixture.detectChanges();

        const overlayPane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;

        expect(Math.ceil(parseFloat(overlayPane.style.width as string))).toBe(298);

        widthFixture.componentInstance.width = 400;
        widthFixture.detectChanges();

        dispatchFakeEvent(window, 'resize');
        tick(20);

        expect(Math.ceil(parseFloat(overlayPane.style.width as string))).toBe(398);
    }));

    it('should have panel width match host width by default', () => {
        const widthFixture = createComponent(SimpleAutocomplete);

        widthFixture.componentInstance.width = 300;
        widthFixture.detectChanges();

        widthFixture.componentInstance.trigger.openPanel();
        widthFixture.detectChanges();

        const overlayPane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;

        expect(Math.ceil(parseFloat(overlayPane.style.width as string))).toBe(298);
    });
});

@Component({
    template: `
        <kbq-form-field [style.width.px]="width">
            <input
                [kbqAutocomplete]="auto"
                [kbqAutocompleteDisabled]="autocompleteDisabled"
                [formControl]="stateCtrl"
                kbqInput
                placeholder="State"
            />
        </kbq-form-field>

        <kbq-autocomplete
            class="class-one class-two"
            #auto="kbqAutocomplete"
            [displayWith]="displayFn"
            (opened)="openedSpy()"
            (closed)="closedSpy()"
        >
            <kbq-option
                *ngFor="let state of filteredStates"
                [value]="state"
                [style.height.px]="kbqOptionWidth"
            >
                <span>{{ state.code }}: {{ state.name }}</span>
            </kbq-option>
        </kbq-autocomplete>
    `
})
class SimpleAutocomplete implements OnDestroy {
    stateCtrl = new UntypedFormControl();
    filteredStates: any[];
    valueSub: Subscription;
    width: number;
    kbqOptionWidth: number;
    autocompleteDisabled = false;
    openedSpy = jasmine.createSpy('autocomplete opened spy');
    closedSpy = jasmine.createSpy('autocomplete closed spy');

    @ViewChild(KbqAutocompleteTrigger, { static: true }) trigger: KbqAutocompleteTrigger;
    @ViewChild(KbqAutocomplete, { static: false }) panel: KbqAutocomplete;
    @ViewChild(KbqFormField, { static: false }) formField: KbqFormField;
    @ViewChildren(KbqOption) options: QueryList<KbqOption>;

    states = [
        { code: 'AL', name: 'Alabama' },
        { code: 'CA', name: 'California' },
        { code: 'FL', name: 'Florida' },
        { code: 'KS', name: 'Kansas' },
        { code: 'MA', name: 'Massachusetts' },
        { code: 'NY', name: 'New York' },
        { code: 'OR', name: 'Oregon' },
        { code: 'PA', name: 'Pennsylvania' },
        { code: 'TN', name: 'Tennessee' },
        { code: 'VA', name: 'Virginia' },
        { code: 'WY', name: 'Wyoming' }
    ];

    constructor() {
        this.filteredStates = this.states;
        this.valueSub = this.stateCtrl.valueChanges.subscribe((val) => {
            this.filteredStates = val ? this.states.filter((s) => s.name.match(new RegExp(val, 'gi'))) : this.states;
        });
    }

    displayFn(value: any): string {
        return value ? value.name : value;
    }

    ngOnDestroy() {
        this.valueSub.unsubscribe();
    }
}
