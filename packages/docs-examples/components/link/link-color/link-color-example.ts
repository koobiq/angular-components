import { Component } from '@angular/core';
import { KbqLinkModule } from '@koobiq/components/link';

/**
 * @title Link color
 */
@Component({
    standalone: true,
    selector: 'link-color-example',
    styleUrls: ['link-color-example.css'],
    imports: [KbqLinkModule],
    template: `
        <table>
            <tr>
                <td>
                    <a class="kbq-external" href="https://koobiq.io/components/link/overview" target="_blank" kbq-link>
                        Отчет от 17.05.2020
                    </a>
                </td>
                <td>
                    <a
                        class="warning"
                        class="kbq-external"
                        href="https://koobiq.io/components/link/overview"
                        target="_blank"
                        kbq-link
                    >
                        Отчет от 18.05.2020
                    </a>
                </td>
                <td>
                    <a
                        class="ok"
                        class="kbq-external"
                        href="https://koobiq.io/components/link/overview"
                        target="_blank"
                        kbq-link
                    >
                        Отчет от 19.05.2020
                    </a>
                </td>
            </tr>
            <tr>
                <td>Отлично</td>
                <td>О, нет!</td>
                <td>Ок</td>
            </tr>
        </table>
    `
})
export class LinkColorExample {}
