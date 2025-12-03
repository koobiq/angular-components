import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { ThemePalette } from '@koobiq/components/core';
import { KbqDlModule } from '@koobiq/components/dl';

@Component({
    selector: 'dev-app',
    imports: [KbqDlModule],
    templateUrl: './template.html',
    styleUrl: './styles.scss',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {
    readonly themePalette = ThemePalette;
}
