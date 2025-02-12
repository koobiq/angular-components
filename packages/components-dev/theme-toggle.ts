import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { KbqThemeSelector, ThemeService } from '@koobiq/components/core';
import { KbqToggleModule } from '@koobiq/components/toggle';
import { map } from 'rxjs/operators';

@Component({
    standalone: true,
    selector: 'dev-theme-toggle',
    imports: [KbqToggleModule, FormsModule],
    template: `
        <kbq-toggle [ngModel]="isDarkTheme()" (ngModelChange)="theme.setTheme($event ? 1 : 0)">isDarkTheme</kbq-toggle>
    `,
    styles: [
        `
            :host {
                display: flex;
                align-items: center;
                justify-content: center;
            }
        `

    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevThemeToggle {
    protected readonly theme = inject(ThemeService);

    protected readonly isDarkTheme = toSignal(
        this.theme.current.pipe(map((theme) => theme?.className === KbqThemeSelector.Dark)),
        {
            initialValue: false
        }
    );
}
