import { OverlayContainer } from '@angular/cdk/overlay';
import {
    Component,
    InjectionToken,
    Injector,
    NgModule,
    TemplateRef,
    inject as injectCore,
    viewChild
} from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, flush, inject, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { KbqButtonModule } from '@koobiq/components/button';
import {
    ESCAPE,
    KBQ_STATE_STORE,
    KbqStateSavingService,
    KbqStateStore,
    dispatchKeyboardEvent
} from '@koobiq/components/core';
import { KbqDropdownItem, KbqDropdownModule, KbqDropdownTrigger } from '@koobiq/components/dropdown';
import {
    KBQ_SIDEPANEL_DATA,
    KbqSidepanelConfig,
    KbqSidepanelModule,
    KbqSidepanelPosition,
    KbqSidepanelRef,
    KbqSidepanelService
} from './index';

describe('KbqSidepanelService', () => {
    let sidepanelService: KbqSidepanelService;
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    let rootComponentFixture: ComponentFixture<RootComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [KbqSidepanelModule, SidepanelTestModule]
        }).compileComponents();

        rootComponentFixture = TestBed.createComponent(RootComponent);

        rootComponentFixture.detectChanges();
    });

    beforeEach(inject([KbqSidepanelService, OverlayContainer], (ss: KbqSidepanelService, oc: OverlayContainer) => {
        sidepanelService = ss;
        overlayContainer = oc;
        overlayContainerElement = oc.getContainerElement();
    }));

    afterEach(() => {
        overlayContainer.ngOnDestroy();
    });

    it('should open a sidepanel with a component', () => {
        const sidepanelRef = sidepanelService.open(SimpleSidepanelExample);

        expect(overlayContainerElement.textContent).toContain('Simple Sidepanel');
        expect(sidepanelRef.instance instanceof SimpleSidepanelExample).toBe(true);
    });

    it('should open a sidepanel with a template', () => {
        const templateRefFixture = TestBed.createComponent(ComponentWithTemplateForSidepanel);

        templateRefFixture.componentInstance.localValue = 'Hello';

        const data = { value: 'World!' };

        const sidepanelRef = sidepanelService.open(templateRefFixture.componentInstance.templateRef(), { data });

        expect(overlayContainerElement.textContent).toContain('Hello World!');
        expect(templateRefFixture.componentInstance.sidepanelRef).toBe(sidepanelRef);
    });

    it('should emit when sidepanel opening animation is complete', fakeAsync(() => {
        const sidepanelRef = sidepanelService.open(SimpleSidepanelExample);
        const afterOpenedCallback = jest.fn();

        sidepanelRef.afterOpened().subscribe(afterOpenedCallback);

        rootComponentFixture.detectChanges();

        expect(afterOpenedCallback).not.toHaveBeenCalled();

        flush();

        expect(afterOpenedCallback).toHaveBeenCalled();
    }));

    it('should close a sidepanel and return result', fakeAsync(() => {
        const sidepanelRef = sidepanelService.open(SimpleSidepanelExample);
        const afterCloseCallback = jest.fn();

        sidepanelRef.afterClosed().subscribe(afterCloseCallback);
        sidepanelRef.close('Result');

        rootComponentFixture.detectChanges();

        flush();

        expect(afterCloseCallback).toHaveBeenCalledWith('Result');
        expect(overlayContainerElement.querySelector('kbq-sidepanel-container')).toBeNull();
    }));

    it('should close a sidepanel via the escape key', fakeAsync(() => {
        sidepanelService.open(SimpleSidepanelExample);

        dispatchKeyboardEvent(document.body, 'keydown', ESCAPE);
        rootComponentFixture.detectChanges();

        flush();

        expect(overlayContainerElement.querySelector('kbq-sidepanel-container')).toBeNull();
    }));

    it('should close a sidepanel via the backdrop click', fakeAsync(() => {
        sidepanelService.open(SimpleSidepanelExample);

        rootComponentFixture.detectChanges();

        const backdrop = overlayContainerElement.querySelector('.cdk-overlay-backdrop') as HTMLElement;

        backdrop.click();
        flush();

        expect(overlayContainerElement.querySelector('kbq-sidepanel-container')).toBeNull();
    }));

    it('should change disableClose dynamically', fakeAsync(() => {
        const sidepanelRef = sidepanelService.open(SimpleSidepanelExample);
        const closeSpy = jest.spyOn(sidepanelRef, 'close');

        sidepanelRef.config.disableClose = true;

        overlayContainerElement.querySelector<HTMLElement>('.cdk-overlay-backdrop')!.click();
        dispatchKeyboardEvent(document.body, 'keydown', ESCAPE);

        tick();

        expect(closeSpy).toHaveBeenCalledTimes(0);
    }));

    it('should close all opened sidepanels', fakeAsync(() => {
        sidepanelService.open(SimpleSidepanelExample);
        sidepanelService.open(SimpleSidepanelExample);
        sidepanelService.open(SimpleSidepanelExample);

        expect(overlayContainerElement.querySelectorAll('kbq-sidepanel-container').length).toBe(3);

        sidepanelService.closeAll();
        rootComponentFixture.detectChanges();
        flush();

        expect(overlayContainerElement.querySelectorAll('kbq-sidepanel-container').length).toBe(0);
    }));

    it('should set the proper animation states', () => {
        const sidepanelRef = sidepanelService.open(SimpleSidepanelExample);

        expect(sidepanelRef.containerInstance.animationState).toBe('visible');

        sidepanelRef.close();

        expect(sidepanelRef.containerInstance.animationState).toBe('hidden');
    });

    it('should assign a unique id to each sidepanel', () => {
        const one = sidepanelService.open(SimpleSidepanelExample);
        const two = sidepanelService.open(SimpleSidepanelExample);

        expect(one.id).toBeDefined();
        expect(two.id).toBeDefined();

        expect(one.id).not.toBe(two.id);
    });

    it('should be able to find a sidepanel by id', () => {
        const sidepanelRef = sidepanelService.open(SimpleSidepanelExample, { id: 'example' });

        expect(sidepanelService.getSidepanelById('example')).toBe(sidepanelRef);
    });

    it('should throw when trying to open a sidepanel with the same id as another', () => {
        sidepanelService.open(SimpleSidepanelExample, { id: 'example' });
        expect(() => sidepanelService.open(SimpleSidepanelExample, { id: 'example' })).toThrow();
    });

    it('should set default config options', () => {
        const sidepanelRef = sidepanelService.open(SimpleSidepanelExample);

        rootComponentFixture.detectChanges();

        expect(sidepanelRef.config.position).toBe(KbqSidepanelPosition.Right);
        expect(sidepanelRef.config.hasBackdrop).toBe(true);
        expect(sidepanelRef.config.disableClose).toBe(false);
    });

    it('should be able to pass in data', () => {
        const config = { data: { value: 'test' } };

        const sidepanelRef = sidepanelService.open(SimpleSidepanelExample, config);

        expect(sidepanelRef.instance.data.value).toBe(config.data.value);
    });

    it('should allow for the id to be overwritten', () => {
        const sidepanelRef = sidepanelService.open(SimpleSidepanelExample, { id: 'example' });

        expect(sidepanelRef.id).toBe('example');
    });

    it('should be able to prevent closing via the escape key', fakeAsync(() => {
        sidepanelService.open(SimpleSidepanelExample, { disableClose: true });

        rootComponentFixture.detectChanges();
        dispatchKeyboardEvent(document.body, 'keydown', ESCAPE);
        rootComponentFixture.detectChanges();
        flush();

        expect(overlayContainerElement.querySelector('kbq-sidepanel-container')).not.toBeNull();
    }));

    it('should be able to prevent closing via backdrop click', fakeAsync(() => {
        sidepanelService.open(SimpleSidepanelExample, { disableClose: true });

        const backdrop = overlayContainerElement.querySelector('.cdk-overlay-backdrop') as HTMLElement;

        backdrop.click();
        flush();

        expect(overlayContainerElement.querySelector('kbq-sidepanel-container')).not.toBeNull();
    }));

    it('should have a backdrop by default', () => {
        sidepanelService.open(SimpleSidepanelExample);

        expect(overlayContainerElement.querySelector('.cdk-overlay-backdrop')).not.toBeNull();
    });

    it('should not have a backdrop with hasBackdrop false', () => {
        sidepanelService.open(SimpleSidepanelExample, { hasBackdrop: false });

        expect(overlayContainerElement.querySelector('.cdk-overlay-backdrop')).toBeNull();
    });

    it('should have only one dark backdrop with multiple sidepanels by default', fakeAsync(() => {
        const spy = jest.spyOn(sidepanelService, 'open');

        sidepanelService.open(SimpleSidepanelExample);
        sidepanelService.open(SimpleSidepanelExample);
        sidepanelService.open(SimpleSidepanelExample);

        tick(1000);

        rootComponentFixture.detectChanges();

        const backdropElements = overlayContainerElement.querySelectorAll<HTMLElement>('.kbq-overlay-dark-backdrop');

        expect(backdropElements.length).toBe(spy.mock.calls.length);

        expect(Array.from(backdropElements).filter((element) => element.style.opacity === '0').length).toBe(
            backdropElements.length - 1
        );
    }));

    it('should be able to add more than one dark backdrop with multiple sidepanels', fakeAsync(() => {
        sidepanelService.open(SimpleSidepanelExample);
        sidepanelService.open(SimpleSidepanelExample);
        sidepanelService.open(SimpleSidepanelExample);

        tick(1000);
        rootComponentFixture.detectChanges();

        const backdropElements = overlayContainerElement.querySelectorAll<HTMLElement>('.kbq-overlay-dark-backdrop');

        expect(Array.from(backdropElements).filter((element) => element.style.opacity === '0').length).toBe(
            backdropElements.length - 1
        );
    }));

    it('should be able to set custom overlay class', () => {
        sidepanelService.open(SimpleSidepanelExample, { overlayPanelClass: 'custom-overlay' });

        expect(overlayContainerElement.querySelector('.custom-overlay')).not.toBeNull();
    });

    it('should be able to set custom backdrop class', () => {
        sidepanelService.open(SimpleSidepanelExample, { backdropClass: 'custom-backdrop' });

        expect(overlayContainerElement.querySelector('.custom-backdrop')).not.toBeNull();
    });

    it('should add indent when open more than one sidepanel with same position', () => {
        sidepanelService.open(SimpleSidepanelExample);

        expect(overlayContainerElement.querySelectorAll('.kbq-sidepanel-indent').length).toBe(0);

        sidepanelService.open(SimpleSidepanelExample);

        expect(overlayContainerElement.querySelectorAll('.kbq-sidepanel-indent').length).toBe(1);
    });

    it('should close sidepanel on indent click', fakeAsync(() => {
        sidepanelService.open(SimpleSidepanelExample);

        expect(overlayContainerElement.querySelectorAll('.kbq-sidepanel-indent').length).toBe(0);

        sidepanelService.open(SimpleSidepanelExample);

        expect(overlayContainerElement.querySelectorAll('.kbq-sidepanel-indent').length).toBe(1);

        overlayContainerElement.querySelectorAll<HTMLDivElement>('.kbq-sidepanel-indent')[0]!.click();

        rootComponentFixture.detectChanges();
        tick();

        expect(overlayContainerElement.querySelectorAll('.kbq-sidepanel-indent').length).toBe(0);
    }));

    it('should NOT close sidepanel on indent click', fakeAsync(() => {
        sidepanelService.open(SimpleSidepanelExample);

        expect(overlayContainerElement.querySelectorAll('.kbq-sidepanel-indent').length).toBe(0);

        sidepanelService.open(SimpleSidepanelExample, { disableClose: true });

        expect(overlayContainerElement.querySelectorAll('.kbq-sidepanel-indent').length).toBe(1);

        overlayContainerElement.querySelectorAll<HTMLDivElement>('.kbq-sidepanel-indent')[0]!.click();

        rootComponentFixture.detectChanges();
        tick();

        expect(overlayContainerElement.querySelectorAll('.kbq-sidepanel-indent').length).toBe(1);
    }));

    it('should not add indent when open more than one sidepanel with different position', () => {
        sidepanelService.open(SimpleSidepanelExample);

        expect(overlayContainerElement.querySelectorAll('.kbq-sidepanel-indent').length).toBe(0);

        sidepanelService.open(SimpleSidepanelExample, { position: KbqSidepanelPosition.Left });

        expect(overlayContainerElement.querySelectorAll('.kbq-sidepanel-indent').length).toBe(0);
    });

    it('should be able to inject a token provided via custom injector', () => {
        const customInjector = Injector.create({
            parent: TestBed.inject(Injector),
            providers: [{ provide: CUSTOM_TOKEN, useValue: 'custom-value' }]
        });

        const sidepanelRef = sidepanelService.open(SidepanelWithCustomToken, { injector: customInjector });

        expect(sidepanelRef.instance.tokenValue).toBe('custom-value');
    });

    it('should fall back to the root injector when no custom injector is provided', () => {
        const sidepanelRef = sidepanelService.open(SimpleSidepanelExample);

        expect(sidepanelRef.instance).toBeTruthy();
    });

    it('should not trigger form submission when close button is clicked inside a form', fakeAsync(() => {
        const sidepanelRef = sidepanelService.open(SidepanelWithFormComponent);
        const submitSpy = jest.spyOn(sidepanelRef.instance, 'onSubmit');

        rootComponentFixture.detectChanges();
        flush();

        const closeButton = overlayContainerElement.querySelector<HTMLButtonElement>('button[kbq-sidepanel-close]')!;

        closeButton.click();
        rootComponentFixture.detectChanges();
        flush();

        expect(submitSpy).not.toHaveBeenCalled();
    }));

    it('renders the custom scrollbar on the body', fakeAsync(() => {
        sidepanelService.open(SidepanelWithFormComponent);

        rootComponentFixture.detectChanges();
        flush();

        const body = overlayContainerElement.querySelector('.kbq-sidepanel-body')!;

        expect(body.classList).toContain('kbq-scrollbar-viewport');
        expect(body.classList).toContain('kbq-scrollbar-viewport_native-scrollbar-hidden');
    }));

    it('should set focus inside modal when opened by dropdown', fakeAsync(() => {
        const activeElement: HTMLElement | null = document.activeElement as HTMLElement;
        const fixtureComponent = TestBed.createComponent(SidepanelFromDropdownComponent);
        const buttonElement = fixtureComponent.debugElement.nativeElement.querySelector('button');

        fixtureComponent.detectChanges();
        flush();

        expect(document.activeElement).not.toBe(buttonElement);

        fixtureComponent.componentInstance.trigger().open();
        fixtureComponent.detectChanges();
        flush();

        const dropdownItems = fixtureComponent.debugElement
            .queryAll(By.directive(KbqDropdownItem))
            .map((debugElement) => debugElement.nativeElement as HTMLButtonElement);

        dropdownItems[0].click();
        fixtureComponent.detectChanges();
        tick(1000);

        expect(activeElement).not.toBe(buttonElement);
        expect(activeElement).not.toBe(dropdownItems[0]);
        expect(activeElement).toBeTruthy();

        flush();
    }));
});

