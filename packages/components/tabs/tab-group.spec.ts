import { CommonModule } from '@angular/common';
import { Component, DebugElement, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, flush, tick, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { LEFT_ARROW } from '@koobiq/cdk/keycodes';
import { dispatchKeyboardEvent, dispatchMouseEvent } from '@koobiq/cdk/testing';
import { Observable } from 'rxjs';
import { KbqTab, KbqTabGroup, KbqTabHeaderPosition, KbqTabSelectBy, KbqTabsModule } from './index';

describe('KbqTabGroup', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                KbqTabsModule,
                CommonModule,
                NoopAnimationsModule
            ],
            declarations: [
                SimpleTabsTestApp,
                SimpleDynamicTabsTestApp,
                BindedTabsTestApp,
                AsyncTabsTestApp,
                DisabledTabsTestApp,
                TabGroupWithSimpleApi,
                TemplateTabs,
                TabGroupWithIsActiveBinding,
                TestSelectionByIndexOrTabIdApp
            ]
        }).compileComponents();
    });

    describe('basic behavior', () => {
        let fixture: ComponentFixture<SimpleTabsTestApp>;
        let element: HTMLElement;

        beforeEach(() => {
            fixture = TestBed.createComponent(SimpleTabsTestApp);
            element = fixture.nativeElement;
        });

        it('should default to the first tab', () => {
            checkSelectedIndex(1, fixture);
        });

        it('will properly load content on first change detection pass', () => {
            fixture.detectChanges();
            expect(element.querySelectorAll('.kbq-tab-body')[1].querySelectorAll('span').length).toBe(3);
        });

        it('should change selected index on click', fakeAsync(() => {
            const component = fixture.debugElement.componentInstance;
            component.selectedIndex = 0;
            fixture.detectChanges();
            tick();
            checkSelectedIndex(0, fixture);

            // select the second tab
            fixture.debugElement.queryAll(By.css('.kbq-tab-label'))[1].nativeElement.click();
            fixture.detectChanges();
            tick();
            checkSelectedIndex(1, fixture);

            // select the third tab
            fixture.debugElement.queryAll(By.css('.kbq-tab-label'))[2].nativeElement.click();
            fixture.detectChanges();
            tick();
            checkSelectedIndex(2, fixture);
        }));

        it('should support two-way binding for selectedIndex', fakeAsync(() => {
            const component = fixture.componentInstance;
            component.selectedIndex = 0;

            fixture.detectChanges();

            const tabLabel = fixture.debugElement.queryAll(By.css('.kbq-tab-label'))[1];
            tabLabel.nativeElement.click();
            fixture.detectChanges();
            tick();

            expect(component.selectedIndex).toBe(1);
        }));

        // Note: needs to be `async` in order to fail when we expect it to.
        it('should set to correct tab on fast change', waitForAsync(() => {
            const component = fixture.componentInstance;
            component.selectedIndex = 0;
            fixture.detectChanges();

            setTimeout(() => {
                component.selectedIndex = 1;
                fixture.detectChanges();

                setTimeout(() => {
                    component.selectedIndex = 0;
                    fixture.detectChanges();
                    fixture.whenStable().then(() => expect(component.selectedIndex).toBe(0));
                }, 1);
            }, 1);
        }));

        it('should change tabs based on selectedIndex', fakeAsync(() => {
            const component = fixture.componentInstance;
            const tabComponent = fixture.debugElement.query(By.css('kbq-tab-group')).componentInstance;

            const handleSelectionSpyFn = jest.spyOn(component, 'handleSelection');

            checkSelectedIndex(1, fixture);

            tabComponent.selectedIndex = 2;

            checkSelectedIndex(2, fixture);
            tick();

            expect(handleSelectionSpyFn).toHaveBeenCalledTimes(1);
            expect(component.selectEvent.index).toBe(2);
        }));

        it('should update tab positions when selected index is changed', () => {
            fixture.detectChanges();
            const component: KbqTabGroup = fixture.debugElement.query(By.css('kbq-tab-group')).componentInstance;
            const tabs: KbqTab[] = component.tabs.toArray();

            expect(tabs[0].position).toBeLessThan(0);
            expect(tabs[1].position).toBe(0);
            expect(tabs[2].position).toBeGreaterThan(0);

            // Move to third tab
            component.selectedIndex = 2;
            fixture.detectChanges();
            expect(tabs[0].position).toBeLessThan(0);
            expect(tabs[1].position).toBeLessThan(0);
            expect(tabs[2].position).toBe(0);

            // Move to the first tab
            component.selectedIndex = 0;
            fixture.detectChanges();
            expect(tabs[0].position).toBe(0);
            expect(tabs[1].position).toBeGreaterThan(0);
            expect(tabs[2].position).toBeGreaterThan(0);
        });

        it('should clamp the selected index to the size of the number of tabs', () => {
            fixture.detectChanges();
            const component: KbqTabGroup = fixture.debugElement.query(By.css('kbq-tab-group')).componentInstance;

            // Set the index to be negative, expect first tab selected
            fixture.componentInstance.selectedIndex = -1;
            fixture.detectChanges();
            expect(component.selectedIndex).toBe(0);

            // Set the index beyond the size of the tabs, expect last tab selected
            fixture.componentInstance.selectedIndex = 3;
            fixture.detectChanges();
            expect(component.selectedIndex).toBe(2);
        });

        it('should not crash when setting the selected index to NaN', () => {
            const component = fixture.debugElement.componentInstance;

            expect(() => {
                component.selectedIndex = NaN;
                fixture.detectChanges();
            }).not.toThrow();
        });

        it('should set the isActive flag on each of the tabs', fakeAsync(() => {
            fixture.detectChanges();
            tick();

            const tabs = fixture.componentInstance.tabs.toArray();

            expect(tabs[0].isActive).toBe(false);
            expect(tabs[1].isActive).toBe(true);
            expect(tabs[2].isActive).toBe(false);

            fixture.componentInstance.selectedIndex = 2;
            fixture.detectChanges();
            tick();

            expect(tabs[0].isActive).toBe(false);
            expect(tabs[1].isActive).toBe(false);
            expect(tabs[2].isActive).toBe(true);
        }));

        it('should fire animation done event', fakeAsync(() => {
            fixture.detectChanges();

            const animationDoneSpyFn = jest.spyOn(fixture.componentInstance, 'animationDone');
            const tabLabel = fixture.debugElement.queryAll(By.css('.kbq-tab-label'))[1];
            tabLabel.nativeElement.click();
            fixture.detectChanges();
            tick();

            expect(animationDoneSpyFn).toHaveBeenCalled();
        }));

        it('should emit focusChange event on click', () => {
            const handleFocusSpyFn = jest.spyOn(fixture.componentInstance, 'handleFocus');
            fixture.detectChanges();

            const tabLabels = fixture.debugElement.queryAll(By.css('.kbq-tab-label'));

            expect(handleFocusSpyFn).toHaveBeenCalledTimes(0);

            tabLabels[2].nativeElement.click();
            fixture.detectChanges();

            expect(handleFocusSpyFn).toHaveBeenCalledTimes(1);
            expect(handleFocusSpyFn).toHaveBeenCalledWith(expect.objectContaining({ index: 2 }));
        });

        it('should emit focusChange on arrow key navigation', () => {
            const handleFocusSpyFn = jest.spyOn(fixture.componentInstance, 'handleFocus');
            fixture.detectChanges();

            const tabLabels = fixture.debugElement.queryAll(By.css('.kbq-tab-label'));
            const tabLabelContainer = fixture.debugElement.query(By.css('.kbq-tab-header__content'))
                .nativeElement as HTMLElement;

            expect(handleFocusSpyFn).toHaveBeenCalledTimes(0);

            // In order to verify that the `focusChange` event also fires with the correct
            // index, we focus the second tab before testing the keyboard navigation.
            tabLabels[2].nativeElement.click();
            fixture.detectChanges();

            expect(handleFocusSpyFn).toHaveBeenCalledTimes(1);

            dispatchKeyboardEvent(tabLabelContainer, 'keydown', LEFT_ARROW);

            expect(handleFocusSpyFn).toHaveBeenCalledTimes(2);
            expect(handleFocusSpyFn).toHaveBeenCalledWith(expect.objectContaining({ index: 1 }));
        });
    });

    describe('disable tabs', () => {
        let fixture: ComponentFixture<DisabledTabsTestApp>;
        let headerList: DebugElement;
        beforeEach(() => {
            fixture = TestBed.createComponent(DisabledTabsTestApp);
            headerList = fixture.debugElement.query(By.css('.kbq-tab-list__content'));
        });

        it('should have one disabled tab', () => {
            fixture.detectChanges();
            const labels = headerList.queryAll(By.css('[disabled]'));
            expect(labels.length).toBe(1);
        });

        it('should set the disabled flag on tab', () => {
            fixture.detectChanges();

            const tabs = fixture.componentInstance.tabs.toArray();
            let labels = headerList.queryAll(By.css('[disabled]'));
            expect(tabs[2].disabled).toBe(false);
            expect(labels.length).toBe(1);

            fixture.componentInstance.isDisabled = true;
            fixture.detectChanges();

            expect(tabs[2].disabled).toBe(true);
            labels = headerList.queryAll(By.css('[disabled]'));
            expect(labels.length).toBe(2);
        });
    });

    describe('dynamic binding tabs', () => {
        let fixture: ComponentFixture<SimpleDynamicTabsTestApp>;

        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(SimpleDynamicTabsTestApp);
            fixture.detectChanges();
            tick();
            fixture.detectChanges();
        }));

        it('should be able to add a new tab, select it, and have correct origin position', fakeAsync(() => {
            const component: KbqTabGroup = fixture.debugElement.query(By.css('kbq-tab-group')).componentInstance;

            let tabs: KbqTab[] = component.tabs.toArray();
            expect(tabs[0].origin).toBe(null);
            expect(tabs[1].origin).toBe(0);
            expect(tabs[2].origin).toBe(null);

            // Add a new tab on the right and select it, expect an origin >= than 0 (animate right)
            fixture.componentInstance.tabs.push({ label: 'New tab', content: 'to right of index' });
            fixture.componentInstance.selectedIndex = 4;
            fixture.detectChanges();
            tick();

            tabs = component.tabs.toArray();
            expect(tabs[3].origin).toBeGreaterThanOrEqual(0);

            // Add a new tab in the beginning and select it, expect an origin < than 0 (animate left)
            fixture.componentInstance.selectedIndex = 0;
            fixture.detectChanges();
            tick();

            fixture.componentInstance.tabs.push({ label: 'New tab', content: 'to left of index' });
            fixture.detectChanges();
            tick();

            tabs = component.tabs.toArray();
            expect(tabs[0].origin).toBeLessThan(0);
        }));

        it('should update selected index if the last tab removed while selected', fakeAsync(() => {
            const component: KbqTabGroup = fixture.debugElement.query(By.css('kbq-tab-group')).componentInstance;

            const numberOfTabs = component.tabs.length;
            fixture.componentInstance.selectedIndex = numberOfTabs - 1;
            fixture.detectChanges();
            tick();

            // Remove last tab while last tab is selected, expect next tab over to be selected
            fixture.componentInstance.tabs.pop();
            fixture.detectChanges();
            tick();

            expect(component.selectedIndex).toBe(numberOfTabs - 2);
        }));

        it('should maintain the selected tab if a new tab is added', () => {
            fixture.detectChanges();
            const component: KbqTabGroup = fixture.debugElement.query(By.css('kbq-tab-group')).componentInstance;

            fixture.componentInstance.selectedIndex = 1;
            fixture.detectChanges();

            // Add a new tab at the beginning.
            fixture.componentInstance.tabs.unshift({ label: 'New tab', content: 'at the start' });
            fixture.detectChanges();

            expect(component.selectedIndex).toBe(2);
            expect(component.tabs.toArray()[2].isActive).toBe(true);
        });

        it('should maintain the selected tab if a tab is removed', () => {
            // Select the second tab.
            fixture.componentInstance.selectedIndex = 1;
            fixture.detectChanges();

            const component: KbqTabGroup = fixture.debugElement.query(By.css('kbq-tab-group')).componentInstance;

            // Remove the first tab that is right before the selected one.
            fixture.componentInstance.tabs.splice(0, 1);
            fixture.detectChanges();

            // Since the first tab has been removed and the second one was selected before, the selected
            // tab moved one position to the right. Meaning that the tab is now the first tab.
            expect(component.selectedIndex).toBe(0);
            expect(component.tabs.toArray()[0].isActive).toBe(true);
        });

        it('should be able to select a new tab after creation', fakeAsync(() => {
            fixture.detectChanges();
            const component: KbqTabGroup = fixture.debugElement.query(By.css('kbq-tab-group')).componentInstance;

            fixture.componentInstance.tabs.push({ label: 'Last tab', content: 'at the end' });
            fixture.componentInstance.selectedIndex = 3;

            fixture.detectChanges();
            tick();

            expect(component.selectedIndex).toBe(3);
            expect(component.tabs.toArray()[3].isActive).toBe(true);
        }));

        it('should not fire `selectedTabChange` when the amount of tabs changes', fakeAsync(() => {
            fixture.detectChanges();
            fixture.componentInstance.selectedIndex = 1;
            fixture.detectChanges();

            // Add a new tab at the beginning.
            const handleSelectionSpyFn = jest.spyOn(fixture.componentInstance, 'handleSelection');
            fixture.componentInstance.tabs.unshift({ label: 'New tab', content: 'at the start' });
            fixture.detectChanges();
            tick();
            fixture.detectChanges();

            expect(handleSelectionSpyFn).not.toHaveBeenCalled();
        }));
    });

    describe('async tabs', () => {
        let fixture: ComponentFixture<AsyncTabsTestApp>;

        it('should show tabs when they are available', fakeAsync(() => {
            fixture = TestBed.createComponent(AsyncTabsTestApp);

            expect(fixture.debugElement.queryAll(By.css('.kbq-tab-label')).length).toBe(0);

            fixture.detectChanges();
            tick();
            fixture.detectChanges();
            tick();

            expect(fixture.debugElement.queryAll(By.css('.kbq-tab-label')).length).toBe(2);
        }));
    });

    describe('with simple api', () => {
        let fixture: ComponentFixture<TabGroupWithSimpleApi>;
        let tabGroup: KbqTabGroup;

        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(TabGroupWithSimpleApi);
            fixture.detectChanges();
            tick();

            tabGroup = fixture.debugElement.query(By.directive(KbqTabGroup)).componentInstance as KbqTabGroup;
        }));

        it('should support a tab-group with the simple api', fakeAsync(() => {
            expect(getSelectedLabel(fixture).textContent).toMatch('Junk food');
            expect(getSelectedContent(fixture).textContent).toMatch('Pizza, fries');

            tabGroup.selectedIndex = 2;
            fixture.detectChanges();
            tick();

            expect(getSelectedLabel(fixture).textContent).toMatch('Fruit');
            expect(getSelectedContent(fixture).textContent).toMatch('Apples, grapes');

            fixture.componentInstance.otherLabel = 'Chips';
            fixture.componentInstance.otherContent = 'Salt, vinegar';
            fixture.detectChanges();

            expect(getSelectedLabel(fixture).textContent).toMatch('Chips');
            expect(getSelectedContent(fixture).textContent).toMatch('Salt, vinegar');
        }));

        it('should support @ViewChild in the tab content', () => {
            expect(fixture.componentInstance.legumes).toBeTruthy();
        });

        it('should only have the active tab in the DOM', fakeAsync(() => {
            expect(fixture.nativeElement.textContent).toContain('Pizza, fries');
            expect(fixture.nativeElement.textContent).not.toContain('Peanuts');

            tabGroup.selectedIndex = 3;
            fixture.detectChanges();
            tick();

            expect(fixture.nativeElement.textContent).not.toContain('Pizza, fries');
            expect(fixture.nativeElement.textContent).toContain('Peanuts');
        }));

        it('should support setting the header position', () => {
            const tabGroupNode = fixture.debugElement.query(By.css('kbq-tab-group')).nativeElement;

            expect(tabGroupNode.classList).not.toContain('kbq-tab-group_inverted-header');

            tabGroup.headerPosition = 'below';
            fixture.detectChanges();

            expect(tabGroupNode.classList).toContain('kbq-tab-group_inverted-header');
        });
    });

    describe('lazy loaded tabs', () => {
        it('should lazy load the second tab', fakeAsync(() => {
            const fixture = TestBed.createComponent(TemplateTabs);
            fixture.detectChanges();
            tick();

            const secondLabel = fixture.debugElement.queryAll(By.css('.kbq-tab-label'))[1];
            secondLabel.nativeElement.click();
            fixture.detectChanges();
            tick();
            fixture.detectChanges();

            const child = fixture.debugElement.query(By.css('.child'));
            expect(child.nativeElement).toBeDefined();
        }));
    });

    describe('special cases', () => {
        it('should not throw an error when binding isActive to the view', fakeAsync(() => {
            const fixture = TestBed.createComponent(TabGroupWithIsActiveBinding);

            expect(() => {
                fixture.detectChanges();
                tick();
                fixture.detectChanges();
            }).not.toThrow();

            expect(fixture.nativeElement.textContent).toContain('pizza is active');
        }));
    });

    describe('with selection by activeTab input', () => {
        let fixture: ComponentFixture<TestSelectionByIndexOrTabIdApp>;
        let instance: TestSelectionByIndexOrTabIdApp;

        beforeEach(() => {
            fixture = TestBed.createComponent(TestSelectionByIndexOrTabIdApp);
            instance = fixture.componentInstance;
            fixture.detectChanges();
        });

        it('should select by number and assign number to binded property', () => {
            const indexToSelect: number = instance.tabs.length - 1;
            expect(instance.selectBy).toEqual(1);
            checkSelectedIndex(instance.selectBy as number, fixture);

            instance.selectBy = indexToSelect;
            fixture.detectChanges();
            checkSelectedIndex(indexToSelect, fixture);
            expect(typeof instance.selectBy).toEqual('number');
        });

        it('should select by string and assign string type to binded property', fakeAsync(() => {
            const indexToSelect = 0;
            instance.selectBy = instance.tabs.get(indexToSelect)!.tabId;
            expect(instance.selectBy).toEqual('first');
            fixture.detectChanges();
            checkSelectedIndex(indexToSelect, fixture);

            // check selection by click
            const tabLabels: DebugElement[] = fixture.debugElement.queryAll(By.css('.kbq-tab-label'));
            dispatchMouseEvent(tabLabels[tabLabels.length - 1].nativeElement, 'click');
            fixture.detectChanges();
            tick();

            checkSelectedIndex(tabLabels.length - 1, fixture);
            expect(typeof instance.selectBy).toEqual('string');
            expect(instance.selectBy).toEqual('last');
            flush();
        }));
    });

    /**
     * Checks that the `selectedIndex` has been updated; checks that the label and body have their
     * respective `active` classes
     */
    function checkSelectedIndex(expectedIndex: number, fixture: ComponentFixture<any>) {
        fixture.detectChanges();

        const tabComponent: KbqTabGroup = fixture.debugElement.query(By.css('kbq-tab-group')).componentInstance;
        expect(tabComponent.selectedIndex).toBe(expectedIndex);

        const tabLabelElement = fixture.debugElement.query(
            By.css(`.kbq-tab-label:nth-of-type(${expectedIndex + 1})`)
        ).nativeElement;
        expect(tabLabelElement.classList.contains('kbq-selected')).toBe(true);

        const tabContentElement = fixture.debugElement.query(
            By.css(`kbq-tab-body:nth-of-type(${expectedIndex + 1})`)
        ).nativeElement;
        expect(tabContentElement.classList.contains('kbq-tab-body__active')).toBe(true);
    }

    function getSelectedLabel(fixture: ComponentFixture<any>): HTMLElement {
        return fixture.nativeElement.querySelector('.kbq-selected');
    }

    function getSelectedContent(fixture: ComponentFixture<any>): HTMLElement {
        return fixture.nativeElement.querySelector('.kbq-tab-body__active');
    }
});

