import { Component, signal } from '@angular/core';
import { KbqResizable } from './resize';

@Component({
    selector: 'app-resize-demo',
    standalone: true,
    imports: [KbqResizable],
    template: `
        <div class="demo-container">
            <h2>Пример использования KbqResize директивы</h2>

            <div
                class="demo-panel"
                [kbqResize]="resizeConfig()"
                (resizeStart)="onResizeStart($event)"
                (resizing)="onResizing($event)"
                (resizeEnd)="onResizeEnd($event)"
            >
                <div class="panel-content">
                    <h3>Изменяемая панель</h3>
                    <p>Текущая ширина: {{ currentWidth() }}px</p>
                    <p>Потяните за правый край для изменения размера</p>
                </div>
            </div>

            <div class="controls">
                <button (click)="toggleDisabled()">{{ disabled() ? 'Включить' : 'Отключить' }} resize</button>
                <button (click)="resetWidth()">Сбросить ширину</button>
            </div>
        </div>
    `,
    styles: [
        `
            .demo-container {
                padding: 20px;
                max-width: 1200px;
                margin: 0 auto;
            }

            .demo-panel {
                background: #f5f5f5;
                border: 1px solid #ddd;
                border-radius: 4px;
                margin: 20px 0;
                min-height: 150px;
                width: 400px;
            }

            .demo-panel-with-handle {
                background: #e8f4f8;
                border: 1px solid #b3d9e6;
                border-radius: 4px;
                margin: 20px 0;
                min-height: 150px;
                width: 400px;
                position: relative;
            }

            .panel-content {
                padding: 20px;
            }

            .controls {
                margin-top: 20px;
            }

            .controls button {
                margin-right: 10px;
                padding: 8px 16px;
                border: 1px solid #ccc;
                border-radius: 4px;
                background: white;
                cursor: pointer;
            }

            .controls button:hover {
                background: #f5f5f5;
            }
        `

    ]
})
export class ResizeDemoComponent {
    currentWidth = signal(400);
    disabled = signal(false);

    resizeConfig = signal({
        minWidth: 200,
        maxWidth: 800,
        handleWidth: 4,
        disabled: this.disabled()
    });

    resizeConfigWithHandle = signal({
        minWidth: 200,
        maxWidth: 800,
        disabled: this.disabled()
    });

    onResizeStart(event: { width: number }): void {
        console.log('Resize started:', event.width);
    }

    onResizing(event: { width: number }): void {
        this.currentWidth.set(event.width);
        console.log('Resizing:', event.width);
    }

    onResizeEnd(event: { width: number }): void {
        console.log('Resize ended:', event.width);
    }

    toggleDisabled(): void {
        this.disabled.set(!this.disabled());
        this.resizeConfig.set({
            ...this.resizeConfig(),
            disabled: this.disabled()
        });
        this.resizeConfigWithHandle.set({
            ...this.resizeConfigWithHandle(),
            disabled: this.disabled()
        });
    }

    resetWidth(): void {
        this.currentWidth.set(400);
    }
}
