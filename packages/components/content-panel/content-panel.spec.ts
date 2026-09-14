import { Component, DebugElement, model, Provider, signal, Type, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { KBQ_STATE_STORE, KbqStateSavingService, KbqStateStore } from '@koobiq/components/core';
import { KbqContentPanelContainer } from './content-panel';
import { KbqContentPanelModule } from './module';

const createComponent = <T>(component: Type<T>, providers: Provider[] = []): ComponentFixture<T> => {
    TestBed.configureTestingModule({ imports: [component, NoopAnimationsModule], providers });
    const fixture = TestBed.createComponent<T>(component);

    fixture.autoDetectChanges();

    return fixture;
};

const getCloseButtonElement = (debugElement: DebugElement): HTMLButtonElement => {
    return debugElement.nativeElement.querySelector('.kbq-content-panel-header__close-button');
};

const getContentPanelContainerElement = (debugElement: DebugElement): HTMLElement => {
    return debugElement.nativeElement.querySelector('.kbq-content-panel-container')!;
};

const getContentPanelContainerPanelElement = (debugElement: DebugElement): HTMLElement => {
    return debugElement.nativeElement.querySelector('.kbq-content-panel-container__panel')!;
};

const ESCAPE_KEY_EVENT = new KeyboardEvent('keydown', { key: 'Escape' });

@Component({
    selector: 'test-content-panel',
    imports: [KbqContentPanelModule],
    template: `
        <kbq-content-panel-container
            [width]="width()"
            [maxWidth]="maxWidth()"
            [minWidth]="minWidth()"
            [disableClose]="disableClose()"
            [disableCloseByEscape]="disableCloseByEscape()"
            [(opened)]="opened"
        >
            <div>test</div>

            <kbq-content-panel>
                <kbq-content-panel-header>
                    <div kbqContentPanelHeaderTitle>Test</div>
                    <div kbqContentPanelHeaderActions>
                        <button>test</button>
                    </div>
                </kbq-content-panel-header>

                <kbq-content-panel-body>
                    @for (_i of paragraphs; track $index) {
                        <p>test</p>
                    }
                </kbq-content-panel-body>

                <kbq-content-panel-footer>
                    <button>test</button>
                </kbq-content-panel-footer>
            </kbq-content-panel>
        </kbq-content-panel-container>
    `
})
export class TestContentPanel {
    readonly container = viewChild.required(KbqContentPanelContainer);

    readonly opened = model(false);
    readonly minWidth = signal(300);
    readonly width = signal(400);
    readonly maxWidth = signal(500);
    readonly disableClose = signal(false);
    readonly disableCloseByEscape = signal(false);

    readonly paragraphs = Array.from({ length: 100 });
}

describe(KbqContentPanelModule.name, () => {
    it('should toggle panel by KbqContentPanelContainer instance', () => {
        const { componentInstance } = createComponent(TestContentPanel);

        expect(componentInstance.opened()).toBe(false);

        componentInstance.container().toggle();
        expect(componentInstance.opened()).toBe(true);

        componentInstance.container().toggle();
        expect(componentInstance.opened()).toBe(false);
    });

    it('should open/close panel by KbqContentPanelContainer instance', () => {
        const { componentInstance } = createComponent(TestContentPanel);

        expect(componentInstance.opened()).toBe(false);

        componentInstance.container().close();
        expect(componentInstance.opened()).toBe(false);

        componentInstance.container().open();
        expect(componentInstance.opened()).toBe(true);
    });

    it('should open panel by KbqContentPanelContainer instance', () => {
        const { componentInstance } = createComponent(TestContentPanel);

        expect(componentInstance.opened()).toBe(false);

        componentInstance.container().open();
        expect(componentInstance.opened()).toBe(true);
    });

    it('should open/close panel by two-way binding', () => {
        const { componentInstance } = createComponent(TestContentPanel);

        expect(componentInstance.opened()).toBe(false);

        componentInstance.opened.set(true);
        expect(componentInstance.opened()).toBe(true);

        componentInstance.opened.set(false);
        expect(componentInstance.opened()).toBe(false);
    });

    it('should close panel by close button', () => {
        const fixture = createComponent(TestContentPanel);
        const { componentInstance, debugElement } = fixture;

        componentInstance.container().open();
        fixture.detectChanges();
        expect(componentInstance.opened()).toBe(true);

        getCloseButtonElement(debugElement).click();

        expect(componentInstance.opened()).toBe(false);
    });

    it('should hide close button by disableClose attribute', async () => {
        const fixture = createComponent(TestContentPanel);
        const { componentInstance, debugElement } = fixture;

        componentInstance.disableClose.set(true);
        componentInstance.container().open();
        await fixture.whenStable();
        expect(componentInstance.opened()).toBe(true);

        expect(getCloseButtonElement(debugElement)).toBeNull();
    });

    it('should close panel by pressing ESCAPE key', async () => {
        const fixture = createComponent(TestContentPanel);
        const { componentInstance, debugElement } = fixture;

        componentInstance.container().open();
        await fixture.whenStable();
        expect(componentInstance.opened()).toBe(true);

        getContentPanelContainerElement(debugElement).dispatchEvent(ESCAPE_KEY_EVENT);
        expect(componentInstance.opened()).toBe(false);
    });

    it('should NOT close panel by pressing ESCAPE key when disableClose attribute is provided', async () => {
        const fixture = createComponent(TestContentPanel);
        const { componentInstance, debugElement } = fixture;

        componentInstance.disableClose.set(true);
        componentInstance.container().open();
        await fixture.whenStable();
        expect(componentInstance.opened()).toBe(true);

        getContentPanelContainerElement(debugElement).dispatchEvent(ESCAPE_KEY_EVENT);
        expect(componentInstance.opened()).toBe(true);
    });

    it('should NOT close panel by pressing ESCAPE key when disableCloseByEscape attribute is provided', async () => {
        const fixture = createComponent(TestContentPanel);
        const { componentInstance, debugElement } = fixture;

        componentInstance.disableClose.set(false);
        componentInstance.disableCloseByEscape.set(true);
        componentInstance.container().open();
        await fixture.whenStable();
        expect(componentInstance.opened()).toBe(true);

        getContentPanelContainerElement(debugElement).dispatchEvent(ESCAPE_KEY_EVENT);
        expect(componentInstance.opened()).toBe(true);
    });

    it('should setup width/minWidth/maxWidth', async () => {
        const fixture = createComponent(TestContentPanel);
        const { componentInstance, debugElement } = fixture;

        componentInstance.minWidth.set(222);
        componentInstance.width.set(333);
        componentInstance.maxWidth.set(444);
        componentInstance.container().open();
        await fixture.whenStable();

        const { style } = getContentPanelContainerPanelElement(debugElement);

        expect(style.minWidth).toBe('222px');
        expect(style.width).toBe('333px');
        expect(style.maxWidth).toBe('444px');
    });
});

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

/** A panel nobody drives — the case persistence targets. `opened` is deliberately left unbound. */
@Component({
    selector: 'uncontrolled-content-panel',
    imports: [KbqContentPanelModule],
    template: `
        <kbq-content-panel-container
            [minWidth]="minWidth()"
            [maxWidth]="maxWidth()"
            [stateSavingKey]="stateSavingKey()"
            [useStateSaving]="useStateSaving()"
        >
            <div>test</div>

            <kbq-content-panel>
                <kbq-content-panel-body>body</kbq-content-panel-body>
            </kbq-content-panel>
        </kbq-content-panel-container>
    `
})
class UncontrolledContentPanel {
    readonly container = viewChild.required(KbqContentPanelContainer);

    readonly minWidth = signal(300);
    readonly maxWidth = signal(500);
    readonly useStateSaving = signal(true);
    /** An empty key leaves the panel on the key derived from its position in the document. */
    readonly stateSavingKey = signal('content-panel-key');
}

/** The same, with no `stateSavingKey` at all, so the key is derived from the document. */
@Component({
    selector: 'unkeyed-content-panel',
    imports: [KbqContentPanelModule],
    template: `
        <kbq-content-panel-container>
            <div>test</div>

            <kbq-content-panel>
                <kbq-content-panel-body>body</kbq-content-panel-body>
            </kbq-content-panel>
        </kbq-content-panel-container>
    `
})
class UnkeyedContentPanel {
    readonly container = viewChild.required(KbqContentPanelContainer);
}

describe('KbqContentPanelContainer state saving', () => {
    let store: InMemoryStateStore;

    /** Creates the panel against `store`. Seed the store first to model what the previous visit left. */
    const create = <T>(component: Type<T>): ComponentFixture<T> =>
        createComponent(component, [{ provide: KBQ_STATE_STORE, useValue: store }]);

    beforeEach(() => {
        store = new InMemoryStateStore();
    });

    it('restores the state the previous visit left', () => {
        store.setState('content-panel-key', { opened: true, width: 420 });

        const fixture = create(UncontrolledContentPanel);

        expect(fixture.componentInstance.container().isOpened()).toBe(true);
        expect(getContentPanelContainerPanelElement(fixture.debugElement)).toBeTruthy();
    });

    it('applies the restored width to the panel', () => {
        store.setState('content-panel-key', { opened: true, width: 420 });

        const fixture = create(UncontrolledContentPanel);

        expect(getContentPanelContainerPanelElement(fixture.debugElement).style.width).toBe('420px');
    });

    it('holds a restored width inside the bounds the panel is configured with now', () => {
        store.setState('content-panel-key', { opened: true, width: 5000 });

        const fixture = create(UncontrolledContentPanel);

        expect(getContentPanelContainerPanelElement(fixture.debugElement).style.width).toBe('500px');
    });

    it.each([['nonsense'], [42], [[]], [{ opened: true }], [{ opened: true, width: 'wide' }]])(
        'ignores an unusable payload: %p',
        (payload) => {
            store.setState('content-panel-key', payload);

            const container = create(UncontrolledContentPanel).componentInstance.container();

            expect(container.isOpened()).toBe(false);
        }
    );

    it('persists when the panel is opened and closed', () => {
        const container = create(UncontrolledContentPanel).componentInstance.container();

        container.open();

        expect(store.getState('content-panel-key')).toEqual({ opened: true, width: 640 });

        container.close();

        expect(store.getState('content-panel-key')).toEqual({ opened: false, width: 640 });
    });

    it('persists nothing while useStateSaving is unset', () => {
        const fixture = create(UncontrolledContentPanel);

        fixture.componentInstance.useStateSaving.set(false);
        fixture.detectChanges();

        fixture.componentInstance.container().toggle();

        expect(store.store.size).toBe(0);
    });

    it('restores the width but not the opened state while the application drives it', () => {
        store.setState('content-panel-key', { opened: true, width: 420 });

        // `TestContentPanel` binds `[(opened)]="opened"`, which starts `false`.
        const fixture = createComponent(TestContentPanel, [{ provide: KBQ_STATE_STORE, useValue: store }]);

        expect(fixture.componentInstance.container().isOpened()).toBe(false);
    });

    it('persists under a key derived from the document when none is given', () => {
        // A host of its own rather than clearing the key on this one: the key is resolved while reading,
        // and anything set afterwards arrives too late to be the key the state is stored under.
        const fixture = create(UnkeyedContentPanel);

        fixture.componentInstance.container().toggle();

        expect([...store.store.keys()]).toEqual([
            // The TestBed root element carries an `id` and is the host component's own element, so it
            // anchors the path — the same way an application's `id` on a container does.
            expect.stringMatching(/^#root\d+\/kbq-content-panel-container$/)
        ]);
    });

    it('clears the persisted state on request and keeps persisting afterwards', () => {
        store.setState('content-panel-key', { opened: true, width: 420 });

        const container = create(UncontrolledContentPanel).componentInstance.container();

        expect(container.hasSavedState).toBe(true);

        container.clearSavedState();

        expect(container.hasSavedState).toBe(false);
        expect(store.getState('content-panel-key')).toBeNull();

        container.close();

        expect(store.getState('content-panel-key')).toEqual({ opened: false, width: 420 });
    });

    it('registers with the state saving service and leaves it on destroy', () => {
        const fixture = create(UncontrolledContentPanel);
        const service = TestBed.inject(KbqStateSavingService);

        // Mapped to plain data on purpose: deep-comparing a live directive makes jest serialize it,
        // which throws while building the diff and hides the real failure.
        expect(service.components().map(({ name, key, enabled }) => ({ name, key, enabled }))).toEqual([
            { name: 'kbq-content-panel-container', key: 'content-panel-key', enabled: true }
        ]);

        fixture.destroy();

        expect(service.components()).toEqual([]);
    });
});
