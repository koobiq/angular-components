import { Dialog } from '@angular/cdk/dialog';
import { ComponentType, Overlay } from '@angular/cdk/overlay';
import { inject, Injectable, InjectionToken, Injector, OnDestroy, TemplateRef } from '@angular/core';
import { KBQ_ACTIONS_PANEL_DEFAULT_CONFIG, KbqActionsPanelConfig } from './actions-panel-config';
import { KbqActionsPanelContainer } from './actions-panel-container';
import { KbqActionsPanelRef } from './actions-panel-ref';

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
                actionsPanelRef.containerInstance?.startOpenAnimation();
            });
            this.openedActionsPanelRef.close();
        } else {
            actionsPanelRef.containerInstance.startOpenAnimation();
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

        const dialogRef = this.dialog.open<R, D, T>(componentOrTemplateRef, {
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
            positionStrategy: config.overlayContainer
                ? this.overlay
                      .position()
                      .flexibleConnectedTo(config.overlayContainer)
                      .withPositions([
                          {
                              originX: 'center',
                              originY: 'bottom',
                              overlayX: 'center',
                              overlayY: 'bottom'
                          }
                      ])
                : this.overlay.position().global().centerHorizontally().bottom(),
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

        dialogRef.addPanelClass(KBQ_ACTIONS_PANEL_OVERLAY_SELECTOR);

        if (config.overlayPanelClass) {
            dialogRef.addPanelClass(config.overlayPanelClass);
        }

        return actionsPanelRef;
    }
}
