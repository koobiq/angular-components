import { Component, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KbqSidebar, KbqSidebarModule } from '@koobiq/components/sidebar';

@Component({
    imports: [KbqSidebarModule],
    template: `
        <kbq-sidebar [useStateSaving]="false">
            <div kbq-sidebar-opened [width]="openedWidth">opened</div>
            <div kbq-sidebar-closed>closed</div>
        </kbq-sidebar>
    `
})
class BoundWidth {
    readonly sidebar = viewChild.required(KbqSidebar);

    openedWidth = '200px';
}

@Component({
    imports: [KbqSidebarModule],
    template: `
        <kbq-sidebar [useStateSaving]="false">
            @if (showOpened) {
                <div kbq-sidebar-opened width="300px">opened</div>
            }
            <div kbq-sidebar-closed>closed</div>
        </kbq-sidebar>
    `
})
class LateContent {
    readonly sidebar = viewChild.required(KbqSidebar);

    showOpened = false;
}

describe('KbqSidebar widths read once (triage)', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [BoundWidth, LateContent] });
    });

    it('DEFECT: a bound [width] changed after initialization has no effect', async () => {
        const fixture: ComponentFixture<BoundWidth> = TestBed.createComponent(BoundWidth);

        fixture.detectChanges();
        await fixture.whenStable();

        const host: HTMLElement = fixture.nativeElement.querySelector('kbq-sidebar');

        expect(host.style.width).toBe('200px');

        fixture.componentInstance.openedWidth = '300px';
        fixture.detectChanges();
        await fixture.whenStable();

        expect(fixture.nativeElement.querySelector('[kbq-sidebar-opened]')).not.toBeNull();
        expect(host.style.width).toBe('200px');
    });

    it('DEFECT: opened content added after initialization keeps the default inherit width', async () => {
        const fixture: ComponentFixture<LateContent> = TestBed.createComponent(LateContent);

        fixture.detectChanges();
        await fixture.whenStable();

        const host: HTMLElement = fixture.nativeElement.querySelector('kbq-sidebar');

        fixture.componentInstance.showOpened = true;
        fixture.detectChanges();
        await fixture.whenStable();

        expect(fixture.componentInstance.sidebar().openedContent()?.width()).toBe('300px');
        expect(fixture.nativeElement.querySelector('[kbq-sidebar-opened]')).not.toBeNull();
        expect(host.style.width).toBe('inherit');
    });
});