/** In-memory `KbqStateStore` used to make state-saving tests deterministic. */
class InMemoryStateStore implements KbqStateStore {
    readonly store = new Map<string, unknown>();

    keys(): string[] {
        return [...this.store.keys()];
    }

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

describe('KbqSidepanelService state saving', () => {
    const key = 'sidepanel-key';

    let sidepanelService: KbqSidepanelService;
    let stateSavingService: KbqStateSavingService;
    let overlayContainer: OverlayContainer;
    let store: InMemoryStateStore;
    let fixture: ComponentFixture<RootComponent>;

    beforeEach(() => {
        store = new InMemoryStateStore();

        TestBed.configureTestingModule({
            imports: [KbqSidepanelModule, SidepanelTestModule],
            providers: [{ provide: KBQ_STATE_STORE, useValue: store }]
        }).compileComponents();

        fixture = TestBed.createComponent(RootComponent);
        fixture.detectChanges();

        sidepanelService = TestBed.inject(KbqSidepanelService);
        stateSavingService = TestBed.inject(KbqStateSavingService);
        overlayContainer = TestBed.inject(OverlayContainer);
    });

    afterEach(() => {
        overlayContainer.ngOnDestroy();
    });

    /** Opens a sidepanel and closes it the way a user does — through the ref rather than in a group. */
    const openAndClose = (config?: KbqSidepanelConfig) => {
        const ref = sidepanelService.open(SimpleSidepanelExample, config);

        fixture.detectChanges();
        ref.close();
        flush();
    };

    it('records the sidepanel as open', () => {
        sidepanelService.open(SimpleSidepanelExample, { stateSavingKey: key });

        expect(store.getState(key)).toEqual({ opened: true });
    });

    it('records the sidepanel as closed once it is closed on its own', fakeAsync(() => {
        openAndClose({ stateSavingKey: key });

        expect(store.getState(key)).toEqual({ opened: false });
    }));

    it('keeps the flag when the sidepanels are closed as a group', fakeAsync(() => {
        sidepanelService.open(SimpleSidepanelExample, { stateSavingKey: key });

        fixture.detectChanges();
        sidepanelService.closeAll();
        flush();

        expect(store.getState(key)).toEqual({ opened: true });
    }));

    it('keeps the flag when the service is destroyed', fakeAsync(() => {
        sidepanelService.open(SimpleSidepanelExample, { stateSavingKey: key });

        fixture.detectChanges();
        sidepanelService.ngOnDestroy();
        flush();

        expect(store.getState(key)).toEqual({ opened: true });
    }));

    it('persists nothing without a state saving key', fakeAsync(() => {
        openAndClose();

        expect(store.keys()).toEqual([]);
    }));

    it('reports what is stored', () => {
        store.setState(key, { opened: true });

        expect(sidepanelService.wasOpen(key)).toBe(true);

        store.setState(key, { opened: false });

        expect(sidepanelService.wasOpen(key)).toBe(false);
    });

    it('reports a key nothing was ever stored under as not open', () => {
        expect(sidepanelService.wasOpen(key)).toBe(false);
    });

    it.each([['nonsense'], [42], [[]], [{ opened: 'yes' }], [{ open: true }]])(
        'ignores an unusable payload: %p',
        (payload) => {
            store.setState(key, payload);

            expect(sidepanelService.wasOpen(key)).toBe(false);
        }
    );

    it('stops reading and writing while state saving is turned off', () => {
        stateSavingService.setEnabled(false);

        sidepanelService.open(SimpleSidepanelExample, { stateSavingKey: key });

        expect(store.keys()).toEqual([]);

        store.setState(key, { opened: true });

        expect(sidepanelService.wasOpen(key)).toBe(false);
    });

    it('clears the persisted state on request and keeps persisting afterwards', fakeAsync(() => {
        const ref = sidepanelService.open(SimpleSidepanelExample, { stateSavingKey: key });

        fixture.detectChanges();
        sidepanelService.clearSavedState(key);

        expect(store.getState(key)).toBeNull();

        ref.close();
        flush();

        expect(store.getState(key)).toEqual({ opened: false });
    }));

    it('claims the key it writes, so it is not reported as orphaned', () => {
        sidepanelService.open(SimpleSidepanelExample, { stateSavingKey: key });

        expect(stateSavingService.components().map((ref) => ref.key)).toContain(key);
        expect(stateSavingService.orphans()).not.toContain(key);
    });

    it('claims the key it reads, which is all a closed sidepanel can do', () => {
        store.setState(key, { opened: true });

        expect(stateSavingService.orphans()).toContain(key);

        sidepanelService.wasOpen(key);

        expect(stateSavingService.orphans()).not.toContain(key);
    });

    it('releases its keys when the service is destroyed', () => {
        sidepanelService.wasOpen(key);
        sidepanelService.ngOnDestroy();

        expect(stateSavingService.components()).toEqual([]);
    });

    it('warns when two open sidepanels share a key', () => {
        const warn = jest.spyOn(console, 'warn').mockImplementation();

        sidepanelService.open(SimpleSidepanelExample, { stateSavingKey: key });
        sidepanelService.open(SimpleSidepanelExample, { stateSavingKey: key });

        expect(warn).toHaveBeenCalledWith(expect.stringContaining('already persists under the state saving key'));
    });
});

@Component({
    imports: [KbqSidepanelModule, KbqButtonModule],
    template: `
        <kbq-sidepanel-header [closeable]="true">Sidepanel Component Content</kbq-sidepanel-header>

        <kbq-sidepanel-body><div class="kbq-subheading">Sidepanel Component Body</div></kbq-sidepanel-body>

        <kbq-sidepanel-footer>
            <kbq-sidepanel-actions align="right">
                <button kbq-button kbq-sidepanel-close>
                    <span>Close</span>
                </button>
            </kbq-sidepanel-actions>
        </kbq-sidepanel-footer>
    `
})
class ComponentForSidepanel {}

@Component({
    imports: [KbqSidepanelModule, KbqButtonModule],
    template: `
        <form (ngSubmit)="onSubmit()">
            <kbq-sidepanel-body>Form content</kbq-sidepanel-body>
            <kbq-sidepanel-footer>
                <button kbq-button kbq-sidepanel-close>Close</button>
            </kbq-sidepanel-footer>
        </form>
    `
})
class SidepanelWithFormComponent {
    onSubmit() {}
}

@Component({
    selector: 'kbq-sidepanel-from-dropdown',
    imports: [
        KbqDropdownModule
    ],
    template: `
        <button #trigger="kbqDropdownTrigger" class="template-button" kbq-button [kbqDropdownTriggerFor]="dropdown">
            Open sidepanel from dropdown
        </button>
        <kbq-dropdown #dropdown>
            <ng-template kbqDropdownContent>
                <button kbq-dropdown-item (click)="showSidepanel()">open Component Sidepanel</button>
            </ng-template>
        </kbq-dropdown>
    `,
    // Testing for service with parent service
    providers: [KbqSidepanelService]
})
class SidepanelFromDropdownComponent {
    ss = injectCore(KbqSidepanelService);