describe('nested KbqTabGroup with enabled animations', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [KbqTabsModule, NoopAnimationsModule],
            declarations: [NestedTabs]
        }).compileComponents();
    });

    it('should not throw when creating a component with nested tab groups', fakeAsync(() => {
        expect(() => {
            const fixture = TestBed.createComponent(NestedTabs);
            fixture.detectChanges();
            tick();
        }).not.toThrow();
    }));
});

@Component({
    template: `
        <kbq-tab-group
            class="tab-group"
            [(selectedIndex)]="selectedIndex"
            [headerPosition]="headerPosition"
            (animationDone)="animationDone()"
            (focusChange)="handleFocus($event)"
            (selectedTabChange)="handleSelection($event)"
        >
            <kbq-tab>
                <ng-template kbq-tab-label>Tab One</ng-template>
                Tab one content
            </kbq-tab>
            <kbq-tab>
                <ng-template kbq-tab-label>Tab Two</ng-template>
                <span>Tab</span>
                <span>two</span>
                <span>content</span>
            </kbq-tab>
            <kbq-tab>
                <ng-template kbq-tab-label>Tab Three</ng-template>
                Tab three content
            </kbq-tab>
        </kbq-tab-group>
    `
})
class SimpleTabsTestApp {
    @ViewChildren(KbqTab) tabs: QueryList<KbqTab>;
    selectedIndex: number = 1;
    focusEvent: any;
    selectEvent: any;
    headerPosition: KbqTabHeaderPosition = 'above';

