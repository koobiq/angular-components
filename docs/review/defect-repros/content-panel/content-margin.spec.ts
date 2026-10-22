import { Component, signal, viewChild } from '@angular/core';
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

@Component({
    selector: 'test-app',
    imports: [KbqContentPanelModule],
    template: `
        <kbq-content-panel-container
            stateSavingKey="triage-margin"
            [useStateSaving]="useStateSaving()"
            [width]="width()"
            [minWidth]="minWidth()"
            [maxWidth]="maxWidth()"
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
    readonly useStateSaving = signal(false);
    readonly width = signal(640);
    readonly minWidth = signal(480);
    readonly maxWidth = signal(800);
}

describe('content-panel triage: content margin from the unclamped width', () => {
    let store: InMemoryStateStore;

    const create = async (setup: (app: TestApp) => void): Promise<ComponentFixture<TestApp>> => {
        TestBed.configureTestingModule({ providers: [{ provide: KBQ_STATE_STORE, useValue: store }] });
        const fixture = TestBed.createComponent(TestApp);

        setup(fixture.componentInstance);
        fixture.detectChanges();
        await fixture.whenStable();

        return fixture;
    };

    const open = async (fixture: ComponentFixture<TestApp>): Promise<void> => {
        fixture.componentInstance.container().open();
        fixture.detectChanges();
        await fixture.whenStable();
    };

    const scrollbar = (fixture: ComponentFixture<TestApp>): HTMLElement =>
        fixture.nativeElement.querySelector('.kbq-content-panel-container__scrollbar');
    const panel = (fixture: ComponentFixture<TestApp>): HTMLElement =>
        fixture.nativeElement.querySelector('.kbq-content-panel-container__panel');

    beforeEach(() => {
        store = new InMemoryStateStore();
    });

    it('DEFECT: a width above maxWidth leaves the content a margin of the unclamped width', async () => {
        const fixture = await create((app) => {
            app.width.set(900);
            app.maxWidth.set(800);
        });

        await open(fixture);

        // CSS max-width holds the panel at 800 px, but the content keeps 900 + 16 px of room: a 100 px gap.
        expect(panel(fixture).style.width).toBe('900px');
        expect(panel(fixture).style.maxWidth).toBe('800px');
        expect(scrollbar(fixture).style.marginRight).toBe('916px');
    });

    it('DEFECT: a width below minWidth leaves the content a margin smaller than the panel', async () => {
        const fixture = await create((app) => {
            app.width.set(300);
            app.minWidth.set(480);
        });

        await open(fixture);

        // CSS min-width holds the panel at 480 px, so 316 px of margin lets the content run 164 px under it.
        expect(panel(fixture).style.width).toBe('300px');
        expect(panel(fixture).style.minWidth).toBe('480px');
        expect(scrollbar(fixture).style.marginRight).toBe('316px');
    });

    it('DEFECT: a double-click reset brings back the unclamped width after a clamped restore', async () => {
        store.setState('triage-margin', { opened: true, width: 700 });

        const fixture = await create((app) => {
            app.useStateSaving.set(true);
            app.width.set(900);
            app.maxWidth.set(800);
        });

        expect(scrollbar(fixture).style.marginRight).toBe('716px');

        const resizer: HTMLElement = fixture.nativeElement.querySelector('.kbq-content-panel-container__panel-resizer');

        resizer.dispatchEvent(new MouseEvent('dblclick', { bubbles: true, cancelable: true }));
        fixture.detectChanges();
        await fixture.whenStable();

        expect(panel(fixture).style.width).toBe('900px');
        expect(panel(fixture).style.maxWidth).toBe('800px');
        expect(scrollbar(fixture).style.marginRight).toBe('916px');
        expect(store.getState('triage-margin')).toEqual({ opened: true, width: 900 });
    });
});
