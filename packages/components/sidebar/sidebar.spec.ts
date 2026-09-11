import { Component, Type, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { KBQ_STATE_STORE, KbqStateSavingService, KbqStateStore } from '@koobiq/components/core';
import { KbqSidebar, KbqSidebarModule, SidebarPositions } from './index';

describe(KbqSidebarModule.name, () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                KbqSidebarModule,
                TestSidebar
            ]
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
            sidebarComponent = fixture.debugElement.componentInstance.sidebar();
        });

        it('should render with default parameters', () => {
            expect(sidebarComponent.opened).toBeTruthy();
            expect(sidebarComponent.position()).toBe(SidebarPositions.Left);
            expect(sidebarComponent.openedContent()).toBeDefined();
            expect(sidebarComponent.closedContent()).toBeDefined();
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
            expect(sidebarComponent.position()).toBe(SidebarPositions.Left);

            testComponent.position = SidebarPositions.Right;
            fixture.detectChanges();

            expect(sidebarComponent.position()).toBe(SidebarPositions.Right);
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

            document.dispatchEvent(new KeyboardEvent('keypress', { code: 'BracketLeft' }));

            expect(toggleSpy).toHaveBeenCalledTimes(1);
        });

        it('should NOT toggle on `BracketRight` keypress', () => {
            const toggleSpy = jest.spyOn(sidebarComponent, 'toggle');

            expect(testComponent.position).toBe(SidebarPositions.Left);

            document.dispatchEvent(new KeyboardEvent('keypress', { code: 'BracketRight' }));

            expect(toggleSpy).toHaveBeenCalledTimes(0);
        });
    });
});