    handleFocus(event: any) {
        this.focusEvent = event;
    }

    handleSelection(event: any) {
        this.selectEvent = event;
    }

    animationDone() {}
}

@Component({
    template: `
        <kbq-tab-group
            class="tab-group"
            [(selectedIndex)]="selectedIndex"
            (focusChange)="handleFocus($event)"
            (selectedTabChange)="handleSelection($event)"
        >
            <kbq-tab *ngFor="let tab of tabs">
                <ng-template kbq-tab-label>{{ tab.label }}</ng-template>
                {{ tab.content }}
            </kbq-tab>
        </kbq-tab-group>
    `
})
class SimpleDynamicTabsTestApp {
    tabs = [
        { label: 'Label 1', content: 'Content 1' },
        { label: 'Label 2', content: 'Content 2' },
        { label: 'Label 3', content: 'Content 3' }
    ];
    selectedIndex: number = 1;
    focusEvent: any;
    selectEvent: any;

    handleFocus(event: any) {
        this.focusEvent = event;
    }

    handleSelection(event: any) {
        this.selectEvent = event;
    }
}

@Component({
    template: `
        <kbq-tab-group
            class="tab-group"
            [(selectedIndex)]="selectedIndex"
        >
            <kbq-tab
                *ngFor="let tab of tabs"
                label="{{ tab.label }}"
            >
                {{ tab.content }}
            </kbq-tab>
        </kbq-tab-group>
    `
})
class BindedTabsTestApp {
    tabs = [
        { label: 'one', content: 'one' },
        { label: 'two', content: 'two' }
    ];
    selectedIndex = 0;

