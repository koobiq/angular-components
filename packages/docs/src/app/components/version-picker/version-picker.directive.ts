import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Directive } from '@angular/core';


interface DocVersion {
    selected: boolean;
    url: string;
    name: string;
    version: string;
    date: string;
}

@Directive({
    exportAs: 'kbqDocVersionPicker',
    selector: '[kbq-docs-version-picker]'
})
export class VersionPickerDirective {
    selected: DocVersion;
    versions: DocVersion[] = [];
    isNext: boolean = false;

    constructor(
        private http: HttpClient,
        private changeDetectorRef: ChangeDetectorRef
    ) {
        this.http
            .get('https://next.koobiq.io/assets/versions.json', { responseType: 'json' })
            .subscribe((data) => {
                Object.entries(data)
                    .reverse()
                    .forEach(([name, value], index) => {
                        if (index === 1) {
                            // tslint:disable-next-line:no-parameter-reassignment
                            name += ' (последняя)';
                            value.url = 'https://koobiq.io/';
                        }

                        // tslint:disable-next-line:no-magic-numbers
                        if (name === 'next' || parseInt(name) >= 8) {
                            this.versions.push({ name, selected: false, ...value });
                        }
                    });

                this.setSelectedVersion();

                this.changeDetectorRef.markForCheck();
            });
    }

    goToVersion(version: DocVersion) {
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
