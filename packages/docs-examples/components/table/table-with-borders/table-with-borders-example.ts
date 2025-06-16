import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqTableModule } from '@koobiq/components/table';

/**
 * @title Table with borders
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'table-with-borders-example',
    imports: [
        KbqTableModule
    ],
    template: `
        <table [border]="true" style="margin-bottom: 32px; width: 100%" kbq-table>
            <thead>
                <tr>
                    <th>Файл</th>
                    <th style="width: 110px">Владелец</th>
                    <th style="width: 110px">Изменен</th>
                    <th style="width: 50px">Размер</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>000.txt</td>
                    <td>Роман Туров</td>
                    <td>27 мая 2024</td>
                    <td>17 КБ</td>
                </tr>
                <tr>
                    <td>The Big book of Poems and Fairy Tales</td>
                    <td>Андрей Усачев</td>
                    <td>1 декабря 2023</td>
                    <td>998 КБ</td>
                </tr>
                <tr>
                    <td>Лунные кошки.doc</td>
                    <td>Диана Лапшина</td>
                    <td>7 марта 1993</td>
                    <td>502 КБ</td>
                </tr>
                <tr>
                    <td>Пюре из яблок.txt</td>
                    <td>Минск</td>
                    <td>24 августа 2022</td>
                    <td>128 КБ</td>
                </tr>
            </tbody>
        </table>
    `
})
export class TableWithBordersExample {}