    addNewActiveTab(): void {
        this.tabs.push({
            label: 'new tab',
            content: 'new content'
        });
        this.selectedIndex = this.tabs.length - 1;
    }
}

@Component({
    selector: 'test-app',
    template: `
        <kbq-tab-group class="tab-group">
            <kbq-tab>
                <ng-template kbq-tab-label>Tab One</ng-template>
                Tab one content
            </kbq-tab>
            <kbq-tab disabled>
                <ng-template kbq-tab-label>Tab Two</ng-template>
                Tab two content
            </kbq-tab>
            <kbq-tab [disabled]="isDisabled">
                <ng-template kbq-tab-label>Tab Three</ng-template>
                Tab three content
            </kbq-tab>
        </kbq-tab-group>
    `
})
class DisabledTabsTestApp {
    @ViewChildren(KbqTab) tabs: QueryList<KbqTab>;
    isDisabled = false;
}

@Component({
    template: `
        <kbq-tab-group class="tab-group">
            <kbq-tab *ngFor="let tab of tabs | async">
                <ng-template kbq-tab-label>{{ tab.label }}</ng-template>
                {{ tab.content }}
            </kbq-tab>
        </kbq-tab-group>
    `
})
class AsyncTabsTestApp implements OnInit {
    tabs: Observable<any>;
    private tabsItems = [
        { label: 'one', content: 'one' },
        { label: 'two', content: 'two' }
    ];

