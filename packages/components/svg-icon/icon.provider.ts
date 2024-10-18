import { inject, InjectionToken, Optional, Provider, SkipSelf } from '@angular/core';

export function provideSvgIcons(icons: Record<string, string>): Provider[] {
    return [
        {
            provide: KbqSvgIconsToken,
            useFactory: (parentIcons?: Record<string, string>[]) => ({
                ...parentIcons?.reduce((acc, icons) => ({ ...acc, ...icons }), {}),
                ...icons
            }),
            deps: [[KbqSvgIconsToken, new Optional(), new SkipSelf()]],
            multi: true
        }
    ];
}

export const KbqSvgIconsToken = new InjectionToken<Record<string, string>[]>('KbqSvgIconsToken');

export function injectKbqSvgIcons(): Record<string, string>[] {
    return inject(KbqSvgIconsToken, { optional: true }) ?? [];
}
