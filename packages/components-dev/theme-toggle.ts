import { ChangeDetectionStrategy, Component, inject, model } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { KbqThemeSelector, ThemeService } from '@koobiq/components/core';
import { KbqToggleModule } from '@koobiq/components/toggle';

@Component({
    standalone: true,
    selector: 'dev-theme-toggle',
    exportAs: 'devThemeToggle',
    imports: [KbqToggleModule, FormsModule],
    template: `
        <kbq-toggle [(ngModel)]="isDarkTheme">isDarkTheme</kbq-toggle>
    `,
    host: {
        class: 'layout-align-center-center',
        'data-testid': 'e2eThemeToggle'
    },
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevThemeToggle {
    private readonly theme = inject(ThemeService);
    readonly isDarkTheme = model(this.theme.current.value?.className === KbqThemeSelector.Dark);

    constructor() {
        toObservable(this.isDarkTheme)
            .pipe(takeUntilDestroyed())
            .subscribe((isDarkTheme) => {
                this.theme.setTheme(isDarkTheme ? 1 : 0);
            });
    }
}
