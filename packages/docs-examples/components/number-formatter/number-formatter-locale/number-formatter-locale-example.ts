import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqFormattersModule } from '@koobiq/components/core';
import { KbqTableModule } from '@koobiq/components/table';

/**
 * @title Number-formatter forced locale
 */
@Component({
    selector: 'number-formatter-locale-example',
    imports: [KbqFormattersModule, KbqTableModule],
    template: `
        <table kbq-table disableHover>
            <thead>
                <tr>
                    <th>Locale</th>
                    <th>kbqNumber</th>
                    <th>kbqRoundNumber</th>
                </tr>
            </thead>
            <tbody>
                @for (locale of locales; track locale) {
                    <tr>
                        <td>{{ locale }}</td>
                        <td>{{ value | kbqNumber: '' : locale }}</td>
                        <td>{{ value | kbqRoundNumber: locale }}</td>
                    </tr>
                }
            </tbody>
        </table>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NumberFormatterLocaleExample {
    protected readonly value = 1234567.89;
    protected readonly locales = ['ru-RU', 'en-US', 'es-LA', 'pt-BR'];
}
