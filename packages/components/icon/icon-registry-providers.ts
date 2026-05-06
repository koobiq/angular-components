import { InjectionToken, Provider } from '@angular/core';

export interface KbqIconsConfig {
    /** URL to the SVG sprite file. Must be served as a static asset. */
    spriteUrl: string;
    /** Optional namespace to register the sprite under. */
    namespace?: string;
}

export const KBQ_ICONS_CONFIG = new InjectionToken<KbqIconsConfig[]>('KBQ_ICONS_CONFIG');

/**
 * A function that resolves an icon name to either an inline SVG string or a URL string.
 * Return `null` to indicate this resolver does not handle the given name.
 */
export type KbqIconResolver = (name: string) => string | null;

/**
 * Multi-valued injection token for icon resolver functions.
 * Resolvers are tried in registration order; the first non-null result wins.
 */
export const KBQ_ICON_RESOLVER = new InjectionToken<KbqIconResolver[]>('KBQ_ICON_RESOLVER');

/** Configures the icon registry to load icons from one or more SVG sprite assets. */
export function provideKoobiqIcons(...sprites: KbqIconsConfig[]): Provider {
    return { provide: KBQ_ICONS_CONFIG, useValue: sprites };
}

/**
 * Registers a resolver function that maps icon names to SVG strings or URLs.
 * Multiple resolvers can be registered; they are tried in registration order.
 */
export function provideKoobiqIconsResolver(resolver: KbqIconResolver): Provider {
    return { provide: KBQ_ICON_RESOLVER, useValue: resolver, multi: true };
}

/**
 * Registers a name→SVG/URL dictionary as an icon resolver.
 * Values starting with `<` are treated as inline SVG (no HTTP request).
 * All other values are treated as URLs and fetched at runtime.
 *
 * @example
 * provideKoobiqIconsDict({ 'chevron-down-s_16': '<svg>...</svg>' })
 */
export function provideKoobiqIconsDict(dict: Record<string, string>): Provider {
    return provideKoobiqIconsResolver((name) => dict[name] ?? null);
}
