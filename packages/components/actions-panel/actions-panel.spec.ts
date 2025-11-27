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
import { KbqActionsPanelConfig } from './actions-panel-config';
import { KbqActionsPanelRef } from './actions-panel-ref';
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
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [KbqActionsPanel]
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

    it('should apply maxHeight', () => {
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
        const selector = 'TEST_CUSTOM_OVERLAY_CONTAINER';
        const testOverlayContainer = class extends OverlayContainer {
            getContainerElement(): HTMLElement {
                if (!this._containerElement) {
                    this._createContainer();
                }

                this._containerElement.classList.add(selector);

                return this._containerElement;
            }
        };
        const { componentInstance } = createComponent(ActionsPanelController, [
            { provide: OverlayContainer, useClass: testOverlayContainer }]);

        componentInstance.openFromTemplate();

        expect(getOverlayContainerElement().classList.contains(selector)).toBeTruthy();
    });
});
