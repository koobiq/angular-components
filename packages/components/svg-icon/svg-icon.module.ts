import { ModuleWithProviders, NgModule, Provider, makeEnvironmentProviders } from '@angular/core';

import { KBQ_SVG_ICON_REGISTRY_PROVIDER } from './svg-icon-registry.service';
import { KbqSvgIconComponent } from './svg-icon.component';
import { KbqSvgHttpLoader, KbqSvgLoader } from './svg-loader';

export interface KbqSvgIcon {
    loader?: Provider;
}

export function provideKbqSvgIcon(config: KbqSvgIcon = {}) {
    return makeEnvironmentProviders([
        KBQ_SVG_ICON_REGISTRY_PROVIDER,
        config.loader || { provide: KbqSvgLoader, useClass: KbqSvgHttpLoader }]);
}

@NgModule({
    imports: [
        KbqSvgIconComponent
    ],
    exports: [KbqSvgIconComponent]
})
export class KbqSvgIconModule {
    static forRoot(config: KbqSvgIcon = {}): ModuleWithProviders<KbqSvgIconModule> {
        return {
            ngModule: KbqSvgIconModule,
            providers: [
                KBQ_SVG_ICON_REGISTRY_PROVIDER,
                config.loader || { provide: KbqSvgLoader, useClass: KbqSvgHttpLoader }]
        };
    }
}
