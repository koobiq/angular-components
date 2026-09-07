import { Dialog } from '@angular/cdk/dialog';
import { ComponentType, Overlay, OverlayContainer } from '@angular/cdk/overlay';
import {
    createEnvironmentInjector,
    ElementRef,
    EnvironmentInjector,
    inject,
    Injectable,
    InjectionToken,
    Injector,
    OnDestroy,
    TemplateRef
} from '@angular/core';
import { KBQ_ACTIONS_PANEL_DEFAULT_CONFIG, KbqActionsPanelConfig } from './actions-panel-config';
import { KbqActionsPanelContainer } from './actions-panel-container';
import { KbqActionsPanelRef } from './actions-panel-ref';
import {
    KBQ_ACTIONS_PANEL_SCOPED_OVERLAY_HOST,
    KbqActionsPanelScopedOverlayContainer
} from './actions-panel-scoped-overlay-container';

/** Injection token that can be used to access the data that was passed in to actions panel. */
export const KBQ_ACTIONS_PANEL_DATA = new InjectionToken('KBQ_ACTIONS_PANEL_DATA');

/**
 * Context for actions panel template.
 */
export type KbqActionsPanelTemplateContext<T = unknown, D = unknown, R = unknown> = {
    /**
     * Data passed to actions panel.
     *
     * Example:
     *
     * ```html
     * <ng-template #actionsPanel let-data>{{ data.KEY }}</ng-template>
     * ````
     */
    $implicit?: D | null;
    /**
     * Data passed to actions panel.
     *
     * Example:
     *
     * ```html
     * <ng-template #actionsPanel let-data="data">{{ data.KEY }}</ng-template>
     * ````
     */
    data?: D | null;
    /**
     * Opened actions panel reference.
     *
     * Example:
     *
     * ```html
     * <ng-template #actionsPanel let-actionsPanelRef="actionsPanelRef">
     *   <button (click)="actionsPanelRef.close()">close</button>
     * </ng-template>
     * ````
     */
    actionsPanelRef: KbqActionsPanelRef<T, R>;
};

/**
 * Selector for actions panel overlay.
 *
 * @docs-private
 */
export const KBQ_ACTIONS_PANEL_OVERLAY_SELECTOR = 'kbq-actions-panel-overlay';

/**
 * Service for opening actions panel.
 */
@Injectable({ providedIn: 'root' })
export class KbqActionsPanel implements OnDestroy {
    private readonly injector = inject(Injector);
    private readonly environmentInjector = inject(EnvironmentInjector);
    private readonly overlay = inject(Overlay);
    private readonly dialog = inject(Dialog);
    private readonly defaultConfig = inject(KBQ_ACTIONS_PANEL_DEFAULT_CONFIG);

    /** The reference to the currently opened actions panel. */
    private openedActionsPanelRef: KbqActionsPanelRef | null = null;

    ngOnDestroy() {
        this.close();
    }

    /**
     * Opens actions panel.
     *
     * @param componentOrTemplateRef Component to be opened into the actions panel.
     * @param config Additional configuration options for the actions panel.
     * @returns A reference to the opened actions panel.
     */
    open<T, D = unknown, R = unknown>(
        component: ComponentType<T>,
        config?: KbqActionsPanelConfig<D>
    ): KbqActionsPanelRef<T, R>;

    /**
     * Opens actions panel.
     *
     * @param template TemplateRef to be used as the content.
     * @param config Additional configuration options for the actions panel.
     * @returns A reference to the opened actions panel.
     */
    open<T, D = unknown, R = unknown>(
        template: TemplateRef<T>,
        config?: KbqActionsPanelConfig<D>
    ): KbqActionsPanelRef<T, R>;

    open<T, D = unknown, R = unknown>(
        componentOrTemplateRef: ComponentType<T> | TemplateRef<T>,
        config?: KbqActionsPanelConfig<D>
    ): KbqActionsPanelRef<T, R> {
        const _config: KbqActionsPanelConfig<D> = {
            ...(this.defaultConfig as KbqActionsPanelConfig<D>),
            ...config
        };
        const actionsPanelRef = this.openDialog<T, D, R>(componentOrTemplateRef, _config);

        actionsPanelRef.afterClosed.subscribe(() => {
            if (this.openedActionsPanelRef === actionsPanelRef) {
                this.openedActionsPanelRef = null;
            }
        });

        if (this.openedActionsPanelRef) {
            this.openedActionsPanelRef.afterClosed.subscribe(() => {
                actionsPanelRef.open();
            });
            this.openedActionsPanelRef.close();
        } else {
            actionsPanelRef.open();
        }

        this.openedActionsPanelRef = actionsPanelRef as KbqActionsPanelRef;

        return actionsPanelRef;
    }