@Component({
    imports: [KbqSidebarModule],
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

    readonly sidebar = viewChild.required(KbqSidebar);

    readonly onStateChanged = jest.fn();
}

/** In-memory `KbqStateStore` used to make state-saving tests deterministic. */
class InMemoryStateStore implements KbqStateStore {
    readonly store = new Map<string, unknown>();

    getState(key: string): unknown {
        return this.store.has(key) ? JSON.parse(JSON.stringify(this.store.get(key))) : null;
    }

    setState(key: string, state: unknown): void {
        this.store.set(key, JSON.parse(JSON.stringify(state)));
    }

    removeState(key: string): void {
        this.store.delete(key);
    }
}

/** A sidebar nobody drives — the case persistence targets. */
@Component({
    imports: [KbqSidebarModule],
    template: `
        <kbq-sidebar
            [stateSavingKey]="stateSavingKey"
            [position]="position"
            [useStateSaving]="useStateSaving"
            (stateChanged)="onStateChanged($event)"
        >
            <div kbq-sidebar-opened [width]="openedWidth">opened</div>
            <div kbq-sidebar-closed>closed</div>
        </kbq-sidebar>
    `
})
class UncontrolledSidebar {
    readonly sidebar = viewChild.required(KbqSidebar);

    position: SidebarPositions = SidebarPositions.Left;
    useStateSaving = true;
    /** Undefined leaves the sidebar on the `inherit` width, which is not worth persisting. */
    openedWidth: string | undefined = '200px';
    /** An empty key leaves the sidebar on the key derived from its position in the document. */
    stateSavingKey = 'sidebar-key';

    readonly onStateChanged = jest.fn();
}

describe(`${KbqSidebarModule.name} state saving`, () => {
    let store: InMemoryStateStore;

    /** Creates the sidebar against `store`. Seed the store first to model what the previous visit left. */
    const create = <T>(type: Type<T>): ComponentFixture<T> => {
        TestBed.overrideProvider(KBQ_STATE_STORE, { useValue: store });

        const created = TestBed.createComponent(type);

        created.detectChanges();

        return created;
    };

    beforeEach(() => {
        store = new InMemoryStateStore();

        TestBed.configureTestingModule({
            imports: [NoopAnimationsModule, KbqSidebarModule, UncontrolledSidebar, TestSidebar]
        }).compileComponents();
    });

    it('restores the state the previous visit left', () => {
        store.setState('sidebar-key', { opened: false });

        const fixture = create(UncontrolledSidebar);

        expect(fixture.componentInstance.sidebar().opened).toBe(false);
    });

    it('restores from the new key when the key changes', () => {
        store.setState('sidebar-key', { opened: false });
        store.setState('other-key', { opened: true });

        const fixture = create(UncontrolledSidebar);

        expect(fixture.componentInstance.sidebar().opened).toBe(false);

        fixture.componentInstance.stateSavingKey = 'other-key';
        fixture.detectChanges();

        expect(fixture.componentInstance.sidebar().opened).toBe(true);
    });

    it('restores the width alongside the opened state', () => {
        store.setState('sidebar-key', { opened: true, width: '333px' });

        const fixture = create(UncontrolledSidebar);

        expect(fixture.componentInstance.sidebar().params.openedStateWidth).toBe('333px');
    });

    it('renders the closed content straight away when it restores closed', () => {
        store.setState('sidebar-key', { opened: false });

        const fixture = create(UncontrolledSidebar);

        // `internalState` drives which slot is projected, and only catches up on animation end.
        expect(fixture.nativeElement.textContent).toContain('closed');
        expect(fixture.nativeElement.textContent).not.toContain('opened');
    });

    it.each([['nonsense'], [42], [[]], [{ opened: 'yes' }], [{ width: '10px' }]])(
        'ignores an unusable payload: %p',
        (payload) => {
            store.setState('sidebar-key', payload);

            const fixture = create(UncontrolledSidebar);

            expect(fixture.componentInstance.sidebar().opened).toBe(true);
        }
    );

    it('persists when the sidebar is toggled', () => {
        const fixture = create(UncontrolledSidebar);

        fixture.componentInstance.sidebar().toggle();
        fixture.detectChanges();

        // The width is captured on the way out, and jsdom reports no layout, so it lands as `0px`.
        expect(store.getState('sidebar-key')).toEqual({ opened: false, width: '0px' });
    });

    it('persists the width the content declares', () => {
        const sidebar = create(UncontrolledSidebar).componentInstance.sidebar();

        // Straight to the state, so the setter does not capture a width on the way through.
        sidebar.saveState();

        expect(store.getState('sidebar-key')).toEqual({ opened: true, width: '200px' });
    });

    it('leaves the width out while the sidebar inherits it', () => {
        TestBed.overrideProvider(KBQ_STATE_STORE, { useValue: store });

        const fixture = TestBed.createComponent(UncontrolledSidebar);

        fixture.componentInstance.openedWidth = undefined;
        fixture.detectChanges();

        fixture.componentInstance.sidebar().saveState();

        expect(store.getState('sidebar-key')).toEqual({ opened: true });
    });

    it('persists nothing while useStateSaving is unset', () => {
        TestBed.overrideProvider(KBQ_STATE_STORE, { useValue: store });

        const fixture = TestBed.createComponent(UncontrolledSidebar);

        fixture.componentInstance.useStateSaving = false;
        fixture.detectChanges();

        fixture.componentInstance.sidebar().toggle();
        fixture.detectChanges();

        expect(store.store.size).toBe(0);
    });

    it('persists nothing while the application drives the opened state', () => {
        store.setState('sidebar-key', { opened: false });

        // `TestSidebar` binds `[opened]`, so the sidebar is controlled and must ignore what is stored.
        const fixture = create(TestSidebar);

        expect(fixture.componentInstance.sidebar().opened).toBe(true);

        fixture.componentInstance.sidebar().toggle();
        fixture.detectChanges();

        expect(store.getState('sidebar-key')).toEqual({ opened: false });
    });

    it('persists under a key derived from the document when none is given', () => {
        TestBed.overrideProvider(KBQ_STATE_STORE, { useValue: store });

        const fixture = TestBed.createComponent(UncontrolledSidebar);

        fixture.componentInstance.stateSavingKey = '';
        fixture.detectChanges();

        fixture.componentInstance.sidebar().toggle();
        fixture.detectChanges();

        expect([...store.store.keys()]).toEqual([expect.stringMatching(/^#root\d+\/kbq-sidebar$/)]);
    });

    it('clears the persisted state on request and keeps persisting afterwards', () => {
        store.setState('sidebar-key', { opened: false });

        const sidebar = create(UncontrolledSidebar).componentInstance.sidebar();

        expect(sidebar.hasSavedState).toBe(true);

        sidebar.clearSavedState();

        expect(sidebar.hasSavedState).toBe(false);
        expect(store.getState('sidebar-key')).toBeNull();

        sidebar.toggle();

        expect(store.getState('sidebar-key')).not.toBeNull();
    });

    it('registers with the state saving service and leaves it on destroy', () => {
        const fixture = create(UncontrolledSidebar);
        const service = TestBed.inject(KbqStateSavingService);

        // Mapped to plain data on purpose: deep-comparing a live directive makes jest serialize it,
        // which throws while building the diff and hides the real failure.
        expect(service.components().map(({ name, key, enabled }) => ({ name, key, enabled }))).toEqual([
            { name: 'kbq-sidebar', key: 'sidebar-key', enabled: true }
        ]);

        fixture.destroy();

        expect(service.components()).toEqual([]);
    });

    it('persists nothing when the sidebar is not in the document as it initializes', () => {
        const warn = jest.spyOn(console, 'warn').mockImplementation();

        store.setState('sidebar-key', { opened: false });

        TestBed.overrideProvider(KBQ_STATE_STORE, { useValue: store });

        const fixture = TestBed.createComponent(UncontrolledSidebar);

        // What a sidebar projected into a closed overlay looks like.
        fixture.nativeElement.remove();
        fixture.detectChanges();

        expect(fixture.componentInstance.sidebar().opened).toBe(true);
        expect(warn).not.toHaveBeenCalled();

        warn.mockRestore();
    });
});
