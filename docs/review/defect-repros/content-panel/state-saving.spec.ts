import { Component, createComponent, EnvironmentInjector, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KbqContentPanelContainer, KbqContentPanelModule } from '@koobiq/components/content-panel';
import { KBQ_STATE_STORE, KbqStateStore } from '@koobiq/components/core';

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

/** `opened` is deliberately unbound: the application follows the state through `(openedChange)` only. */
@Component({
    selector: 'test-app',
    imports: [KbqContentPanelModule],
    template: `
        <kbq-content-panel-container
            [stateSavingKey]="stateSavingKey()"
            [useStateSaving]="useStateSaving()"
            (openedChange)="events.push($event)"
        >
            <div>content</div>

            <kbq-content-panel>
                <kbq-content-panel-body>body</kbq-content-panel-body>
            </kbq-content-panel>
        </kbq-content-panel-container>
    `
})
class TestApp {
    readonly container = viewChild.required(KbqContentPanelContainer);
    readonly useStateSaving = signal(true);
    readonly stateSavingKey = signal('triage-key');
    readonly events: boolean[] = [];
}

describe('content-panel triage: state saving', () => {
    let store: InMemoryStateStore;

    const configure = (): void => {
        TestBed.configureTestingModule({ providers: [{ provide: KBQ_STATE_STORE, useValue: store }] });
    };

    const panel = (host: HTMLElement): HTMLElement | null => host.querySelector('.kbq-content-panel-container__panel');

    beforeEach(() => {
        store = new InMemoryStateStore();
    });

    it('DEFECT: a container initialized while detached neither restores nor writes, even with an explicit key', () => {
        store.setState('triage-key', { opened: true, width: 420 });
        configure();

        const ref = createComponent(TestApp, { environmentInjector: TestBed.inject(EnvironmentInjector) });
        const host: HTMLElement = ref.location.nativeElement;

        // First change detection, and with it the container's ngOnInit, while the host is detached.
        ref.changeDetectorRef.detectChanges();
        expect(host.isConnected).toBe(false);

        document.body.appendChild(host);
        ref.changeDetectorRef.detectChanges();

        const container = ref.instance.container();

        // Not restored: a restore would have opened it at 420 px.
        expect(container.isOpened()).toBe(false);
        expect(container.hasSavedState).toBe(false);

        container.open();
        ref.changeDetectorRef.detectChanges();

        expect(panel(host)?.style.width).toBe('640px');
        // Not written: a write would have stored { opened: true, width: 640 }.
        expect(store.getState('triage-key')).toEqual({ opened: true, width: 420 });

        container.close();
        ref.changeDetectorRef.detectChanges();

        expect(store.getState('triage-key')).toEqual({ opened: true, width: 420 });
        expect(container.hasSavedState).toBe(false);

        ref.destroy();
        host.remove();
    });

    it('DEFECT: turning useStateSaving on after initialization never starts persisting, nor does a key change', async () => {
        configure();

        const fixture: ComponentFixture<TestApp> = TestBed.createComponent(TestApp);

        fixture.componentInstance.useStateSaving.set(false);
        fixture.detectChanges();
        await fixture.whenStable();

        fixture.componentInstance.useStateSaving.set(true);
        fixture.detectChanges();
        await fixture.whenStable();

        const container = fixture.componentInstance.container();

        container.open();
        fixture.detectChanges();
        await fixture.whenStable();

        expect(container.isOpened()).toBe(true);
        expect(store.store.size).toBe(0);
        expect(container.hasSavedState).toBe(false);

        fixture.componentInstance.stateSavingKey.set('triage-other-key');
        fixture.detectChanges();
        await fixture.whenStable();

        container.close();
        fixture.detectChanges();
        await fixture.whenStable();

        expect(store.store.size).toBe(0);
        expect(container.hasSavedState).toBe(false);
    });

    it('DEFECT: openedChange stays silent when a restored state opens the panel', async () => {
        store.setState('triage-key', { opened: true, width: 420 });
        configure();

        const fixture: ComponentFixture<TestApp> = TestBed.createComponent(TestApp);

        fixture.detectChanges();
        await fixture.whenStable();

        expect(fixture.componentInstance.container().isOpened()).toBe(true);
        expect(panel(fixture.nativeElement)).not.toBeNull();
        expect(fixture.componentInstance.events).toEqual([]);
    });
});
