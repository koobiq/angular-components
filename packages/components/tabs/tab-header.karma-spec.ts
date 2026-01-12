import { Direction } from '@angular/cdk/bidi';
import { PortalModule } from '@angular/cdk/portal';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { KbqTabHeader } from './tab-header.component';
import { KbqTabLabelWrapper } from './tab-label-wrapper.directive';
import { KbqTabsModule } from './tabs.module';

describe('KbqTabHeader', () => {
    let fixture: ComponentFixture<SimpleTabHeaderApp>;
    let appComponent: SimpleTabHeaderApp;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [PortalModule, ScrollingModule, KbqTabHeader, KbqTabLabelWrapper, SimpleTabHeaderApp]
        });

        TestBed.compileComponents();
    }));

    describe('pagination', () => {
        describe('ltr', () => {
            beforeEach(() => {
                fixture = TestBed.createComponent(SimpleTabHeaderApp);
                fixture.detectChanges();

                appComponent = fixture.componentInstance;
            });

            it('should show width when tab list width exceeds container', () => {
                fixture.detectChanges();
                expect(appComponent.tabHeader.showPaginationControls).toBe(false);

                // Add enough tabs that it will obviously exceed the width
                appComponent.addTabsForScrolling();
                fixture.detectChanges();

                expect(appComponent.tabHeader.showPaginationControls).toBe(true);
            });
        });
    });
});

interface ITab {
    label: string;
    disabled?: boolean;
}

@Component({
    imports: [PortalModule, ScrollingModule, KbqTabsModule],
    template: `
        <div [dir]="dir">
            <kbq-tab-header
                [selectedIndex]="selectedIndex"
                (indexFocused)="focusedIndex = $event"
                (selectFocusedIndex)="selectedIndex = $event"
            >
                @for (tab of tabs; track tab) {
                    <div
                        class="label-content"
                        kbqTabLabelWrapper
                        style="min-width: 30px; width: 30px"
                        [disabled]="!!tab.disabled"
                        (click)="selectedIndex = i"
                    >
                        {{ tab.label }}
                    </div>
                }
            </kbq-tab-header>
        </div>
    `,
    styles: [
        `
            :host {
                width: 130px;
            }
        `
    ]
})
class SimpleTabHeaderApp {
    selectedIndex: number = 0;
    focusedIndex: number;
    disabledTabIndex = 1;
    tabs: ITab[] = [
        { label: 'tab one' },
        { label: 'tab one' },
        { label: 'tab one' },
        { label: 'tab one' }];
    dir: Direction = 'ltr';

    @ViewChild(KbqTabHeader, { static: true })
    tabHeader: KbqTabHeader;

    constructor() {
        this.tabs[this.disabledTabIndex].disabled = true;
    }

    addTabsForScrolling() {
        this.tabs.push({ label: 'new' }, { label: 'new' }, { label: 'new' }, { label: 'new' });
    }
}
