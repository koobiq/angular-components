import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { KbqSidebar, KbqSidebarModule, SidebarPositions } from './index';

const BRACKET_LEFT_KEYDOWN_EVENT = new KeyboardEvent('keydown', { code: 'BracketLeft' });
const BRACKET_RIGHT_KEYDOWN_EVENT = new KeyboardEvent('keydown', { code: 'BracketRight' });

describe(KbqSidebarModule.name, () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                KbqSidebarModule
            ],
            declarations: [TestSidebar]
        }).compileComponents();
    });

    describe('base', () => {
        let fixture: ComponentFixture<TestSidebar>;
        let testComponent: TestSidebar;
        let sidebarComponent: KbqSidebar;

        beforeEach(() => {
            fixture = TestBed.createComponent(TestSidebar);
            fixture.detectChanges();

            testComponent = fixture.debugElement.componentInstance;
            sidebarComponent = fixture.debugElement.componentInstance.sidebar;
        });

        it('should render with default parameters', () => {
            expect(sidebarComponent.opened).toBeTruthy();
            expect(sidebarComponent.position).toBe(SidebarPositions.Left);
            expect(sidebarComponent.openedContent).toBeDefined();
            expect(sidebarComponent.closedContent).toBeDefined();
        });

        it('should change state by property', () => {
            expect(sidebarComponent.opened).toBeTruthy();

            testComponent.state = false;
            fixture.detectChanges();

            expect(sidebarComponent.opened).toBeFalsy();

            testComponent.state = true;
            fixture.detectChanges();

            expect(sidebarComponent.opened).toBeTruthy();
        });

        it('should change state by method', () => {
            expect(sidebarComponent.opened).toBeTruthy();

            sidebarComponent.toggle();
            fixture.detectChanges();

            expect(sidebarComponent.opened).toBeFalsy();

            sidebarComponent.toggle();
            fixture.detectChanges();

            expect(sidebarComponent.opened).toBeTruthy();
        });

        it('should change position', () => {
            expect(sidebarComponent.position).toBe(SidebarPositions.Left);

            testComponent.position = SidebarPositions.Right;
            fixture.detectChanges();

            expect(sidebarComponent.position).toBe(SidebarPositions.Right);
        });

        xit('should fire change event', () => {
            const changeSpy = jest.fn();

            sidebarComponent.stateChanged.subscribe(changeSpy);

            expect(sidebarComponent.opened).toBeTruthy();

            // sidebarComponent.stateChanged.emit(true);
            sidebarComponent.toggle();
            fixture.detectChanges();

            expect(sidebarComponent.opened).toBeFalsy();

            expect(changeSpy).toHaveBeenCalled();
        });

        it('should toggle on `BracketLeft` keypress', () => {
            const toggleSpy = jest.spyOn(sidebarComponent, 'toggle');

            expect(testComponent.position).toBe(SidebarPositions.Left);

            document.dispatchEvent(BRACKET_LEFT_KEYDOWN_EVENT);
            document.dispatchEvent(BRACKET_LEFT_KEYDOWN_EVENT);

            expect(toggleSpy).toHaveBeenCalledTimes(2);
        });

        it('should NOT toggle on `BracketRight` keypress', () => {
            const toggleSpy = jest.spyOn(sidebarComponent, 'toggle');

            expect(testComponent.position).toBe(SidebarPositions.Left);

            document.dispatchEvent(BRACKET_RIGHT_KEYDOWN_EVENT);

            expect(toggleSpy).toHaveBeenCalledTimes(0);
        });
    });
});

@Component({
    template: `
        @if (showContainer) {
            <div>
                <kbq-sidebar
                    #sidebarRef="kbqSidebar"
                    [position]="position"
                    [opened]="state"
                    (stateChanged)="onStateChanged($event)"
                >
                    <div kbq-sidebar-opened>kbq-sidebar-opened</div>
                    <div kbq-sidebar-closed>kbq-sidebar-closed</div>
                </kbq-sidebar>
            </div>
        }
    `
})
class TestSidebar {
    showContainer: boolean = true;

    position: SidebarPositions = SidebarPositions.Left;

    state: boolean = true;

    @ViewChild(KbqSidebar, { static: false }) readonly sidebar: KbqSidebar;

    readonly onStateChanged = jest.fn((_newState: boolean) => {});
}
