import { Dialog } from '@angular/cdk/dialog';
import { OverlayContainer, ScrollStrategy } from '@angular/cdk/overlay';
import { Location } from '@angular/common';
import { SpyLocation } from '@angular/common/testing';
import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    inject,
    Provider,
    TemplateRef,
    Type,
    viewChild
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { lastValueFrom } from 'rxjs';
import { KBQ_ACTIONS_PANEL_DATA, KBQ_ACTIONS_PANEL_OVERLAY_SELECTOR, KbqActionsPanel } from './actions-panel';
import { KbqActionsPanelConfig, kbqActionsPanelDefaultConfigProvider } from './actions-panel-config';
import { KbqActionsPanelRef } from './actions-panel-ref';
import { KBQ_ACTIONS_PANEL_SCOPED_OVERLAY_CONTAINER_SELECTOR } from './actions-panel-scoped-overlay-container';
import { KbqActionsPanelModule } from './module';

const createComponent = <T>(component: Type<T>, providers: Provider[] = []): ComponentFixture<T> => {
    TestBed.configureTestingModule({
        imports: [component, NoopAnimationsModule],
        providers: [{ provide: Location, useClass: SpyLocation }, ...providers]
    });
    const fixture = TestBed.createComponent<T>(component);

    fixture.autoDetectChanges();

    return fixture;
};

const getOverlayContainerElement = (): HTMLElement => {
    return TestBed.inject(OverlayContainer).getContainerElement();
};

const getOverlayPaneElement = (): HTMLElement => {
    return getOverlayContainerElement().querySelector('.cdk-overlay-pane')!;
};

const getActionsPanelContainerElement = (): HTMLElement => {
    return getOverlayContainerElement().querySelector('.kbq-actions-panel-container')!;
};

const getLocation = (): SpyLocation => {
    return TestBed.inject(Location) as SpyLocation;
};

const getActionsPanelDataElement = (): HTMLElement => {
    return getActionsPanelContainerElement().querySelector('#actionsPanel-data')!;
};

const getActionsPanelAction2Element = (): HTMLElement => {
    return getActionsPanelContainerElement().querySelector('#actionsPanel-action2')!;
};

const getActionsPanelCloseButton = (): HTMLElement => {
    return getActionsPanelContainerElement().querySelector('.kbq-actions-panel-container__close-button')!;
};

