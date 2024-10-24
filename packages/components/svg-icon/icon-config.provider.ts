import { inject, InjectionToken, Provider } from '@angular/core';

export interface KbqSvgIconConfig {
    size: string;
    color?: string;
}

export const KbqSvgIconConfigToken = new InjectionToken<KbqSvgIconConfig>('KbqIconConfigToken');

const defaultConfig: KbqSvgIconConfig = {
    size: '1em'
};

export function provideKbqSvgIconsConfig(config: Partial<KbqSvgIconConfig>): Provider[] {
    return [
        {
            provide: KbqSvgIconConfigToken,
            useValue: { ...defaultConfig, ...config }
        }
    ];
}

export function injectKbqSvgIconConfig(): KbqSvgIconConfig {
    return inject(KbqSvgIconConfigToken, { optional: true }) ?? defaultConfig;
}