    readonly trigger = viewChild.required<KbqDropdownTrigger>('trigger');

    showSidepanel() {
        this.ss.open(ComponentForSidepanel);
    }
}

const CUSTOM_TOKEN = new InjectionToken<string>('CustomToken');

@Component({
    template: '<div>Sidepanel with custom token</div>'
})
class SidepanelWithCustomToken {
    readonly tokenValue = injectCore(CUSTOM_TOKEN);
}

@Component({
    template: '<div>Simple Sidepanel</div>'
})
class SimpleSidepanelExample {
    sidepanelRef = injectCore<KbqSidepanelRef<SimpleSidepanelExample>>(KbqSidepanelRef);
    data = injectCore(KBQ_SIDEPANEL_DATA);
}

@Component({
    template: `
        <ng-template let-data let-sidepanelRef="sidepanelRef">
            {{ localValue }} {{ data?.value }}{{ setSidepanelRef(sidepanelRef) }}
        </ng-template>
    `
})
class ComponentWithTemplateForSidepanel {
    localValue: string;
    sidepanelRef: KbqSidepanelRef;

    readonly templateRef = viewChild.required(TemplateRef);

    setSidepanelRef(sidepanelRef: KbqSidepanelRef): string {
        this.sidepanelRef = sidepanelRef;

        return '';
    }
}

@Component({
    selector: 'root-component',
    template: `
        <div></div>
    `
})
class RootComponent {}

// Create a real (non-test) NgModule as a workaround for
// https://github.com/angular/angular/issues/10760
const TEST_COMPONENTS = [
    SimpleSidepanelExample,
    SidepanelWithCustomToken,
    SidepanelWithFormComponent,
    ComponentWithTemplateForSidepanel,
    RootComponent,
    SidepanelFromDropdownComponent
];

@NgModule({
    imports: [
        KbqSidepanelModule,
        NoopAnimationsModule,
        KbqDropdownModule,
        KbqButtonModule,
        ...TEST_COMPONENTS
    ],
    exports: TEST_COMPONENTS
})
class SidepanelTestModule {}
