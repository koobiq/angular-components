import { Component } from '@angular/core';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqTableModule } from '@koobiq/components/table';

/**
 * @title Table
 */
@Component({
    standalone: true,
    selector: 'table-overview-example',
    imports: [
        KbqTableModule
    ],
    template: `
        <table
            kbq-table
            style="margin-bottom: 32px"
        >
            <thead>
                <tr>
                    <th>Клиент</th>
                    <th>Значение</th>
                    <th>Зарегистрирован</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>КВАРЦ Групп</td>
                    <td>Identity Theft</td>
                    <td>8 июля, 14:31</td>
                </tr>
                <tr>
                    <td>Верхнетагильская ГРЭС</td>
                    <td>DDoS</td>
                    <td>4 дек, 16:11</td>
                </tr>
                <tr>
                    <td>КВАРЦ Групп</td>
                    <td>HIPS Alert</td>
                    <td>4 дек, 16:11</td>
                </tr>
                <tr>
                    <td>ТГК-11</td>
                    <td>Spam Attack</td>
                    <td>4 дек, 16:11</td>
                </tr>
                <tr>
                    <td>Верхнетагильская ГРЭС</td>
                    <td>Vulnerability Exploitation</td>
                    <td>4 дек, 16:11</td>
                </tr>
                <tr>
                    <td>КВАРЦ Групп</td>
                    <td>Complex Attack</td>
                    <td>4 дек, 16:11</td>
                </tr>
            </tbody>
        </table>
    `
})
export class TableOverviewExample {
    protected readonly colors = KbqComponentColors;
}
