import { Inject, ModuleWithProviders, NgModule } from '@angular/core';

import { KbqIcon } from './icon.component';
import { KbqIconsToken, provideIcons } from './icon.provider';

@NgModule({
    imports: [KbqIcon],
    exports: [KbqIcon]
})
export class KbqIconsModule {
    constructor(@Inject(KbqIconsToken) icons: Record<string, string>) {
        if (Object.keys(icons).length === 0) {
            throw new Error(
                'No icons have been provided. Ensure to include some icons by importing them using KbqIconsModule.withIcons({ ... }).'
            );
        }
    }

    static withIcons(icons: Record<string, string>): ModuleWithProviders<KbqIconsModule> {
        return { ngModule: KbqIconsModule, providers: provideIcons(icons) };
    }
}
