import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, QueryList, ViewChild, ViewChildren } from '@angular/core';
import {
    ComponentFixture,
    TestBed,
    discardPeriodicTasks,
    fakeAsync,
    flush,
    inject,
    waitForAsync
} from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { dispatchMouseEvent } from '@koobiq/cdk/testing';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqSelect, KbqSelectModule } from '@koobiq/components/select';
import { KbqTimezoneGroup, KbqTimezoneModule, KbqTimezoneOption, KbqTimezoneSelect } from './index';

const longOptionText: string = [
    'Gordon Freeman Town',
    'Barney Calhoun Town',
    'G-Man Town',
    'Wallace Breen Town',
    'Eli Vance Town',
    'Isaac Kleiner Village',
    'Father Grigori Town',
    'GLaDOS',
    'Chef Vortigaunt Town',
    'Adrian Shephard Village',
    'Nihilanth Town',
    'Judith Mossman Village',
    'Walter Bennet Village',
    'city',
    'village',
    'city',
    'village',
    'city',
    'city',
    'village',
    'city',
    'village',
    'city',
    'village',
    'city',
    'village'
].join(', ');

const groupedZones: KbqTimezoneGroup[] = [
    {
        countryCode: 'ru',
        countryName: 'Russia',
        zones: [
            {
                id: 'Europe/city1',
                offset: '-02:00:00',
                city: 'city1',
                countryCode: 'ru',
                countryName: 'Russia',
                cities: 'city4, city5'
            },
            {
                id: 'Europe/city7',
                offset: '08:00:00',
                city: 'city7',
                countryCode: 'ru',
                countryName: 'Russia',
                cities: 'city9, city22'
            },
            {
                id: 'Europe/city17',
                offset: '04:00:00',
                city: 'city17',
                countryCode: 'ru',
                countryName: 'Russia',
                cities: longOptionText
            }
        ]
    }
];

@Component({
    selector: 'basic-timezone-select',
    template: `
        <div [style.height.px]="heightAbove"></div>
        <kbq-form-field>
            <kbq-timezone-select
                placeholder="Timezones"
                [formControl]="control"
                [required]="isRequired"
                [panelClass]="panelClass"
            >
                @for (group of zones; track group) {
                    <kbq-optgroup [label]="group.countryName">
                        @for (zone of group.zones; track zone) {
                            <kbq-timezone-option
                                [value]="zone.id"
                                [timezone]="zone"
                                [disabled]="zone.id === disabledFor"
                            />
                        }
                    </kbq-optgroup>
                }
            </kbq-timezone-select>
        </kbq-form-field>
        <div [style.height.px]="heightBelow"></div>
    `
})
class BasicTimezoneSelect {
    zones: KbqTimezoneGroup[] = groupedZones;
    control = new FormControl();
    isRequired: boolean;
    heightAbove = 0;
    heightBelow = 0;
    panelClass = ['custom-one', 'custom-two'];
    disabledFor = 'Europe/city7';

    @ViewChild(KbqTimezoneSelect, { static: true }) select: KbqSelect;
    @ViewChildren(KbqTimezoneOption) options: QueryList<KbqTimezoneOption>;
}

describe('KbqTimezoneSelect', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    function configureTestingModule(declarations: any[]) {
        TestBed.configureTestingModule({
            imports: [
                KbqFormFieldModule,
                KbqSelectModule,
                KbqTimezoneModule,
                KbqInputModule,
                ReactiveFormsModule,
                FormsModule,
                NoopAnimationsModule
            ],
            declarations
        }).compileComponents();

        inject([OverlayContainer], (oc: OverlayContainer) => {
            overlayContainer = oc;
            overlayContainerElement = oc.getContainerElement();
        })();
    }

    afterEach(() => overlayContainer.ngOnDestroy());

    describe('core', () => {
        beforeEach(waitForAsync(() => configureTestingModule([BasicTimezoneSelect])));

        describe('accessibility', () => {
            describe('disabled behavior', () => {
                it('should disable itself when control is disabled programmatically', fakeAsync(() => {
                    const fixture = TestBed.createComponent(BasicTimezoneSelect);

                    fixture.detectChanges();

                    fixture.componentInstance.control.disable();
                    fixture.detectChanges();
                    const trigger = fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement;

                    expect(getComputedStyle(trigger).getPropertyValue('cursor')).toEqual('default');

                    trigger.click();
                    fixture.detectChanges();
                    flush();

                    expect(overlayContainerElement.textContent).toEqual('');
                    expect(fixture.componentInstance.select.panelOpen).toBe(false);

                    fixture.componentInstance.control.enable();
                    fixture.detectChanges();
                    expect(getComputedStyle(trigger).getPropertyValue('cursor')).toEqual('pointer');

                    trigger.click();
                    fixture.detectChanges();
                    flush();

                    expect(overlayContainerElement.textContent).toContain('UTC−02:00city1city4');
                    expect(fixture.componentInstance.select.panelOpen).toBe(true);
                }));
            });
        });
    });

    describe('option tooltip', () => {
        beforeEach(waitForAsync(() => {
            configureTestingModule([BasicTimezoneSelect]);
        }));

        let fixture: ComponentFixture<BasicTimezoneSelect>;
        let trigger: HTMLElement;

        class MockedResizeObserver implements ResizeObserver {
            elements: any[] = [];

            constructor(private callback: ResizeObserverCallback) {
                window.addEventListener('resize', () => this.onWindowResize());
            }

            observe(target: Element) {
                this.elements.push(target);
            }

            unobserve(target: Element) {
                const idx = this.elements.indexOf(target);

                if (idx > -1) {
                    this.elements.splice(idx, 1);
                }
            }

            disconnect() {
                window.removeEventListener('resize', this.onWindowResize);
            }

            private onWindowResize() {
                this.callback(this.elements, this);
            }
        }

        window.ResizeObserver = MockedResizeObserver;

        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(BasicTimezoneSelect);
            fixture.detectChanges();

            trigger = fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement;
            flush();
        }));

        it('should display tooltip if ellipse applied', fakeAsync(() => {
            trigger.click();
            fixture.autoDetectChanges();

            const options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('kbq-timezone-option');

            options[2].style.width = '200px';
            dispatchMouseEvent(options[2], 'mouseenter');
            fixture.autoDetectChanges();

            window.dispatchEvent(new Event('resize'));
            fixture.autoDetectChanges();
            flush();

            discardPeriodicTasks();

            const tooltips = document.querySelectorAll('.kbq-tooltip__content');

            expect(tooltips.length).toEqual(1);
            expect(tooltips[0].textContent).toContain(longOptionText);
        }));
    });
});
