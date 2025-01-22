import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Directive, inject } from '@angular/core';

type DocsVersion = {
    version: string;
    date: string;
    url: string;
    selected: boolean;
    name: string;
    latest: boolean;
};

@Directive({
    standalone: true,
    exportAs: 'docsVersionPicker',
    selector: '[docsVersionPicker]'
})
export class DocsVersionPickerDirective {
    selected: DocsVersion;
    versions: DocsVersion[] = [];
    isNext: boolean = false;

    private readonly httpClient = inject(HttpClient);
    private readonly changeDetectorRef = inject(ChangeDetectorRef);

    constructor() {
        this.httpClient
            .get('https://next.koobiq.io/assets/versions.json', { responseType: 'json' })
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
        if (!version.url.startsWith(window.location.href)) {
            window.location.assign(version.url);
        }
    }

    setSelectedVersion() {
        this.versions.forEach((version, index) => {
            if (window.location.href.startsWith(version.url)) {
                version.selected = true;

                this.selected = version;
                this.isNext = index === 0;
            }
        });
    }
}
