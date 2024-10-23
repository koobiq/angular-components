import { Injectable, OnDestroy, Renderer2, RendererFactory2 } from '@angular/core';
import { BehaviorSubject, Subscription, pairwise } from 'rxjs';

export interface KbqTheme {
    name: string;
    className: string;
    selected: boolean;
}

/**
 * Enum representing the available themes for the Koobiq design system.
 * This enum is used to manage and switch between different visual themes.
 */
export enum KbqThemeSelector {
    /**
     * Represents the default light theme.
     * This is the standard theme that is applied
     * when the application is first loaded if nothing else provided
     */
    Default = 'kbq-light',
    /**
     * This theme is used to provide a darker visual experience, often preferred in low-light environments.
     */
    Dark = 'kbq-dark'
}

export const KbqDefaultThemes: KbqTheme[] = [
    {
        name: 'light',
        className: KbqThemeSelector.Default,
        selected: true
    },
    {
        name: 'dark',
        className: KbqThemeSelector.Dark,
        selected: false
    }
];

@Injectable({ providedIn: 'root' })
export class ThemeService<T extends KbqTheme | null = KbqTheme> implements OnDestroy {
    current: BehaviorSubject<T> = new BehaviorSubject(null as T);

    themes: T[] = KbqDefaultThemes as T[];

    protected renderer: Renderer2;
    protected subscription: Subscription;

    constructor(private rendererFactory: RendererFactory2) {
        this.renderer = this.rendererFactory.createRenderer(null, null);

        this.subscription = this.current.pipe(pairwise()).subscribe(this.update);
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    setThemes(items: T[]) {
        this.themes = items;
    }

    setTheme(value: T | number) {
        if (typeof value === 'number') {
            this.current.next(this.themes[value]);
        } else if (typeof value === 'object' && this.themes.includes(value)) {
            this.current.next(value);
        } else {
            throw Error(`value has unsupported type: ${typeof value}`);
        }
    }

    getTheme(): T {
        return this.current.value;
    }

    protected update = ([prev, current]: T[]) => {
        if (prev) {
            prev.selected = false;
            this.renderer.removeClass(document.body, prev.className);
        }

        if (current) {
            this.renderer.addClass(document.body, current.className);
            current.selected = true;
        }
    };
}
