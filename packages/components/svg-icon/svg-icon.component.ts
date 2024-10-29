import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    inject,
    Input,
    OnChanges,
    OnInit,
    SimpleChanges
} from '@angular/core';

import { injectKbqSvgIconConfig } from './icon-config.provider';
import { injectKbqSvgIcons } from './icon.provider';

@Component({
    selector: 'kbqSvgIcon',
    template: '',
    standalone: true,
    styleUrl: 'svg-icon.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqSvgIcon implements OnInit, OnChanges {
    private readonly iconConfig = injectKbqSvgIconConfig();
    private readonly icons = injectKbqSvgIcons();
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

    @Input() size: string | number = this.iconConfig.size;
    @Input() border?: string | number;
    @Input() color?: string = this.iconConfig.color;

    @Input() set name(name: string) {
        this.setIcon(name);
    }

    @Input() set svg(svg: string) {
        this.setSvg(svg);
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['size']) {
            this.applyStyle('--kbq-icon__size', this.size);
        }
        if (changes['color']) {
            this.applyStyle('color', this.color);
        }
        if (changes['border']) {
            this.applyStyle('--kbq-icon__stroke-width', this.border);
        }
    }

    ngOnInit(): void {
        this.applyStyle('color', this.color);
        this.applyStyle('--kbq-icon__size', this.size);
        this.applyStyle('--kbq-icon__stroke-width', this.border);
    }

    private setSvg(svg: string): void {
        this.elementRef.nativeElement.innerHTML = this.sanitizeIcon(svg);
        this.applyDataStyles(this.elementRef.nativeElement);
    }

    private setIcon(name: string) {
        const icon = [...this.icons].reverse().find((set) => set[name]);

        if (icon) {
            this.setSvg(icon[name]);
        } else {
            console.warn(`No icon named ${name} was found.`);
        }
    }

    private sanitizeIcon(icon: string): string {
        return icon.replace(/style\s*=/g, 'data-style=');
    }

    private applyStyle(property: string, value: string | number | undefined): void {
        const elementStyle = this.elementRef.nativeElement.style;
        elementStyle.removeProperty(property);
        if (value !== undefined) {
            elementStyle.setProperty(property, value.toString());
        }
    }

    private applyDataStyles(element: HTMLElement): void {
        const elements = element.querySelectorAll<HTMLElement>('[data-style]');

        for (const element of Array.from(elements)) {
            const styles = element.getAttribute('data-style');

            styles?.split(';').forEach((style) => {
                const [property, value] = style.split(':');
                element.style[property.trim() as any] = value.trim();
            });

            element.removeAttribute('data-style');
        }
    }
}
