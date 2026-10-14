import { CdkScrollable } from '@angular/cdk/scrolling';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { KbqHighlightModule } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { DevLocaleSelector } from '../locale-selector';
import { DevThemeToggle } from '../theme-toggle';
import { devAppNames } from './routes';

/**
 * Navigation shell over the sibling dev apps: every one of them is a lazy route, so this catalogue
 * covers whatever those apps cover and cannot drift from them.
 *
 * Deliberately not `ViewEncapsulation.None`, and deliberately `dev-all`-prefixed: the routed apps
 * ship global stylesheets that target `dev-app`, `.dev-shell`, `.dev-sidebar` and `.dev-container`,
 * and would otherwise restyle this shell.
 */
@Component({
    selector: 'dev-all',
    imports: [
        FormsModule,
        RouterOutlet,
        RouterLink,
        RouterLinkActive,
        CdkScrollable,
        KbqInputModule,
        KbqIconModule,
        KbqHighlightModule,
        DevThemeToggle,
        DevLocaleSelector
    ],
    templateUrl: './template.html',
    styleUrl: './styles.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevAllApp {
    protected readonly searchQuery = signal<string | null>('');
    protected readonly filteredAppNames = computed(() => {
        const query = this.searchQuery()?.trim().toLowerCase() ?? '';

        return query ? devAppNames.filter((name) => name.includes(query)) : devAppNames;
    });
}
