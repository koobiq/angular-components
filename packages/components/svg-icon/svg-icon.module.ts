import { ModuleWithProviders, NgModule, Provider, makeEnvironmentProviders } from '@angular/core';

import iconsJSON from '@koobiq/icons/info/kbq-icons-info.json';
import { KbqSvgIconButton } from './svg-icon-button.component';
import { KbqSvgIconItem } from './svg-icon-item.component';
import { KBQ_SVG_ICON_REGISTRY_PROVIDER } from './svg-icon-registry.service';
import { KbqSvgIcon } from './svg-icon.component';
import { KbqSvgHttpLoader, KbqSvgLoader } from './svg-loader';

export const iconsNames: string[] = Object.keys(iconsJSON);

export interface KbqSvgIconInterface {
    loader?: Provider;
}

export function provideKbqSvgIcon(config: KbqSvgIconInterface = {}) {
    return makeEnvironmentProviders([
        KBQ_SVG_ICON_REGISTRY_PROVIDER,
        config.loader || { provide: KbqSvgLoader, useClass: KbqSvgHttpLoader }]);
}

@NgModule({
    imports: [
        KbqSvgIcon,
        KbqSvgIconItem,
        KbqSvgIconButton
    ],
    exports: [KbqSvgIcon, KbqSvgIconItem, KbqSvgIconButton]
})
export class KbqSvgIconModule {
    static forRoot(config: KbqSvgIconInterface = {}): ModuleWithProviders<KbqSvgIconModule> {
        return {
            ngModule: KbqSvgIconModule,
            providers: [
                KBQ_SVG_ICON_REGISTRY_PROVIDER,
                config.loader || { provide: KbqSvgLoader, useClass: KbqSvgHttpLoader }]
        };
    }
}
