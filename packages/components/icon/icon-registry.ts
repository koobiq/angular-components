import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, SecurityContext } from '@angular/core';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';
import { Observable, of, throwError } from 'rxjs';
import { catchError, finalize, map, share } from 'rxjs/operators';
import { KBQ_ICON_RESOLVER, KBQ_ICONS_CONFIG } from './icon-registry-providers';

export interface KbqIconOptions {
    viewBox?: string;
    withCredentials?: boolean;
}

interface KbqSvgIconConfig {
    svgText: SafeHtml | null;
    url: SafeResourceUrl | null;
    options: KbqIconOptions | undefined;
    /** Cached parsed element (for literal icons or already-fetched URLs). */
    svgElement: SVGElement | null;
}

function iconKey(namespace: string, name: string): string {
    return namespace ? `${namespace}:${name}` : name;
}

function cloneSvg(svg: SVGElement): SVGElement {
    return svg.cloneNode(true) as SVGElement;
}

@Injectable({ providedIn: 'root' })
export class KbqIconRegistry {
    private readonly sanitizer = inject(DomSanitizer);
    private readonly document = inject<Document>(DOCUMENT);
    private readonly httpClient = inject(HttpClient, { optional: true });
    private readonly iconsConfig = inject(KBQ_ICONS_CONFIG, { optional: true });
    private readonly resolvers = inject(KBQ_ICON_RESOLVER, { optional: true }) ?? [];

    /** Individual icon configs, keyed by "namespace:name". */
    private readonly iconConfigs = new Map<string, KbqSvgIconConfig>();

    /** Icon-set configs per namespace. */
    private readonly iconSetConfigs = new Map<string, KbqSvgIconConfig[]>();

    /** In-progress URL fetches to dedupe concurrent requests. */
    private readonly inProgressUrlFetches = new Map<string, Observable<string>>();

    /** Cached parsed SVG sets, keyed by URL string. */
    private readonly cachedIconSets = new Map<string, SVGElement>();

    constructor() {
        this.registerIconSet();
    }

    /** Registers an SVG icon by URL in the default namespace. */
    addSvgIcon(name: string, url: SafeResourceUrl, options?: KbqIconOptions): void {
        this.addSvgIconInNamespace('', name, url, options);
    }

    /** Registers an SVG icon from an inline HTML string in the default namespace. */
    addSvgIconLiteral(name: string, literal: SafeHtml, options?: KbqIconOptions): void {
        this.addSvgIconLiteralInNamespace('', name, literal, options);
    }

    /** Registers an SVG icon by URL under the given namespace. */
    addSvgIconInNamespace(namespace: string, name: string, url: SafeResourceUrl, options?: KbqIconOptions): void {
        this.cacheIcon(namespace, name, { url, svgText: null, options, svgElement: null });
    }

    /** Registers an SVG icon from an inline HTML string under the given namespace. */
    addSvgIconLiteralInNamespace(namespace: string, name: string, literal: SafeHtml, options?: KbqIconOptions): void {
        const sanitized = this.sanitizer.sanitize(SecurityContext.HTML, literal);

        if (!sanitized) {
            throw Error(`KbqIconRegistry: literal for icon "${iconKey(namespace, name)}" sanitized to empty string.`);
        }

        this.cacheIcon(namespace, name, {
            url: null,
            svgText: this.sanitizer.bypassSecurityTrustHtml(sanitized),
            options,
            svgElement: null
        });
    }

    /** Registers an SVG sprite file in the default namespace. Icons are looked up by their `symbol id`. */
    addSvgIconSet(url: SafeResourceUrl, options?: KbqIconOptions): void {
        this.addSvgIconSetInNamespace('', url, options);
    }

    /** Registers an SVG sprite file under the given namespace. Duplicate URLs are silently ignored. */
    addSvgIconSetInNamespace(namespace: string, url: SafeResourceUrl, options?: KbqIconOptions): void {
        const urlStr = this.sanitizer.sanitize(SecurityContext.RESOURCE_URL, url) ?? '';
        const sets = this.iconSetConfigs.get(namespace) ?? [];
        const alreadyRegistered = sets.some(
            (set) => this.sanitizer.sanitize(SecurityContext.RESOURCE_URL, set.url!) === urlStr
        );

        if (alreadyRegistered) return;

        const config: KbqSvgIconConfig = { url, svgText: null, options, svgElement: null };

        sets.push(config);
        this.iconSetConfigs.set(namespace, sets);
    }

    /**
     * Emits a cloned SVGElement for the given name.
     * Accepts "namespace:name" syntax.
     */
    getNamedSvgIcon(name: string, namespace = ''): Observable<SVGElement> {
        let resolvedNs = namespace;
        let resolvedName = name;

        if (resolvedName.trimStart().startsWith('<')) {
            return of(this.svgElementFromText(resolvedName));
        }

        const colonIndex = name.indexOf(':');

        if (colonIndex !== -1) {
            resolvedNs = name.slice(0, colonIndex);
            resolvedName = name.slice(colonIndex + 1);
        }

        const key = iconKey(resolvedNs, resolvedName);

        const iconConfig = this.iconConfigs.get(key);

        if (iconConfig) {
            return this.loadIcon(iconConfig, resolvedName);
        }

        for (const resolver of this.resolvers) {
            const result = resolver(resolvedName);

            if (result == null) continue;

            const config: KbqSvgIconConfig = {
                url: null,
                svgText: null,
                svgElement: null,
                options: undefined
            };

            if (result.trimStart().startsWith('<')) {
                config.svgText = this.sanitizer.bypassSecurityTrustHtml(result);
            } else {
                config.url = this.sanitizer.bypassSecurityTrustResourceUrl(result);
            }

            this.iconConfigs.set(key, config);

            return this.loadIcon(config, resolvedName);
        }

        const sets = this.iconSetConfigs.get(resolvedNs);

        if (sets?.length) {
            return this.loadIconFromSets(resolvedName, sets);
        }

        return throwError(() => Error(`KbqIconRegistry: no icon registered for "${key}".`));
    }

