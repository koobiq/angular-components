import { CdkScrollable } from '@angular/cdk/scrolling';
import { ChangeDetectionStrategy, Component, isDevMode, ViewEncapsulation } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { KbqLinkModule } from '@koobiq/components/link';
import { KbqSidepanelService } from '@koobiq/components/sidepanel';
import { DevLocaleSelector } from '../locale-selector';
import { DevThemeToggle } from '../theme-toggle';
import { devSsrRoutes } from './routes';

@Component({
    selector: 'dev-app',
    imports: [RouterOutlet, RouterLink, KbqLinkModule, DevThemeToggle, DevLocaleSelector],
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
    protected readonly links = devSsrRoutes;
}