    ngOnInit() {
        // Use ngOnInit because there is some issue with scheduling the async task in the constructor.
        this.tabs = new Observable((observer: any) => {
            setTimeout(() => observer.next(this.tabsItems));
        });
    }
}

@Component({
    template: `
        <kbq-tab-group>
            <kbq-tab label="Junk food">Pizza, fries</kbq-tab>
            <kbq-tab label="Vegetables">Broccoli, spinach</kbq-tab>
            <kbq-tab [label]="otherLabel">{{ otherContent }}</kbq-tab>
            <kbq-tab label="Legumes"><p #legumes>Peanuts</p></kbq-tab>
        </kbq-tab-group>
    `
})
class TabGroupWithSimpleApi {
    otherLabel = 'Fruit';
    otherContent = 'Apples, grapes';
    @ViewChild('legumes', { static: false }) legumes: any;
}

@Component({
    selector: 'nested-tabs',
    template: `
        <kbq-tab-group>
            <kbq-tab label="One">Tab one content</kbq-tab>
            <kbq-tab label="Two">
                Tab two content
                <kbq-tab-group [dynamicHeight]="true">
                    <kbq-tab label="Inner tab one">Inner content one</kbq-tab>
                    <kbq-tab label="Inner tab two">Inner content two</kbq-tab>
                </kbq-tab-group>
            </kbq-tab>
        </kbq-tab-group>
    `
})
class NestedTabs {}

