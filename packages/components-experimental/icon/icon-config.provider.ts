import { inject, InjectionToken, Provider } from '@angular/core';

export interface KbqIconConfig {
    size: string;
    color?: string;
}

export const KbqIconConfigToken = new InjectionToken<KbqIconConfig>('KbqIconConfigToken');

const defaultConfig: KbqIconConfig = {
    size: '1em'
};

export function provideKbqIconsConfig(config: Partial<KbqIconConfig>): Provider[] {
    return [
        {
            provide: KbqIconConfigToken,
            useValue: { ...defaultConfig, ...config }
        }
    ];
}

export function injectKbqIconConfig(): KbqIconConfig {
    return inject(KbqIconConfigToken, { optional: true }) ?? defaultConfig;
}