@Component({
    selector: 'actions-panel-component',
    template: `
        <div id="actionsPanel-data">{{ data }}</div>
        <button id="actionsPanel-action1">Action1</button>
        <button id="actionsPanel-action2" (click)="actionsPanelRef.close()">Action2</button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActionsPanelComponent {
    readonly data = inject(KBQ_ACTIONS_PANEL_DATA);
    readonly actionsPanelRef = inject(KbqActionsPanelRef);
}

@Component({
    selector: 'actions-panel-controller',
    template: `
        <ng-template #actionsPanel let-data let-actionsPanelRef="actionsPanelRef">
            <div id="actionsPanel-data">{{ data }}</div>
            <button id="actionsPanel-action1">Action1</button>
            <button id="actionsPanel-action2" (click)="actionsPanelRef.close()">Action2</button>
        </ng-template>
    `,
    providers: [KbqActionsPanel],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActionsPanelController {
    readonly actionsPanel = inject(KbqActionsPanel, { self: true });
    readonly template = viewChild.required('actionsPanel', { read: TemplateRef });
    readonly component = ActionsPanelComponent;
    readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

    openFromTemplate<D = string>(config?: KbqActionsPanelConfig<D>): KbqActionsPanelRef {
        return this.actionsPanel.open(this.template(), config);
    }

    openFromComponent<D = string>(config?: KbqActionsPanelConfig<D>): KbqActionsPanelRef<ActionsPanelComponent> {
        return this.actionsPanel.open(this.component, config);
    }

    close<R = string>(result?: R): void {
        this.actionsPanel.close(result);
    }
}

const fakeOverlayContainerSelector = 'TEST_CUSTOM_OVERLAY_CONTAINER';

/** Application-wide `OverlayContainer` replacement, marking its element so that tests can recognize it. */
class FakeOverlayContainer extends OverlayContainer {
    override getContainerElement(): HTMLElement {
        const containerElement = super.getContainerElement();

        containerElement.classList.add(fakeOverlayContainerSelector);

        return containerElement;
    }
}

describe(KbqActionsPanelModule.name, () => {
    it('should apply containerClass', () => {
        const { componentInstance } = createComponent(ActionsPanelController);

        componentInstance.openFromTemplate({ containerClass: 'customContainerClass' });
        expect(getActionsPanelContainerElement().classList.contains('customContainerClass')).toBeTruthy();
    });

    it('should apply overlayPanelClass', () => {
        const { componentInstance } = createComponent(ActionsPanelController);

        componentInstance.openFromTemplate({ overlayPanelClass: 'customOverlayPanelClass' });
        expect(getOverlayPaneElement().classList.contains('customOverlayPanelClass')).toBeTruthy();
    });

    it('should contain KBQ_ACTIONS_PANEL_OVERLAY_SELECTOR', () => {
        const { componentInstance } = createComponent(ActionsPanelController);

        componentInstance.openFromTemplate();
        expect(getOverlayPaneElement().classList.contains(KBQ_ACTIONS_PANEL_OVERLAY_SELECTOR)).toBeTruthy();
    });

    it('should open/close from template', async () => {
        const fixture = createComponent(ActionsPanelController);
        const { componentInstance } = fixture;

        componentInstance.openFromTemplate();
        expect(getActionsPanelContainerElement()).toBeInstanceOf(HTMLElement);
        componentInstance.close();
        await fixture.whenStable();
        expect(getActionsPanelContainerElement()).toBeNull();
    });

    it('should open/close from component', async () => {
        const fixture = createComponent(ActionsPanelController);
        const { componentInstance } = fixture;

        componentInstance.openFromComponent();
        expect(getActionsPanelContainerElement()).toBeInstanceOf(HTMLElement);
        componentInstance.close();
        await fixture.whenStable();
        expect(getActionsPanelContainerElement()).toBeNull();
    });

    it('should apply width', () => {
        const { componentInstance } = createComponent(ActionsPanelController);

        componentInstance.openFromTemplate({ width: '500px' });
        expect(getOverlayPaneElement().style.width).toBe('500px');
    });

    it('should apply maxWidth', () => {
        const { componentInstance } = createComponent(ActionsPanelController);

        componentInstance.openFromTemplate({ maxWidth: 500 });
        expect(getOverlayPaneElement().style.maxWidth).toBe('500px');
    });

    it('should apply minWidth', () => {
        const { componentInstance } = createComponent(ActionsPanelController);

        componentInstance.openFromTemplate({ minWidth: '50%' });
        expect(getOverlayPaneElement().style.minWidth).toBe('50%');
    });

    it('should close on ESCAPE', () => {
        const { componentInstance } = createComponent(ActionsPanelController);

        componentInstance.openFromTemplate();
        expect(getActionsPanelContainerElement()).toBeInstanceOf(HTMLElement);
        getActionsPanelContainerElement().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        expect(getActionsPanelContainerElement()).toBeNull();
    });

    it('should not close on ESCAPE', () => {
        const { componentInstance } = createComponent(ActionsPanelController);

        componentInstance.openFromTemplate({ disableClose: true });
        expect(getActionsPanelContainerElement()).toBeInstanceOf(HTMLElement);
        getActionsPanelContainerElement().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        expect(getActionsPanelContainerElement()).toBeInstanceOf(HTMLElement);
    });

    it('should close on close button click', async () => {
        const fixture = createComponent(ActionsPanelController);
        const { componentInstance } = fixture;

        componentInstance.openFromTemplate();
        expect(getActionsPanelContainerElement()).toBeInstanceOf(HTMLElement);
        getActionsPanelCloseButton().click();
        await fixture.whenStable();
        expect(getActionsPanelContainerElement()).toBeNull();
    });

    it('should not display close button', () => {
        const { componentInstance } = createComponent(ActionsPanelController);

        componentInstance.openFromTemplate({ disableClose: true });
        expect(getActionsPanelCloseButton()).toBeNull();
    });

    it('should not display backdrop', () => {
        const { componentInstance } = createComponent(ActionsPanelController);

        componentInstance.openFromTemplate();
        expect(getOverlayContainerElement().querySelector('.cdk-overlay-backdrop')).toBeNull();
    });

    it('should close on navigation', async () => {
        const fixture = createComponent(ActionsPanelController);
        const { componentInstance } = fixture;

        componentInstance.openFromTemplate();
        expect(getActionsPanelContainerElement()).toBeInstanceOf(HTMLElement);
        getLocation().simulateUrlPop('');
        await fixture.whenStable();
        expect(getActionsPanelContainerElement()).toBeNull();
    });

    it('should not close on navigation', async () => {
        const fixture = createComponent(ActionsPanelController);
        const { componentInstance } = fixture;

        componentInstance.openFromTemplate({ closeOnNavigation: false });
        expect(getActionsPanelContainerElement()).toBeInstanceOf(HTMLElement);
        getLocation().simulateUrlPop('');
        await fixture.whenStable();
        expect(getActionsPanelContainerElement()).toBeInstanceOf(HTMLElement);
    });

    it('should close on destroy', async () => {
        const fixture = createComponent(ActionsPanelController);
        const { componentInstance } = fixture;

        componentInstance.openFromTemplate();
        expect(getActionsPanelContainerElement()).toBeInstanceOf(HTMLElement);
        fixture.destroy();
        await fixture.whenStable();
        expect(getActionsPanelContainerElement()).toBeNull();
    });

    it('should return ActionsPanelRef on open', () => {
        const { componentInstance } = createComponent(ActionsPanelController);
        const actionsPanelRef = componentInstance.openFromTemplate();

        expect(actionsPanelRef).toBeInstanceOf(KbqActionsPanelRef);
    });

    it('should close by ActionsPanelRef', async () => {
        const fixture = createComponent(ActionsPanelController);
        const { componentInstance } = fixture;
        const actionsPanelRef = componentInstance.openFromTemplate();

        expect(getActionsPanelContainerElement()).toBeInstanceOf(HTMLElement);
        actionsPanelRef.close();
        await fixture.whenStable();
        expect(getActionsPanelContainerElement()).toBeNull();
    });

    it('should close with result', async () => {
        const fixture = createComponent(ActionsPanelController);
        const { componentInstance } = fixture;
        const actionsPanelRef = componentInstance.openFromTemplate();

        expect(getActionsPanelContainerElement()).toBeInstanceOf(HTMLElement);
        const afterClosed = lastValueFrom(actionsPanelRef.afterClosed);

        componentInstance.close('customResult');
        expect(await afterClosed).toBe('customResult');
    });

    it('should close by ActionsPanelRef with result', async () => {
        const fixture = createComponent(ActionsPanelController);
        const { componentInstance } = fixture;
        const actionsPanelRef = componentInstance.openFromTemplate();

        expect(getActionsPanelContainerElement()).toBeInstanceOf(HTMLElement);
        const afterClosed = lastValueFrom(actionsPanelRef.afterClosed);

        actionsPanelRef.close('customResult');
        expect(await afterClosed).toBe('customResult');
    });

    it('should emit afterClosed on close', async () => {
        const fixture = createComponent(ActionsPanelController);
        const { componentInstance } = fixture;
        const actionsPanelRef = componentInstance.openFromTemplate();
        const spy = jest.fn();

        actionsPanelRef.afterClosed.subscribe(spy);
        componentInstance.close();
        await fixture.whenStable();
        expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should emit beforeClosed synchronously on close, before afterClosed', async () => {
        const fixture = createComponent(ActionsPanelController);
        const { componentInstance } = fixture;
        const actionsPanelRef = componentInstance.openFromTemplate();
        const emitted: string[] = [];

        actionsPanelRef.beforeClosed.subscribe(() => emitted.push('beforeClosed'));
        actionsPanelRef.afterClosed.subscribe(() => emitted.push('afterClosed'));

        componentInstance.close();
        expect(emitted).toEqual(['beforeClosed']);

        await fixture.whenStable();
        expect(emitted).toEqual(['beforeClosed', 'afterClosed']);
    });

    it('should emit beforeClosed with result', async () => {
        const { componentInstance } = createComponent(ActionsPanelController);
        const actionsPanelRef = componentInstance.openFromTemplate();
        const beforeClosed = lastValueFrom(actionsPanelRef.beforeClosed);

        componentInstance.close('customResult');
        expect(await beforeClosed).toBe('customResult');
    });

    it('should complete beforeClosed after it emits', () => {
        const { componentInstance } = createComponent(ActionsPanelController);
        const actionsPanelRef = componentInstance.openFromTemplate();
        const completeSpy = jest.fn();

        actionsPanelRef.beforeClosed.subscribe({ complete: completeSpy });
        componentInstance.close();
        expect(completeSpy).toHaveBeenCalledTimes(1);
    });

    it('should not emit beforeClosed again when close is called a second time', () => {
        const { componentInstance } = createComponent(ActionsPanelController);
        const actionsPanelRef = componentInstance.openFromTemplate();
        const spy = jest.fn();

        actionsPanelRef.beforeClosed.subscribe(spy);
        componentInstance.close();
        actionsPanelRef.close();
        expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should emit beforeOpened synchronously on open, before afterOpened', async () => {
        const fixture = createComponent(ActionsPanelController);
        const { componentInstance } = fixture;
        const emitted: string[] = [];
        const actionsPanelRef = componentInstance.openFromTemplate();

        actionsPanelRef.beforeOpened.subscribe(() => emitted.push('beforeOpened'));
        actionsPanelRef.afterOpened.subscribe(() => emitted.push('afterOpened'));
        expect(emitted).toEqual(['beforeOpened']);

        await fixture.whenStable();
        expect(emitted).toEqual(['beforeOpened', 'afterOpened']);
    });

    it('should replay beforeOpened to subscribers that missed the synchronous emission', () => {
        const { componentInstance } = createComponent(ActionsPanelController);
        const actionsPanelRef = componentInstance.openFromTemplate();
        const spy = jest.fn();

        // open() has already run by the time openFromTemplate() returns, so this subscription
        // happens after the real emission — it should still receive the replayed value.
        actionsPanelRef.beforeOpened.subscribe(spy);
        expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should complete beforeOpened after it emits', () => {
        const { componentInstance } = createComponent(ActionsPanelController);
        const actionsPanelRef = componentInstance.openFromTemplate();
        const completeSpy = jest.fn();

        actionsPanelRef.beforeOpened.subscribe({ complete: completeSpy });
        expect(completeSpy).toHaveBeenCalledTimes(1);
    });

    it('should emit afterOpened on open', async () => {
        const fixture = createComponent(ActionsPanelController);
        const { componentInstance } = fixture;
        const actionsPanelRef = componentInstance.openFromTemplate();
        const spy = jest.fn();

        actionsPanelRef.afterOpened.subscribe(spy);
        await fixture.whenStable();
        expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should not autoFocus on open', async () => {
        const fixture = createComponent(ActionsPanelController);
        const { componentInstance } = fixture;

        expect(document.activeElement!.tagName).toBe('BODY');
        componentInstance.openFromTemplate();
        await fixture.whenStable();
        expect(document.activeElement!.tagName).toBe('BODY');
    });

    it('should apply RTL direction', async () => {
        const fixture = createComponent(ActionsPanelController);
        const { componentInstance } = fixture;

        componentInstance.openFromTemplate({ direction: 'rtl' });
        await fixture.whenStable();
        expect(getActionsPanelContainerElement().classList.contains('kbq-actions-panel-container_rtl')).toBeTruthy();
    });

    it('should inject data to component', () => {
        const { componentInstance } = createComponent(ActionsPanelController);

        componentInstance.openFromComponent({ data: 'customData' });
        expect(getActionsPanelDataElement().textContent).toBe('customData');
    });

    it('should provide data from template context', () => {
        const { componentInstance } = createComponent(ActionsPanelController);

        componentInstance.openFromTemplate({ data: 'customData' });
        expect(getActionsPanelDataElement().textContent).toBe('customData');
    });

    it('should inject ActionsPanelRef to component', async () => {
        const fixture = createComponent(ActionsPanelController);
        const { componentInstance } = fixture;

        componentInstance.openFromComponent();
        expect(getActionsPanelContainerElement()).toBeInstanceOf(HTMLElement);
        getActionsPanelAction2Element().click();
        await fixture.whenStable();
        expect(getActionsPanelContainerElement()).toBeNull();
    });

    it('should provide ActionsPanelRef from template context', async () => {
        const fixture = createComponent(ActionsPanelController);
        const { componentInstance } = fixture;

        componentInstance.openFromTemplate();
        expect(getActionsPanelContainerElement()).toBeInstanceOf(HTMLElement);
        getActionsPanelAction2Element().click();
        await fixture.whenStable();
        expect(getActionsPanelContainerElement()).toBeNull();
    });

    it('should apply scrollStrategy', () => {
        const { componentInstance } = createComponent(ActionsPanelController);
        const scrollStrategy: ScrollStrategy = {
            attach: () => {},
            enable: jest.fn(),
            disable: () => {}
        };

        componentInstance.openFromTemplate({ scrollStrategy: () => scrollStrategy });
        expect(scrollStrategy.enable).toHaveBeenCalledTimes(1);
    });

    it('should apply global custom OverlayContainer by providers', () => {
        const { componentInstance } = createComponent(ActionsPanelController, [
            { provide: OverlayContainer, useClass: FakeOverlayContainer }
        ]);

        componentInstance.openFromTemplate();

        expect(getOverlayContainerElement().classList.contains(fakeOverlayContainerSelector)).toBeTruthy();
    });

    it('should apply containerClass as array', () => {
        const { componentInstance } = createComponent(ActionsPanelController);

        componentInstance.openFromTemplate({ containerClass: ['classA', 'classB'] });
        expect(getActionsPanelContainerElement().classList.contains('classA')).toBeTruthy();
        expect(getActionsPanelContainerElement().classList.contains('classB')).toBeTruthy();
    });

    it('should apply overlayPanelClass as array', () => {
        const { componentInstance } = createComponent(ActionsPanelController);

        componentInstance.openFromTemplate({ overlayPanelClass: ['classA', 'classB'] });
        expect(getOverlayPaneElement().classList.contains('classA')).toBeTruthy();
        expect(getOverlayPaneElement().classList.contains('classB')).toBeTruthy();
    });

    it('should close previously opened panel when opening a new one', async () => {
        const fixture = createComponent(ActionsPanelController);
        const { componentInstance } = fixture;

        const firstRef = componentInstance.openFromTemplate();

        expect(getActionsPanelContainerElement()).toBeInstanceOf(HTMLElement);

        const afterClosed = lastValueFrom(firstRef.afterClosed);

        componentInstance.openFromTemplate();
        await fixture.whenStable();

        await expect(afterClosed).resolves.toBeUndefined();
        // New panel is now open
        expect(getActionsPanelContainerElement()).toBeInstanceOf(HTMLElement);
    });

    it('should apply kbqActionsPanelDefaultConfigProvider', () => {
        const { componentInstance } = createComponent(ActionsPanelController, [
            kbqActionsPanelDefaultConfigProvider({ disableClose: true })
        ]);

        componentInstance.openFromTemplate();
        expect(getActionsPanelCloseButton()).toBeNull();
    });

    it('should render inside the element provided as overlayContainer', () => {
        const { componentInstance } = createComponent(ActionsPanelController);
        const hostElement = componentInstance.elementRef.nativeElement;

        componentInstance.openFromTemplate({ overlayContainer: { nativeElement: hostElement } });

        const paneElement = hostElement.querySelector(`.${KBQ_ACTIONS_PANEL_OVERLAY_SELECTOR}`);

        expect(paneElement).not.toBeNull();
        expect(getOverlayContainerElement().querySelector(`.${KBQ_ACTIONS_PANEL_OVERLAY_SELECTOR}`)).toBeNull();
    });

    it('should keep the scoped container as an only child, so that CDK has no siblings to aria-hide', () => {
        const { componentInstance } = createComponent(ActionsPanelController);
        const hostElement = componentInstance.elementRef.nativeElement;

        componentInstance.openFromTemplate({ overlayContainer: { nativeElement: hostElement } });

        const wrapperElement = hostElement.querySelector(`.${KBQ_ACTIONS_PANEL_SCOPED_OVERLAY_CONTAINER_SELECTOR}`)!;

        expect(wrapperElement.children.length).toBe(1);
        expect(
            Array.from(hostElement.children).some((child) => child.getAttribute('aria-hidden') === 'true')
        ).toBeFalsy();
    });

    it('should promote a static overlayContainer to a containing block and restore it on close', async () => {
        const { componentInstance } = createComponent(ActionsPanelController);
        const hostElement = componentInstance.elementRef.nativeElement;
        const actionsPanelRef = componentInstance.openFromTemplate({
            overlayContainer: { nativeElement: hostElement }
        });

        expect(hostElement.style.position).toBe('relative');

        actionsPanelRef.close();
        await lastValueFrom(actionsPanelRef.afterClosed);

        expect(hostElement.style.position).toBe('');
    });

    it('should leave an already positioned overlayContainer untouched', async () => {
        const { componentInstance } = createComponent(ActionsPanelController);
        const hostElement = componentInstance.elementRef.nativeElement;

        hostElement.style.position = 'absolute';

        const actionsPanelRef = componentInstance.openFromTemplate({
            overlayContainer: { nativeElement: hostElement }
        });

        expect(hostElement.style.position).toBe('absolute');

        actionsPanelRef.close();
        await lastValueFrom(actionsPanelRef.afterClosed);

        expect(hostElement.style.position).toBe('absolute');
    });

    it('should keep the overlayContainer promoted while a replacing panel overlaps the closing one', async () => {
        const { componentInstance } = createComponent(ActionsPanelController);
        const hostElement = componentInstance.elementRef.nativeElement;
        const overlayContainer = { nativeElement: hostElement };
        // The replacement's overlay is created before the previous panel finishes closing, so the two scoped
        // containers overlap and the first one to be destroyed must leave the promotion in place.
        const replacedRef = componentInstance.openFromTemplate({ overlayContainer });

        componentInstance.openFromTemplate({ overlayContainer });
        await lastValueFrom(replacedRef.afterClosed);

        expect(hostElement.style.position).toBe('relative');
        expect(hostElement.querySelectorAll(`.${KBQ_ACTIONS_PANEL_SCOPED_OVERLAY_CONTAINER_SELECTOR}`).length).toBe(1);
    });

    it('should apply maxWidth config when overlayContainer is provided', () => {
        const { componentInstance } = createComponent(ActionsPanelController);
        const hostElement = componentInstance.elementRef.nativeElement;

        componentInstance.openFromTemplate({ overlayContainer: { nativeElement: hostElement }, maxWidth: '999px' });

        expect(hostElement.querySelector<HTMLElement>('.cdk-overlay-pane')!.style.maxWidth).toBe('999px');
    });

    it('should bypass a global custom OverlayContainer when overlayContainer is provided', () => {
        const { componentInstance } = createComponent(ActionsPanelController, [
            { provide: OverlayContainer, useClass: FakeOverlayContainer }
        ]);
        const hostElement = componentInstance.elementRef.nativeElement;

        componentInstance.openFromTemplate({ overlayContainer: { nativeElement: hostElement } });

        expect(hostElement.querySelector('.cdk-overlay-pane')).not.toBeNull();
        expect(getOverlayContainerElement().querySelector('.cdk-overlay-pane')).toBeNull();
    });

    it('should not reach for the global custom OverlayContainer at all when overlayContainer is provided', () => {
        const getContainerElement = jest.spyOn(FakeOverlayContainer.prototype, 'getContainerElement');
        const { componentInstance } = createComponent(ActionsPanelController, [
            { provide: OverlayContainer, useClass: FakeOverlayContainer }
        ]);

        componentInstance.openFromTemplate({
            overlayContainer: { nativeElement: componentInstance.elementRef.nativeElement }
        });

        try {
            // Asserted before any helper touches the container, since resolving it would create it.
            expect(getContainerElement).not.toHaveBeenCalled();
        } finally {
            // `clearMocks` only wipes recorded calls, so a spy left on the prototype by a failing assertion would
            // follow the remaining tests in this file.
            getContainerElement.mockRestore();
        }
    });

    it('should keep using a global custom OverlayContainer after a scoped panel has been opened', async () => {
        const { componentInstance } = createComponent(ActionsPanelController, [
            { provide: OverlayContainer, useClass: FakeOverlayContainer }
        ]);
        const hostElement = componentInstance.elementRef.nativeElement;
        const scopedRef = componentInstance.openFromTemplate({ overlayContainer: { nativeElement: hostElement } });

        scopedRef.close();
        await lastValueFrom(scopedRef.afterClosed);

        componentInstance.openFromTemplate();

        expect(getOverlayContainerElement().classList.contains(fakeOverlayContainerSelector)).toBeTruthy();
        expect(getOverlayPaneElement()).not.toBeNull();
        expect(hostElement.querySelector('.cdk-overlay-pane')).toBeNull();
    });

    it('should render a scoped panel and a global one side by side with a global custom OverlayContainer', () => {
        const { componentInstance: scopedController } = createComponent(ActionsPanelController, [
            { provide: OverlayContainer, useClass: FakeOverlayContainer }
        ]);
        // A second controller brings a second `KbqActionsPanel`, so the two panels stay open at the same time.
        const globalFixture = TestBed.createComponent(ActionsPanelController);

        globalFixture.autoDetectChanges();

        const hostElement = scopedController.elementRef.nativeElement;

        scopedController.openFromTemplate({ overlayContainer: { nativeElement: hostElement } });
        globalFixture.componentInstance.openFromTemplate();

        expect(hostElement.querySelectorAll(`.${KBQ_ACTIONS_PANEL_OVERLAY_SELECTOR}`).length).toBe(1);
        expect(getOverlayContainerElement().querySelectorAll(`.${KBQ_ACTIONS_PANEL_OVERLAY_SELECTOR}`).length).toBe(1);
        expect(getOverlayContainerElement().classList.contains(fakeOverlayContainerSelector)).toBeTruthy();
    });

    it('should share the open-dialog registry with the root Dialog, so that closeAll reaches a scoped panel', () => {
        const { componentInstance } = createComponent(ActionsPanelController);
        const hostElement = componentInstance.elementRef.nativeElement;

        componentInstance.openFromTemplate({ overlayContainer: { nativeElement: hostElement } });
        expect(TestBed.inject(Dialog).openDialogs.length).toBe(1);

        TestBed.inject(Dialog).closeAll();

        expect(TestBed.inject(Dialog).openDialogs.length).toBe(0);
        expect(hostElement.querySelector(`.${KBQ_ACTIONS_PANEL_OVERLAY_SELECTOR}`)).toBeNull();
    });

    it('should restore aria-hidden when a global panel is closed before a scoped one', async () => {
        const { componentInstance: globalController } = createComponent(ActionsPanelController);
        const scopedFixture = TestBed.createComponent(ActionsPanelController);

        scopedFixture.autoDetectChanges();

        const markedSiblings = () => document.body.querySelectorAll(':scope > [aria-hidden="true"]').length;
        // The root `Dialog` hides the application for the global panel, while the scoped one closes last and is
        // therefore the instance CDK asks to put the marks back.
        const globalRef = globalController.openFromTemplate();

        await lastValueFrom(globalRef.afterOpened);
        expect(markedSiblings()).toBeGreaterThan(0);

        const scopedRef = scopedFixture.componentInstance.openFromTemplate({
            overlayContainer: { nativeElement: scopedFixture.componentInstance.elementRef.nativeElement }
        });

        globalRef.close();
        await lastValueFrom(globalRef.afterClosed);

        scopedRef.close();
        await lastValueFrom(scopedRef.afterClosed);

        expect(markedSiblings()).toBe(0);
    });

    it('should remove the scoped container from the overlayContainer on close', async () => {
        const { componentInstance } = createComponent(ActionsPanelController);
        const hostElement = componentInstance.elementRef.nativeElement;
        const actionsPanelRef = componentInstance.openFromTemplate({
            overlayContainer: { nativeElement: hostElement }
        });

        expect(hostElement.querySelector(`.${KBQ_ACTIONS_PANEL_SCOPED_OVERLAY_CONTAINER_SELECTOR}`)).not.toBeNull();

        actionsPanelRef.close();
        await lastValueFrom(actionsPanelRef.afterClosed);

        expect(hostElement.querySelector(`.${KBQ_ACTIONS_PANEL_SCOPED_OVERLAY_CONTAINER_SELECTOR}`)).toBeNull();
    });

    it('should deliver data and the panel reference to a component rendered in an overlayContainer', async () => {
        const { componentInstance } = createComponent(ActionsPanelController);
        const hostElement = componentInstance.elementRef.nativeElement;
        const actionsPanelRef = componentInstance.openFromComponent({
            data: 'scoped',
            overlayContainer: { nativeElement: hostElement }
        });

        expect(hostElement.querySelector('#actionsPanel-data')!.textContent).toBe('scoped');

        // Closes through the `KbqActionsPanelRef` the component injected for itself.
        hostElement.querySelector<HTMLElement>('#actionsPanel-action2')!.click();
        await lastValueFrom(actionsPanelRef.afterClosed);

        expect(hostElement.querySelector(`.${KBQ_ACTIONS_PANEL_OVERLAY_SELECTOR}`)).toBeNull();
    });
});