@Component({
    selector: 'template-tabs',
    template: `
        <kbq-tab-group>
            <kbq-tab label="One">Eager</kbq-tab>
            <kbq-tab label="Two">
                <ng-template kbqTabContent>
                    <div class="child">Hi</div>
                </ng-template>
            </kbq-tab>
        </kbq-tab-group>
    `
})
class TemplateTabs {}

@Component({
    template: `
        <kbq-tab-group>
            <kbq-tab
                #pizza
                label="Junk food"
            >
                Pizza, fries
            </kbq-tab>
            <kbq-tab label="Vegetables">Broccoli, spinach</kbq-tab>
        </kbq-tab-group>

        <div *ngIf="pizza.isActive">pizza is active</div>
    `
})
class TabGroupWithIsActiveBinding {}

@Component({
    template: `
        <kbq-tab-group
            class="tab-group"
            [(activeTab)]="selectBy"
        >
            <kbq-tab tabId="first">
                <ng-template kbq-tab-label>Tab first</ng-template>
                Tab first content
            </kbq-tab>
            <kbq-tab tabId="second">
                <ng-template kbq-tab-label>Tab second</ng-template>
                <span>Tab</span>
                <span>second</span>
                <span>content</span>
            </kbq-tab>
            <kbq-tab tabId="last">
                <ng-template kbq-tab-label>Tab last</ng-template>
                Tab last content
            </kbq-tab>
        </kbq-tab-group>
    `
})
class TestSelectionByIndexOrTabIdApp {
    @ViewChildren(KbqTab) tabs: QueryList<KbqTab>;
    selectBy: KbqTabSelectBy = 1;
}
