import { Component, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KBQ_STATE_STORE, KbqStateStore } from '@koobiq/components/core';
import { KbqSidebar, KbqSidebarModule } from '@koobiq/components/sidebar';

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
    imports: [KbqSidebarModule],
    template: `
        <kbq-sidebar stateSavingKey="triage-key">
            <div kbq-sidebar-opened width="50%">opened</div>
            <div kbq-sidebar-closed>closed</div>
        </kbq-sidebar>
    `
})
class TestApp {
    readonly sidebar = viewChild.required(KbqSidebar);
}

describe('KbqSidebar redundant open assignment (triage)', () => {
    let fixture: ComponentFixture<TestApp>;
    let store: InMemoryStateStore;
    let sidebar: KbqSidebar;
    let host: HTMLElement;

    beforeEach(async () => {
        store = new InMemoryStateStore();

        TestBed.configureTestingModule({
            imports: [TestApp],
            providers: [{ provide: KBQ_STATE_STORE, useValue: store }]
        });

        fixture = TestBed.createComponent(TestApp);
        fixture.detectChanges();
        await fixture.whenStable();

        sidebar = fixture.componentInstance.sidebar();
        host = fixture.nativeElement.querySelector('kbq-sidebar');

        // The rendered width of the 50% sidebar in a 600px container.
        Object.defineProperty(host, 'offsetWidth', { configurable: true, get: () => 300 });
    });

    it('DEFECT: assigning true to an open 50% sidebar freezes its width in pixels and persists it', async () => {
        expect(host.style.width).toBe('50%');
        expect(store.store.size).toBe(0);

        sidebar.opened = true;
        fixture.detectChanges();
        await fixture.whenStable();

        expect(sidebar.opened).toBe(true);
        expect(host.style.width).toBe('300px');
        expect(store.getState('triage-key')).toEqual({ opened: true, width: '300px' });
    });

    it('DEFECT: a 50% sidebar comes back at a fixed pixel width after one close and reopen', async () => {
        sidebar.toggle();
        fixture.detectChanges();
        await fixture.whenStable();

        sidebar.toggle();
        fixture.detectChanges();
        await fixture.whenStable();

        expect(sidebar.opened).toBe(true);
        expect(host.style.width).toBe('300px');
    });
});
