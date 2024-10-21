import { Injectable, InjectionToken, Optional, SkipSelf, inject } from '@angular/core';

import { DOCUMENT } from '@angular/common';
import { Observable, of as observableOf, throwError as observableThrowError } from 'rxjs';
import { catchError, finalize, map, share, tap } from 'rxjs/operators';
import { KbqSvgLoader } from './svg-loader';

export const SERVER_URL = new InjectionToken<string>('SERVER_URL');

@Injectable()
export class KbqSvgIconRegistryService {
    private loader = inject(KbqSvgLoader);
    protected serverUrl = inject<string | undefined>(SERVER_URL, { optional: true });
    private document = inject(DOCUMENT);

    private iconsByUrl = new Map<string, SVGElement>();
    private iconsLoadingByUrl = new Map<string, Observable<SVGElement>>();

    /** Add a SVG to the registry by passing a name and the SVG. */
    addSvg(name: string, data: string) {
        if (!this.iconsByUrl.has(name)) {
            const div = this.document.createElement('DIV');
            div.innerHTML = data;
            const svg = div.querySelector('svg') as SVGElement;
            this.iconsByUrl.set(name, svg);
        }
    }

    /** Load a SVG to the registry from a URL. */
    loadSvg(url: string, name: string = url): Observable<SVGElement | undefined> | undefined {
        // not sure if there should be a possibility to use name for server usage
        // so overriding it for now if provided
        // maybe should separate functionality for url and name use-cases
        if (this.serverUrl && url.match(/^(http(s)?):/) === null) {
            url = this.serverUrl + url;
            name = url;
        }

        if (this.iconsByUrl.has(name)) {
            return observableOf(this.iconsByUrl.get(name));
        } else if (this.iconsLoadingByUrl.has(name)) {
            return this.iconsLoadingByUrl.get(name);
        }
        const o = this.loader.getSvg('assets/SVGIcons/' + url).pipe(
            map((svg) => {
                const div = this.document.createElement('DIV');
                div.innerHTML = svg;
                return div.querySelector('svg') as SVGElement;
            }),
            tap((svg) => this.iconsByUrl.set(name, svg)),
            catchError((err) => {
                console.error(err);
                return observableThrowError(err);
            }),
            finalize(() => this.iconsLoadingByUrl.delete(name)),
            share()
        ) as Observable<SVGElement>;

        this.iconsLoadingByUrl.set(name, o);
        return o;
    }

    /** Get loaded SVG from registry by name. (also works by url because of blended map) */
    getSvgByName(name: string): Observable<SVGElement | undefined> | undefined {
        if (this.iconsByUrl.has(name)) {
            return observableOf(this.iconsByUrl.get(name));
        } else if (this.iconsLoadingByUrl.has(name)) {
            return this.iconsLoadingByUrl.get(name);
        }
        return observableThrowError(`No svg with name '${name}' has been loaded`);
    }

    /** Remove a SVG from the registry by URL (or name). */
    unloadSvg(url: string) {
        if (this.iconsByUrl.has(url)) {
            this.iconsByUrl.delete(url);
        }
    }
}

export function KBQ_SVG_ICON_REGISTRY_PROVIDER_FACTORY(parentRegistry: KbqSvgIconRegistryService) {
    return parentRegistry || new KbqSvgIconRegistryService();
}

export const KBQ_SVG_ICON_REGISTRY_PROVIDER = {
    provide: KbqSvgIconRegistryService,
    deps: [[new Optional(), new SkipSelf(), KbqSvgIconRegistryService]],
    useFactory: KBQ_SVG_ICON_REGISTRY_PROVIDER_FACTORY
};
