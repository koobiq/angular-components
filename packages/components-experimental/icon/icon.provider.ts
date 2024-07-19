import { inject, InjectionToken, Optional, Provider, SkipSelf } from '@angular/core';

export function provideIcons(icons: Record<string, string>): Provider[] {
    return [
        {
            provide: KbqIconsToken,
            useFactory: (parentIcons?: Record<string, string>[]) => ({
                ...parentIcons?.reduce((acc, icons) => ({ ...acc, ...icons }), {}),
                ...icons
            }),
            deps: [[KbqIconsToken, new Optional(), new SkipSelf()]],
            multi: true
        }
    ];
}

export const KbqIconsToken = new InjectionToken<Record<string, string>[]>('KbqIconsToken');

export function injectKbqIcons(): Record<string, string>[] {
    return inject(KbqIconsToken, { optional: true }) ?? [];
}
