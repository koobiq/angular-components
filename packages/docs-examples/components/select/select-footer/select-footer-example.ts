import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { KbqFormFieldModule } from '@koobiq/components-experimental/form-field';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KBQ_LOCALE_SERVICE, KbqComponentColors, KbqLocaleService } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLinkModule } from '@koobiq/components/link';
import { KbqSelectModule } from '@koobiq/components/select';
import { enUSLocaleDataSet } from '../en-US';
import { esLALocaleDataSet } from '../es-LA';
import { faIRLocaleDataSet } from '../fa-IR';
import { ptBRLocaleDataSet } from '../pt-BR';
import { ruRULocaleDataSet } from '../ru-RU';
import { zhCNLocaleDataSet } from '../zh-CN';

const localeDataSet = {
    'en-US': enUSLocaleDataSet,
    'zh-CN': zhCNLocaleDataSet,
    'es-LA': esLALocaleDataSet,
    'pt-BR': ptBRLocaleDataSet,
    'ru-RU': ruRULocaleDataSet,
    'fa-IR': faIRLocaleDataSet
};

/**
 * @title Select footer
 */
@Component({
    standalone: true,
    selector: 'select-footer-example',
    templateUrl: 'select-footer-example.html',
    imports: [KbqFormFieldModule, KbqSelectModule, KbqButtonModule, KbqIconModule, KbqLinkModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    styles: `
        .layout-row {
            width: 400px;
            margin: 0 auto;
            padding: 16px;
            align-items: center;
            gap: 24px;
            justify-content: flex-end;
        }

        .kbq-form__label {
            white-space: nowrap;
            color: var(--kbq-foreground-contrast-secondary);
        }
    `
})
export class SelectFooterExample {
    selectedButton = '';
    selectedCaption = '';
    selectedLink = '';

    options: string[] = [];

    constructor(@Inject(KBQ_LOCALE_SERVICE) private localeService: KbqLocaleService) {
        this.localeService.changes.subscribe(this.update);
    }

    update = (locale: string) => {
        this.options = localeDataSet[locale].items;
        this.selectedButton = localeDataSet[locale].items[0];
        this.selectedCaption = localeDataSet[locale].items[0];
        this.selectedLink = localeDataSet[locale].items[0];
    };
    protected readonly colors = KbqComponentColors;
    protected readonly styles = KbqButtonStyles;
}
