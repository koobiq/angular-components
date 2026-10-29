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
class DynamicTabs {
    tabs = ['A', 'B', 'C'];
    selectedIndex = 1;
}

const settle = async (fixture: ComponentFixture<unknown>) => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
};

describe('triage: removing the selected tab from the middle of the list', () => {
    it('DEFECT: the tab taking its index is shown without any change event and stays isActive false', async () => {
        const fixture = TestBed.createComponent(DynamicTabs);

        await settle(fixture);

        const group = fixture.debugElement.query(By.directive(KbqTabGroup)).componentInstance as KbqTabGroup;
        const selectedLabel = () =>
            (fixture.nativeElement.querySelector('.kbq-tab-label.kbq-selected') as HTMLElement).textContent!.trim();
        const activeBody = () =>
            (fixture.nativeElement.querySelector('.kbq-tab-body__active') as HTMLElement).textContent!.trim();

        expect(selectedLabel()).toBe('B');
        expect(group.tabs.get(1)!.isActive).toBe(true);

        const events: string[] = [];

        group.selectedTabChange.subscribe(({ index }) => events.push(`selectedTabChange ${index}`));
        group.selectedIndexChange.subscribe((index) => events.push(`selectedIndexChange ${index}`));
        group.activeTabChange.subscribe((value) => events.push(`activeTabChange ${value}`));

        fixture.componentInstance.tabs = ['A', 'C'];
        await settle(fixture);

        // C is now the selected and shown tab ...
        expect(group.selectedIndex).toBe(1);
        expect(selectedLabel()).toBe('C');
        expect(activeBody()).toBe('Content C');

        // ... but the switch from B to C was never announced, and C is not marked active.
        expect(events).toEqual([]);
        expect(group.tabs.get(1)!.isActive).toBe(false);
        expect(group.tabs.toArray().some((tab) => tab.isActive)).toBe(false);
    });
});
