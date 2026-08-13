import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqThemeService } from '@koobiq/components/core';

/**
 * @title Theme values in your own styles
 */
@Component({
    selector: 'theme-css-variables-example',
    imports: [KbqButtonModule],
    template: `
        <div class="theme-css-variables-example__card">
            <p class="theme-css-variables-example__caption">Current theme: {{ themeService.colorScheme() }}</p>
            <button kbq-button (click)="themeService.toggle()">Switch theme</button>
        </div>
    `,
    styles: `
        .theme-css-variables-example__card {
            padding: var(--kbq-size-l);
            border: 1px solid var(--kbq-line-contrast-less);
            border-radius: var(--kbq-size-border-radius);
            background: var(--kbq-background-card);
            color: var(--kbq-foreground-contrast);
        }

        .theme-css-variables-example__caption {
            margin: 0 0 var(--kbq-size-m);
            color: var(--kbq-foreground-contrast-secondary);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ThemeCssVariablesExample {
    // The app's shared service, so the switch flips the whole page — that is the point here: nothing
    // in the styles above reacts to it explicitly, the variables simply resolve to the other theme.
    protected readonly themeService = inject(KbqThemeService);
}
