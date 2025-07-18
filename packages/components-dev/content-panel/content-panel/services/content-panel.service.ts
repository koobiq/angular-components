import { ComponentType, Overlay } from '@angular/cdk/overlay';
import { Inject, inject, Injectable, InjectionToken, Injector, Optional, SkipSelf, TemplateRef } from '@angular/core';
import {
    KBQ_SIDEPANEL_DEFAULT_OPTIONS,
    KbqSidepanelConfig,
    KbqSidepanelPosition,
    KbqSidepanelRef,
    KbqSidepanelService
} from '@koobiq/components/sidepanel';

import { IcContentPanelConfig, IcContentPanelRef } from '../types';

export const IC_CONTENT_PANEL_DEFAULT_CONFIG = new InjectionToken<IcContentPanelConfig>(
    'Ic-Content-Panel-Default-Config'
);

const DEFAULT_IC_CONTENT_PANEL_CONFIG: IcContentPanelConfig = {
    hasBackdrop: false,
    position: KbqSidepanelPosition.Right,
    overlayPanelClass: 'ic-content-panel-overlay'
};

@Injectable()
export class IcContentPanelService extends KbqSidepanelService {
    readonly #icContentPanelDefaultConfig =
        inject(IC_CONTENT_PANEL_DEFAULT_CONFIG, { optional: true }) || DEFAULT_IC_CONTENT_PANEL_CONFIG;

    constructor(
        overlay: Overlay,
        injector: Injector,
        @Optional() @Inject(KBQ_SIDEPANEL_DEFAULT_OPTIONS) defaultOptions: KbqSidepanelConfig,
        @Optional() @SkipSelf() parentSidepanelService: KbqSidepanelService
    ) {
        super(overlay, injector, defaultOptions, parentSidepanelService);
    }

    override get openedSidepanels(): IcContentPanelRef[] {
        return super.openedSidepanels as IcContentPanelRef[];
    }

    /**
     * Создает компонент content-panel
     * @param templateRef TemplateRef, компонента.
     * @param config Sidepanel конфигурация открытия.
     * @returns KbqSidepanelRef - созданная Sidepanel.
     */
    override open<T, D = unknown>(
        templateRef: TemplateRef<T> | ComponentType<T>,
        config: IcContentPanelConfig<D> = this.#icContentPanelDefaultConfig
    ): IcContentPanelRef<T> {
        const mergedConfig = {
            ...this.#icContentPanelDefaultConfig,
            ...config
        };

        // kbq-realisation

        mergedConfig.data = {
            ghostElement: config.ghostElement,
            ...mergedConfig.data
        };

        const kbqSidepanelRef = super.open(templateRef, mergedConfig);

        this.changeSidepanelHeight(
            kbqSidepanelRef,
            mergedConfig.topOffset || mergedConfig.ghostElement?.getBoundingClientRect().top || 0
        );

        kbqSidepanelRef.containerInstance.withShadow = false;

        return kbqSidepanelRef as IcContentPanelRef;
    }

    private changeSidepanelHeight(sidepanelRef: KbqSidepanelRef, topOffsetValue: number): void {
        const icContentPanelRef = sidepanelRef.containerInstance as unknown as IcContentPanelRef;

        if ('elementRef' in icContentPanelRef) {
            (icContentPanelRef.elementRef.nativeElement as HTMLElement).style.height =
                `calc(100vh - var(--kbq-size-s) - ${topOffsetValue}px)`;
        }
    }
}
