import { InjectionToken } from '@angular/core';

export interface KbqIconsConfig {
    /** URL to the SVG sprite file. Must be served as a static asset. */
    spriteUrl: string;
    /** Optional namespace to register the sprite under. */
    namespace?: string;
}

export const KBQ_ICONS_CONFIG = new InjectionToken<KbqIconsConfig>('KBQ_ICONS_CONFIG');

export function provideKoobiqIcons(config: KbqIconsConfig) {
    return {
        provide: KBQ_ICONS_CONFIG,
        useValue: config
    };
}