    /** Closes the currently opened actions panel. */
    close<R>(result?: R): void {
        this.openedActionsPanelRef?.close(result);
    }

    private openDialog<T, D = unknown, R = unknown>(
        componentOrTemplateRef: ComponentType<T> | TemplateRef<T>,
        config: KbqActionsPanelConfig<D> = {}
    ): KbqActionsPanelRef<T, R> {
        let actionsPanelRef!: KbqActionsPanelRef<T, R>;
        const { overlayContainer, overlayPanelClass } = config;
        // CDK takes the overlay host from the `OverlayContainer` its `Dialog` was injected with, and there is one of
        // those per application. Rendering the panel inside `overlayContainer` therefore means giving this panel a
        // `Dialog` of its own, backed by a container scoped to that element.
        const scopedInjector = overlayContainer ? this.createScopedInjector(overlayContainer) : null;
        const dialog = scopedInjector ? scopedInjector.get(Dialog) : this.dialog;

        try {
            dialog.open<R, D, T>(componentOrTemplateRef, {
                ...config,
                container: KbqActionsPanelContainer,
                restoreFocus: false,
                autoFocus: null!,
                hasBackdrop: false,
                // Disable closing since we need to sync it up to the animation ourselves
                closeOnOverlayDetachments: false,
                // Disable closing since we need to sync it up to the animation ourselves
                closeOnDestroy: false,
                // Disable closing since we need to sync it up to the animation ourselves
                disableClose: true,
                scrollStrategy: config.scrollStrategy && config.scrollStrategy(this.overlay),
                // Pinned to the bottom center of the overlay container — the viewport by default, `overlayContainer`
                // when one is given. The panel's width follows from `.cdk-overlay-pane`'s `max-width: 100%` in both
                // cases.
                positionStrategy: this.overlay.position().global().centerHorizontally().bottom(),
                templateContext: () => {
                    return {
                        $implicit: config.data,
                        data: config.data,
                        actionsPanelRef
                    } satisfies KbqActionsPanelTemplateContext<T, D, R>;
                },
                injector: Injector.create({
                    parent: config.injector || this.injector,
                    providers: [{ provide: KbqActionsPanelConfig, useValue: config }]
                }),
                providers: (dialogRef, _dialogConfig, container) => {
                    actionsPanelRef = new KbqActionsPanelRef<T, R>(dialogRef, container as KbqActionsPanelContainer);

                    return [
                        { provide: KbqActionsPanelRef, useValue: actionsPanelRef },
                        { provide: KBQ_ACTIONS_PANEL_DATA, useValue: config.data }
                    ];
                }
            });
        } catch (error) {
            // `open()` builds the overlay, and with it the scoped container that has already put a wrapper into the
            // host and promoted it. Nothing else would ever destroy the injector, so unwind it here.
            scopedInjector?.destroy();

            throw error;
        }

        const { overlayRef } = actionsPanelRef;

        overlayRef.addPanelClass(KBQ_ACTIONS_PANEL_OVERLAY_SELECTOR);

        if (overlayPanelClass) overlayRef.addPanelClass(overlayPanelClass);

        if (scopedInjector) {
            // The scoped injector owns the panel's `Dialog` and overlay container, so it lives exactly as long as the
            // panel. `afterClosed` emits after the overlay has been disposed of.
            actionsPanelRef.afterClosed.subscribe(() => scopedInjector.destroy());
        }

        return actionsPanelRef;
    }

    /** Injector that makes CDK render the panel's overlay inside `host` instead of `document.body`. */
    private createScopedInjector(host: ElementRef<HTMLElement>): EnvironmentInjector {
        return createEnvironmentInjector(
            [
                // A `Dialog` of its own is what carries the scoped container into `createOverlayRef` — the root one
                // resolves the application-wide container. It still reaches the root `Dialog` through `skipSelf` and
                // shares its registry of open dialogs, so `closeAll()` and `afterAllClosed` keep seeing this panel.
                Dialog,
                { provide: KBQ_ACTIONS_PANEL_SCOPED_OVERLAY_HOST, useValue: host },
                { provide: OverlayContainer, useClass: KbqActionsPanelScopedOverlayContainer }
            ],
            this.environmentInjector,
            KbqActionsPanel.name
        );
    }
}
