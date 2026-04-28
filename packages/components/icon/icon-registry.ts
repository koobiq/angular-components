import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, SecurityContext } from '@angular/core';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';
import { Observable, of, throwError } from 'rxjs';
import { catchError, finalize, map, share } from 'rxjs/operators';
import { KBQ_ICONS_CONFIG } from './icon-registry-providers';

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

    addSvgIcon(name: string, url: SafeResourceUrl, options?: KbqIconOptions): this {
        return this.addSvgIconInNamespace('', name, url, options);
    }

    addSvgIconLiteral(name: string, literal: SafeHtml, options?: KbqIconOptions): this {
        return this.addSvgIconLiteralInNamespace('', name, literal, options);
    }

    addSvgIconInNamespace(namespace: string, name: string, url: SafeResourceUrl, options?: KbqIconOptions): this {
        return this.cacheIcon(namespace, name, { url, svgText: null, options, svgElement: null });
    }

    addSvgIconLiteralInNamespace(namespace: string, name: string, literal: SafeHtml, options?: KbqIconOptions): this {
        const sanitized = this.sanitizer.sanitize(SecurityContext.HTML, literal);

        if (!sanitized) {
            throw Error(`KbqIconRegistry: literal for icon "${iconKey(namespace, name)}" sanitized to empty string.`);
        }

        return this.cacheIcon(namespace, name, {
            url: null,
            svgText: this.sanitizer.bypassSecurityTrustHtml(sanitized),
            options,
            svgElement: null
        });
    }

    addSvgIconSet(url: SafeResourceUrl, options?: KbqIconOptions): this {
        return this.addSvgIconSetInNamespace('', url, options);
    }

    addSvgIconSetInNamespace(namespace: string, url: SafeResourceUrl, options?: KbqIconOptions): this {
        const urlStr = this.sanitizer.sanitize(SecurityContext.RESOURCE_URL, url) ?? '';
        const sets = this.iconSetConfigs.get(namespace) ?? [];
        const alreadyRegistered = sets.some(
            (set) => this.sanitizer.sanitize(SecurityContext.RESOURCE_URL, set.url!) === urlStr
        );

        if (alreadyRegistered) {
            return this;
        }

        const config: KbqSvgIconConfig = { url, svgText: null, options, svgElement: null };

        sets.push(config);
        this.iconSetConfigs.set(namespace, sets);

        return this;
    }

    /**
     * Returns an Observable that emits a cloned SVGElement for the given name.
     * Accepts "namespace:name" syntax or explicit namespace argument.
     */
    getNamedSvgIcon(name: string, namespace = ''): Observable<SVGElement> {
        let resolvedNs = namespace;
        let resolvedName = name;

        const colonIndex = name.indexOf(':');

        if (colonIndex !== -1) {
            resolvedNs = name.slice(0, colonIndex);
            resolvedName = name.slice(colonIndex + 1);
        }

        const key = iconKey(resolvedNs, resolvedName);
        const config = this.iconSetConfigs.get(key);

        if (config) {
            return this.loadIcon(config[0], resolvedName);
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

        const url = this.sanitizer.bypassSecurityTrustResourceUrl(this.iconsConfig.spriteUrl);

        if (this.iconsConfig.namespace) {
            this.addSvgIconSetInNamespace(this.iconsConfig.namespace, url);
        } else {
            this.addSvgIconSet(url);
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
        const symbol = setElement.querySelector(`#${name}`) ?? setElement.querySelector(`#${name.replace('kbq-', '')}`);

        if (!symbol) {
            return null;
        }

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

        if (inProgress) {
            return inProgress;
        }

        const fetch$ = this.httpClient.get(urlStr, { responseType: 'text', withCredentials }).pipe(
            share(),
            finalize(() => this.inProgressUrlFetches.delete(urlStr))
        );

        this.inProgressUrlFetches.set(urlStr, fetch$);

        return fetch$;
    }
}
