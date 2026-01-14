import { ChangeDetectionStrategy, Component, isDevMode } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { KbqLinkModule } from '@koobiq/components/link';
import { DevThemeToggle } from '../components-dev/theme-toggle';
import { e2eRoutes } from './routes';

@Component({
    selector: 'e2e-app',
    imports: [DevThemeToggle, RouterOutlet, RouterLink, KbqLinkModule],
    templateUrl: 'template.html',
    styleUrl: 'main.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class E2eApp {
    protected readonly isDevMode = isDevMode();
    protected readonly links = e2eRoutes;
}
