import { CdkScrollable } from '@angular/cdk/scrolling';
import {
    ChangeDetectionStrategy,
    Component,
    computed,
    effect,
    inject,
    isDevMode,
    model,
    signal,
    ViewEncapsulation
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterOutlet } from '@angular/router';
import { KbqHighlightModule } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqSelectModule } from '@koobiq/components/select';
import { KbqSidepanelService } from '@koobiq/components/sidepanel';
import { DevLocaleSelector } from '../locale-selector';
import { devSsrRoutes } from './routes';

@Component({
    selector: 'dev-header',
    imports: [
        // DevThemeToggle,
        DevLocaleSelector,
        KbqSelectModule,
        KbqHighlightModule,
        KbqIconModule,
        KbqInputModule,
        FormsModule
    ],
    template: `
        <dev-locale-selector />
        <!-- <dev-theme-toggle /> -->
        <kbq-form-field>
            <kbq-select placeholder="Select example" [(value)]="selectedExample">
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
    styles: '',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevHeader {
    private readonly router = inject(Router);
    protected readonly options = devSsrRoutes
        .map(({ path }) => path)
        .filter((path): path is string => typeof path === 'string' && path.length > 0);
    protected readonly selectedExample = model(this.options[0]);
    protected readonly searchQuery = signal<string | null>('');
    protected readonly filteredOptions = computed(() => {
        const query = this.searchQuery()?.trim().toLowerCase() ?? '';

        return query ? this.options.filter((option) => option.toLowerCase().includes(query)) : this.options;
    });

    constructor() {
        effect(() => {
            this.router.navigateByUrl(this.selectedExample());
        });
    }
}

@Component({
    selector: 'dev-app',
    imports: [RouterOutlet, DevHeader],
    templateUrl: './template.html',
    styleUrl: './styles.scss',
    providers: [KbqSidepanelService],
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
