import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KbqTabSelectBy, KbqTabsModule } from '@koobiq/components/tabs';

@Component({
    imports: [KbqTabsModule],
    template: `
        <kbq-tab-group [(activeTab)]="activeTab">
            <kbq-tab label="First" tabId="first">First content</kbq-tab>
            <kbq-tab label="Second" tabId="second">Second content</kbq-tab>
            <kbq-tab label="Third">Third content</kbq-tab>
        </kbq-tab-group>
    `
})
class StringActiveTab {
    activeTab: KbqTabSelectBy | null = 'second';
}

const settle = async (fixture: ComponentFixture<unknown>) => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
};

describe('triage: activeTab bound to a string and a tab without tabId', () => {
    it('DEFECT: clicking the tab without tabId selects the first tab and emits null', async () => {
        const fixture = TestBed.createComponent(StringActiveTab);

        await settle(fixture);

        const labels: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('.kbq-tab-label'));
        const selectedLabel = () =>
            (fixture.nativeElement.querySelector('.kbq-tab-label.kbq-selected') as HTMLElement).textContent!.trim();

        expect(selectedLabel()).toBe('Second');

        labels[2].click();
        await settle(fixture);

        expect(selectedLabel()).toBe('First');
        expect(fixture.componentInstance.activeTab).toBeNull();
    });
});
