import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KbqTabGroup, KbqTabsModule } from '@koobiq/components/tabs';

@Component({
    imports: [KbqTabsModule],
    template: `
        <kbq-tab-group [(selectedIndex)]="selectedIndex">
            @for (tab of tabs; track tab) {
                <kbq-tab [label]="tab">Content {{ tab }}</kbq-tab>
            }
        </kbq-tab-group>
    `
})
class BoundDynamicTabs {
    tabs = ['A', 'B', 'C', 'D'];
    selectedIndex = 2;
}

const settle = async (fixture: ComponentFixture<unknown>) => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
};

describe('triage: [(selectedIndex)] when tabs are added or removed', () => {
    let fixture: ComponentFixture<BoundDynamicTabs>;
    let host: BoundDynamicTabs;
    let group: KbqTabGroup;
    let events: string[];

    const selectedLabel = () =>
        (fixture.nativeElement.querySelector('.kbq-tab-label.kbq-selected') as HTMLElement).textContent!.trim();

    beforeEach(async () => {
        fixture = TestBed.createComponent(BoundDynamicTabs);
        host = fixture.componentInstance;
        await settle(fixture);

        group = fixture.debugElement.query(By.directive(KbqTabGroup)).componentInstance as KbqTabGroup;
        events = [];
        group.selectedIndexChange.subscribe((index) => events.push(`selectedIndexChange ${index}`));
        group.activeTabChange.subscribe((value) => events.push(`activeTabChange ${value}`));
    });

    it('starts with C selected', () => {
        expect(selectedLabel()).toBe('C');
    });

    it('DEFECT: removing a tab before the selected one leaves the binding on the old index, and re-binding it does nothing', async () => {
        host.tabs = ['B', 'C', 'D'];
        await settle(fixture);

        expect(selectedLabel()).toBe('C');
        expect(group.selectedIndex).toBe(1);
        expect(events).toEqual([]);
        expect(host.selectedIndex).toBe(2);

        // Index 2 is now D, but the binding already holds 2, so assigning it is no change.
        host.selectedIndex = 2;
        await settle(fixture);

        expect(selectedLabel()).toBe('C');
        expect(group.selectedIndex).toBe(1);
    });

    it('DEFECT: adding a tab before the selected one leaves the binding on the old index', async () => {
        host.tabs = ['X', 'A', 'B', 'C', 'D'];
        await settle(fixture);

        expect(selectedLabel()).toBe('C');
        expect(group.selectedIndex).toBe(3);
        expect(events).toEqual([]);
        expect(host.selectedIndex).toBe(2);
    });
});
