import { CdkScrollable } from '@angular/cdk/scrolling';
import { Location } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    computed,
    inject,
    isDevMode,
    signal,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, PRIMARY_OUTLET, Router, RouterOutlet } from '@angular/router';
import { KbqHighlightModule } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqSelectModule } from '@koobiq/components/select';
import { filter } from 'rxjs/operators';
import { DevLocaleSelector } from '../locale-selector';
import { devSsrExampleIds } from './routes';

@Component({
    selector: 'dev-header',
    imports: [
        DevLocaleSelector,
        KbqSelectModule,
        KbqHighlightModule,
        KbqIconModule,
        KbqInputModule,
        FormsModule
    ],
    template: `
        <dev-locale-selector />
        <kbq-form-field>
            <kbq-select placeholder="Select example" [value]="selectedExample()" (valueChange)="selectExample($event)">
                <kbq-form-field noBorders kbqSelectSearch>
                    <i kbq-icon="kbq-magnifying-glass_16" kbqPrefix></i>
                    <input kbqInput type="text" placeholder="Search example" [(ngModel)]="searchQuery" />
                    <kbq-cleaner />
                </kbq-form-field>

                <div kbq-select-search-empty-result>Nothing found</div>

                @for (option of filteredOptions(); track option) {
                    <kbq-option [value]="option">
                        <span [innerHTML]="option | mcHighlight: searchQuery()"></span>
                    </kbq-option>
                }
            </kbq-select>
        </kbq-form-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevHeader {
    private readonly router = inject(Router);
    private readonly location = inject(Location);
    protected readonly options = devSsrExampleIds;
    protected readonly selectedExample = signal(this.getExampleFromUrl());
    protected readonly searchQuery = signal<string | null>('');
    protected readonly filteredOptions = computed(() => {
        const query = this.searchQuery()?.trim().toLowerCase() ?? '';

        return query ? this.options.filter((option) => option.toLowerCase().includes(query)) : this.options;
    });

    constructor() {
        // Keeps the picker in step with the URL, so browser navigation doesn't leave it showing an
        // example other than the rendered one.
        this.router.events
            .pipe(
                filter((event) => event instanceof NavigationEnd),
                takeUntilDestroyed()
            )
            .subscribe(() => this.selectedExample.set(this.getExampleFromUrl()));
    }

    protected selectExample(example: string): void {
        this.router.navigateByUrl(example);
    }

    // `Router.url` still points at the default `/` here because the initial navigation
    // hasn't completed yet; `Location.path()` reflects the real (server/browser) URL immediately.
    private getExampleFromUrl(): string | undefined {
        const segments = this.router.parseUrl(this.location.path()).root.children[PRIMARY_OUTLET]?.segments ?? [];
        const path = segments.map(({ path }) => path).join('/');

        return this.options.includes(path) ? path : undefined;
    }
}

@Component({
    selector: 'dev-app',
    imports: [RouterOutlet, DevHeader],
    templateUrl: './template.html',
    styleUrl: './styles.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    hostDirectives: [
        // Required for components with overlays that use scrolling strategies
        CdkScrollable
    ]
})
export class DevApp {
    protected readonly isDevMode = isDevMode();
}
