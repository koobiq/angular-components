import { ChangeDetectionStrategy, Component, computed, inject, isDevMode, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Event, NavigationEnd, PRIMARY_OUTLET, Router, RouterOutlet } from '@angular/router';
import { KbqHighlightModule } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqSelectModule } from '@koobiq/components/select';
import { filter, map } from 'rxjs/operators';
import { DevThemeToggle } from '../components-dev/theme-toggle';
import { e2eRoutes } from './routes';

@Component({
    selector: 'e2e-scenario-select',
    imports: [KbqSelectModule, KbqHighlightModule, KbqIconModule, KbqInputModule, FormsModule],
    template: `
        <kbq-form-field>
            <kbq-select placeholder="Select scenario" [value]="selected()" (valueChange)="select($event)">
                <kbq-form-field noBorders kbqSelectSearch>
                    <i kbq-icon="kbq-magnifying-glass_16" kbqPrefix></i>
                    <input kbqInput type="text" placeholder="Search scenario" [(ngModel)]="searchQuery" />
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
    styles: `
        :host {
            display: block;
            max-width: 480px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class ScenarioSelect {
    private readonly router = inject(Router);
    protected readonly options = e2eRoutes.flatMap(({ path }) => (path ? [path] : []));
    protected readonly searchQuery = signal<string | null>('');
    protected readonly filteredOptions = computed(() => {
        const query = this.searchQuery()?.trim().toLowerCase() ?? '';

        return query ? this.options.filter((option) => option.toLowerCase().includes(query)) : this.options;
    });
    // Follows the URL rather than the last pick, so browser navigation keeps it on the rendered scenario.
    protected readonly selected = toSignal(
        this.router.events.pipe(
            filter((event: Event): event is NavigationEnd => event instanceof NavigationEnd),
            map(
                ({ urlAfterRedirects }) =>
                    this.router.parseUrl(urlAfterRedirects).root.children[PRIMARY_OUTLET]?.segments[0]?.path
            )
        )
    );

    protected select(scenario: string): void {
        this.router.navigateByUrl(`/${scenario}`);
    }
}

@Component({
    selector: 'e2e-app',
    imports: [DevThemeToggle, RouterOutlet, ScenarioSelect],
    templateUrl: 'template.html',
    styleUrl: 'main.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class E2eApp {
    protected readonly isDevMode = isDevMode();
}