    private cacheIcon(namespace: string, name: string, config: KbqSvgIconConfig): this {
        this.iconConfigs.set(iconKey(namespace, name), config);

        return this;
    }

    private loadIcon(config: KbqSvgIconConfig, name: string): Observable<SVGElement> {
        if (config.svgElement) {
            return of(cloneSvg(config.svgElement));
        }

        if (config.svgText) {
            const svg = this.svgElementFromText(config.svgText as string, config.options);

            config.svgElement = svg;

            return of(cloneSvg(svg));
        }

        if (config.url) {
            return this.fetchUrl(config.url, config.options?.withCredentials).pipe(
                map((text) => {
                    const svg = this.svgElementFromText(text, config.options);

                    config.svgElement = svg;

                    return cloneSvg(svg);
                })
            );
        }

        return throwError(() => Error(`KbqIconRegistry: icon "${name}" has neither URL nor literal.`));
    }

    private registerIconSet(): void {
        if (!this.iconsConfig) return;

        for (const config of this.iconsConfig) {
            const url = this.sanitizer.bypassSecurityTrustResourceUrl(config.spriteUrl);

            if (config.namespace) {
                this.addSvgIconSetInNamespace(config.namespace, url);
            } else {
                this.addSvgIconSet(url);
            }
        }
    }

    private loadIconFromSets(name: string, sets: KbqSvgIconConfig[]): Observable<SVGElement> {
        const sources = sets
            .slice()
            .reverse()
            .map((set) => this.loadIconSet(set));

        const tryNext = (index: number): Observable<SVGElement> => {
            if (index >= sources.length) {
                return throwError(() => Error(`KbqIconRegistry: icon "${name}" not found in any registered icon set.`));
            }

            return sources[index].pipe(
                map((setElement) => {
                    const icon = this.extractIconFromSet(name, setElement);

                    if (!icon) {
                        throw Error(`KbqIconRegistry: icon "${name}" not found in set.`);
                    }

                    return icon;
                }),
                catchError(() => tryNext(index + 1))
            );
        };

        return tryNext(0);
    }

    private loadIconSet(config: KbqSvgIconConfig): Observable<SVGElement> {
        if (config.svgElement) {
            return of(config.svgElement);
        }

        if (!config.url) {
            return throwError(() => Error('KbqIconRegistry: icon set has no URL.'));
        }

        const urlStr = this.sanitizer.sanitize(SecurityContext.RESOURCE_URL, config.url);

        if (!urlStr) {
            return throwError(() => Error('KbqIconRegistry: icon set URL failed sanitization.'));
        }

        if (this.cachedIconSets.has(urlStr)) {
            config.svgElement = this.cachedIconSets.get(urlStr)!;

            return of(config.svgElement);
        }

        return this.fetchUrl(config.url, config.options?.withCredentials).pipe(
            map((text) => {
                const svg = this.svgElementFromText(text, config.options);

                config.svgElement = svg;
                this.cachedIconSets.set(urlStr, svg);

                return svg;
            })
        );
    }

    private extractIconFromSet(name: string, setElement: SVGElement): SVGElement | null {
        const symbol = setElement.querySelector(`#${name}`);

        if (!symbol) return null;

        const svg = this.document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        const viewBox = symbol.getAttribute('viewBox') || setElement.getAttribute('viewBox') || '0 0 24 24';

        svg.setAttribute('viewBox', viewBox);
        svg.setAttribute('aria-hidden', 'true');
        svg.setAttribute('focusable', 'false');

        for (const child of Array.from(symbol.childNodes)) {
            svg.appendChild(child.cloneNode(true));
        }

        return svg;
    }

    private svgElementFromText(text: string, options?: KbqIconOptions): SVGElement {
        const div = this.document.createElement('div');

        div.innerHTML = text;

        const svg = div.querySelector('svg') as SVGElement | null;

        if (!svg) {
            throw Error('KbqIconRegistry: could not find <svg> element in icon markup.');
        }

        if (options?.viewBox) {
            svg.setAttribute('viewBox', options.viewBox);
        }

        svg.setAttribute('aria-hidden', 'true');
        svg.setAttribute('focusable', 'false');

        return svg;
    }

    private fetchUrl(url: SafeResourceUrl, withCredentials = false): Observable<string> {
        if (!this.httpClient) {
            throw Error(
                'KbqIconRegistry: HttpClient is required for loading icons from URLs. ' +
                    'Provide it via provideHttpClient() or HttpClientModule.'
            );
        }

        const urlStr = this.sanitizer.sanitize(SecurityContext.RESOURCE_URL, url);

        if (!urlStr) {
            return throwError(() => Error('KbqIconRegistry: URL failed security sanitization.'));
        }

        const inProgress = this.inProgressUrlFetches.get(urlStr);

        if (inProgress) return inProgress;

        const fetch = this.httpClient.get(urlStr, { responseType: 'text', withCredentials }).pipe(
            share(),
            finalize(() => this.inProgressUrlFetches.delete(urlStr))
        );

        this.inProgressUrlFetches.set(urlStr, fetch);

        return fetch;
    }
}
