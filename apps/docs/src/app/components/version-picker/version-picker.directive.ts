import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Directive, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { KBQ_WINDOW } from '@koobiq/components/core';
import { catchError, of } from 'rxjs';

type DocsVersion = {
    version: string;
    date: string;
    url: string;
    selected: boolean;
    name: string;
    latest: boolean;
};

@Directive({
    selector: '[docsVersionPicker]',
    exportAs: 'docsVersionPicker'
})
export class DocsVersionPickerDirective {
    selected: DocsVersion;
    versions: DocsVersion[] = [];
    isNext: boolean = false;

    private readonly httpClient = inject(HttpClient);
    private readonly changeDetectorRef = inject(ChangeDetectorRef);
    private readonly window = inject(KBQ_WINDOW);

    constructor() {
        this.httpClient
            .get('https://next.koobiq.io/assets/versions.json', { responseType: 'json' })
            .pipe(
                // A failed version fetch must not throw an unhandled error; degrade gracefully to
                // an empty version list (the picker simply shows no alternative versions).
                catchError(() => of({})),
                takeUntilDestroyed()
            )
            .subscribe((data) => {
                Object.entries(data)
                    .reverse()
                    .forEach(([name, value], index) => {
                        if (index === 1) {
                            value.url = 'https://koobiq.io/';
                            value.latest = true;
                        }

                        if (name === 'next' || parseInt(name) >= 8) {
                            this.versions.push({ name, selected: false, ...value });
                        }
                    });

                this.setSelectedVersion();

                this.changeDetectorRef.markForCheck();
            });
    }

    goToVersion(version: DocsVersion) {
        if (!version.url.startsWith(this.window.location.href)) {
            this.window.location.assign(version.url);
        }
    }

    setSelectedVersion() {
        this.versions.forEach((version, index) => {
            if (this.window.location.href.startsWith(version.url)) {
                version.selected = true;

                this.selected = version;
                this.isNext = index === 0;
            }
        });
    }
}
