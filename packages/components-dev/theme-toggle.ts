import { ChangeDetectionStrategy, Component, inject, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqThemeService } from '@koobiq/components/core';
import { KbqToggleModule } from '@koobiq/components/toggle';

@Component({
    selector: 'dev-theme-toggle',
    imports: [KbqToggleModule, FormsModule],
    template: `
        <kbq-toggle [(ngModel)]="isDarkTheme" (change)="theme.toggle()">isDarkTheme</kbq-toggle>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-align-center-center',
        'data-testid': 'e2eThemeToggle'
    },
    exportAs: 'devThemeToggle'
})
export class DevThemeToggle {
    protected readonly theme = inject(KbqThemeService);
    readonly isDarkTheme = model(this.theme.colorScheme() === 'dark');
}
