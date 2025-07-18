import { Component } from '@angular/core';
import { KbqResizable, KbqResizeHandle } from '@koobiq/components/content-panel';

@Component({
    selector: 'app-example',
    standalone: true,
    imports: [KbqResizable, KbqResizeHandle],
    template: `
        <!-- Простой пример с невидимой ручкой -->
        <div class="resizable-panel" [kbqResize]="{ minWidth: 200, maxWidth: 600 }" (resizing)="onResize($event)">
            <h3>Панель с изменяемой шириной</h3>
            <p>Текущая ширина: {{ currentWidth }}px</p>
            <p>Потяните за правый край для изменения размера</p>
        </div>

        <!-- Пример с видимой ручкой -->
        <div class="resizable-panel-with-handle" [kbqResize]="{ minWidth: 250, maxWidth: 700 }">
            <div class="content">
                <h3>Панель с видимой ручкой</h3>
                <p>Используйте ручку справа для изменения размера</p>
            </div>
            <kbq-resize-handle />
        </div>
    `,
    styles: [
        `
            .resizable-panel {
                background: #f8f9fa;
                border: 1px solid #e9ecef;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
                width: 400px;
            }

            .resizable-panel-with-handle {
                background: #e3f2fd;
                border: 1px solid #90caf9;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
                width: 400px;
                position: relative;
            }

            .content {
                margin-right: 20px;
            }
        `

    ]
})
export class ExampleComponent {
    currentWidth = 400;

    onResize(event: { width: number }): void {
        this.currentWidth = event.width;
    }
}
