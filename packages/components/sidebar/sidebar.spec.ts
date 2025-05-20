import { ChangeDetectionStrategy, Component, DebugElement, Provider, Type, viewChild } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { KbqSidebar, KbqSidebarPositions } from './sidebar';
import { KbqSidebarModule } from './sidebar.module';

const createComponent = <T>(component: Type<T>, providers: Provider[] = []): ComponentFixture<T> => {
    TestBed.configureTestingModule({
        imports: [component, NoopAnimationsModule],
        providers
    });
    const fixture = TestBed.createComponent<T>(component);

    fixture.autoDetectChanges();

    return fixture;
};

const getSidebarDebugElement = (debugElement: DebugElement): DebugElement => {
    return debugElement.query(By.directive(KbqSidebar));
};

@Component({
    standalone: true,
    selector: 'test-sidebar',
    imports: [KbqSidebarModule],
    template: `
        <kbq-sidebar [(opened)]="opened" [position]="position" (openedChange)="onOpenedChange($event)">
            <div kbqSidebarOpened>kbqSidebarOpened</div>
            <div kbqSidebarClosed>kbqSidebarClosed</div>
        </kbq-sidebar>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class TestSidebar {
    readonly sidebar = viewChild.required(KbqSidebar);

    opened = true;

    position = KbqSidebarPositions.Left;

    readonly onOpenedChange = jest.fn((_event: boolean) => {});
}

describe(KbqSidebar.name, () => {
    it('should match snapshot when opened', () => {
        const { debugElement } = createComponent(TestSidebar);

        expect(getSidebarDebugElement(debugElement)).toMatchSnapshot();
    });

    it('should match snapshot when closed', fakeAsync(() => {
        const { debugElement, componentInstance } = createComponent(TestSidebar);

        componentInstance.sidebar().toggle();
        tick();

        expect(getSidebarDebugElement(debugElement)).toMatchSnapshot();
    }));

    it('should emit two-way data binding by toggle method', fakeAsync(() => {
        const { componentInstance } = createComponent(TestSidebar);

        expect(componentInstance.opened).toBe(true);

        componentInstance.sidebar().toggle();
        tick();

        expect(componentInstance.opened).toBe(false);
    }));

    it('should emit openedChange event by model change', fakeAsync(() => {
        const fixture = createComponent(TestSidebar);
        const { componentInstance } = fixture;
        const spy = jest.spyOn(componentInstance, 'onOpenedChange');

        expect(spy).toHaveBeenCalledTimes(0);

        componentInstance.opened = false;
        fixture.detectChanges();
        tick();

        expect(spy).toHaveBeenCalledTimes(1);
    }));

    xit('should emit openedChange event by toggle method', fakeAsync(() => {
        const { componentInstance } = createComponent(TestSidebar);
        const spy = jest.spyOn(componentInstance, 'onOpenedChange');

        expect(spy).toHaveBeenCalledTimes(0);

        componentInstance.sidebar().toggle();
        tick();

        expect(spy).toHaveBeenCalledTimes(1);
    }));

    xit('should emit openedChange event with correct $event value by model change', fakeAsync(() => {
        const fixture = createComponent(TestSidebar);
        const { componentInstance } = fixture;
        const spy = jest.spyOn(componentInstance, 'onOpenedChange');

        componentInstance.opened = false;
        fixture.detectChanges();
        tick();

        expect(spy).toHaveBeenCalledWith(false);
    }));

    it('should emit openedChange event with correct $event value by toggle method', fakeAsync(() => {
        const { componentInstance } = createComponent(TestSidebar);
        const spy = jest.spyOn(componentInstance, 'onOpenedChange');

        componentInstance.sidebar().toggle();
        tick();

        expect(spy).toHaveBeenCalledWith(false);
    }));

    it('should close on `BracketLeft` key click', fakeAsync(() => {
        const { componentInstance } = createComponent(TestSidebar);

        expect(componentInstance.opened).toBe(true);
        expect(componentInstance.position).toBe(KbqSidebarPositions.Left);

        document.dispatchEvent(new KeyboardEvent('keypress', { code: 'BracketLeft' }));
        tick();

        expect(componentInstance.opened).toBe(false);
    }));

    it('should ignore on `BracketRight` key click', fakeAsync(() => {
        const { componentInstance } = createComponent(TestSidebar);

        expect(componentInstance.opened).toBe(true);
        expect(componentInstance.position).toBe(KbqSidebarPositions.Left);

        document.dispatchEvent(new KeyboardEvent('keypress', { code: 'BracketRight' }));
        tick();

        expect(componentInstance.opened).toBe(true);
    }));
});
