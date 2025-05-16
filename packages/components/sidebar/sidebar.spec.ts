import { ChangeDetectionStrategy, Component, Provider, Type, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { KbqSidebar } from './sidebar';
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

@Component({
    standalone: true,
    selector: 'test-sidebar',
    imports: [KbqSidebarModule],
    template: `
        <kbq-sidebar [(opened)]="opened" (stateChanged)="onStateChanged($event)">
            <div kbqSidebarOpened>kbqSidebarOpened</div>
            <div kbqSidebarClosed>kbqSidebarClosed</div>
        </kbq-sidebar>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class TestSidebar {
    private readonly sidebar = viewChild.required(KbqSidebar);

    opened = true;

    readonly onStateChanged = jest.fn();

    toggleByInputChange(): void {
        this.opened = !this.opened;
    }

    toggle(): void {
        this.sidebar().toggle();
    }
}

describe(KbqSidebar.name, () => {
    it('should emit two way data binding by property change', () => {
        const { componentInstance } = createComponent(TestSidebar);

        expect(componentInstance.opened).toBe(true);
        componentInstance.toggleByInputChange();
        expect(componentInstance.opened).toBe(false);
    });

    it('should emit two way data binding by component toggle method', () => {
        const { componentInstance } = createComponent(TestSidebar);

        expect(componentInstance.opened).toBe(true);
        componentInstance.toggle();
        expect(componentInstance.opened).toBe(false);
    });

    it('should NOT emit stateChanged event by opened input change', () => {
        const { componentInstance } = createComponent(TestSidebar);
        const spy = jest.spyOn(componentInstance, 'onStateChanged');

        expect(spy).toHaveBeenCalledTimes(0);
        componentInstance.toggleByInputChange();
        expect(spy).toHaveBeenCalledTimes(0);
    });

    it('should emit stateChanged event by component toggle method', () => {
        const { componentInstance } = createComponent(TestSidebar);
        const spy = jest.spyOn(componentInstance, 'onStateChanged');

        expect(spy).toHaveBeenCalledTimes(0);
        componentInstance.toggle();
        expect(spy).toHaveBeenCalledTimes(1);
    });
});
