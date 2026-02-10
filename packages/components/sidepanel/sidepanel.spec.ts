import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, Inject, NgModule, TemplateRef, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, flush, inject, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ESCAPE } from '@koobiq/cdk/keycodes';
import { dispatchKeyboardEvent } from '@koobiq/cdk/testing';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqDropdownItem, KbqDropdownModule, KbqDropdownTrigger } from '@koobiq/components/dropdown';
import {
    KBQ_SIDEPANEL_DATA,
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

        const sidepanelRef = sidepanelService.open(templateRefFixture.componentInstance.templateRef, { data });

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
        expect(() => sidepanelService.open(SimpleSidepanelExample, { id: 'example' })).toThrowError();
    });

    it('should set default config options', () => {
        const sidepanelRef = sidepanelService.open(SimpleSidepanelExample);

        rootComponentFixture.detectChanges();

        expect(sidepanelRef.config.position).toBe(KbqSidepanelPosition.Right);
        expect(sidepanelRef.config.hasBackdrop).toBe(true);
        expect(sidepanelRef.config.disableClose).toBe(false);
        expect(sidepanelRef.config.requiredBackdrop).toBe(false);
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

    it('should have only one dark backdrop with multiple sidepanels by default', () => {
        const spy = jest.spyOn(sidepanelService, 'open');

        sidepanelService.open(SimpleSidepanelExample);
        sidepanelService.open(SimpleSidepanelExample);
        sidepanelService.open(SimpleSidepanelExample);

        expect(overlayContainerElement.querySelectorAll('.kbq-overlay-dark-backdrop').length).toBe(
            spy.mock.calls.length
        );
        // will resolve transparency using css selectors
        expect(overlayContainerElement.querySelectorAll('.cdk-overlay-transparent-backdrop').length).toBe(0);
    });

    it('should be able to add more than one dark backdrop with multiple sidepanels', () => {
        sidepanelService.open(SimpleSidepanelExample);
        sidepanelService.open(SimpleSidepanelExample, { requiredBackdrop: true });
        sidepanelService.open(SimpleSidepanelExample);

        expect(overlayContainerElement.querySelectorAll('.cdk-overlay-dark-backdrop').length).toBe(1);
        // will resolve transparency using css selectors
        expect(overlayContainerElement.querySelectorAll('.kbq-overlay-dark-backdrop').length).toBe(2);
    });

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

    it('should set focus inside modal when opened by dropdown', fakeAsync(() => {
        const activeElement: HTMLElement | null = document.activeElement as HTMLElement;
        const fixtureComponent = TestBed.createComponent(SidepanelFromDropdownComponent);
        const buttonElement = fixtureComponent.debugElement.nativeElement.querySelector('button');

        fixtureComponent.detectChanges();
        flush();

        expect(document.activeElement).not.toBe(buttonElement);

        fixtureComponent.componentInstance.trigger.open();
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

@Component({
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
    @ViewChild('trigger') trigger: KbqDropdownTrigger;

    constructor(public ss: KbqSidepanelService) {}

    showSidepanel() {
        this.ss.open(ComponentForSidepanel);
    }
}

@Component({
    template: '<div>Simple Sidepanel</div>'
})
class SimpleSidepanelExample {
    constructor(
        public sidepanelRef: KbqSidepanelRef<SimpleSidepanelExample>,
        @Inject(KBQ_SIDEPANEL_DATA) public data: any
    ) {}
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

    @ViewChild(TemplateRef, { static: true }) templateRef: TemplateRef<any>;

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
