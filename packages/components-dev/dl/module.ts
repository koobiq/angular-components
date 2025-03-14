import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { ThemePalette } from '@koobiq/components/core';
import { KbqDlModule } from '@koobiq/components/dl';

@Component({
    standalone: true,
    imports: [KbqDlModule],
    selector: 'app',
    templateUrl: './template.html',
    styleUrl: './styles.scss',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DlDev {
    readonly themePalette = ThemePalette;
}
