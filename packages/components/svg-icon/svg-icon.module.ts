import { Inject, ModuleWithProviders, NgModule } from '@angular/core';

import { KbqSvgIconsToken, provideSvgIcons } from './icon.provider';
import { KbqSvgIcon } from './svg-icon.component';

@NgModule({
    imports: [
        KbqSvgIcon
    ],
    exports: [KbqSvgIcon]
})
export class KbqSvgIconModule {
    constructor(@Inject(KbqSvgIconsToken) icons: Record<string, string>) {
        if (Object.keys(icons).length === 0) {
            throw new Error(
                'No icons have been provided. Ensure to include some icons by importing them using KbqSvgIconsModule.withIcons({ ... }).'
            );
        }
    }

    static withIcons(icons: Record<string, string>): ModuleWithProviders<KbqSvgIconModule> {
        return { ngModule: KbqSvgIconModule, providers: provideSvgIcons(icons) };
    }
}
