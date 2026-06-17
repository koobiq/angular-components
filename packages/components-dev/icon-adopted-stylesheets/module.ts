import { DOCUMENT } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    inject,
    OnDestroy,
    OnInit,
    signal,
    ViewEncapsulation
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqBadgeColors, KbqBadgeModule } from '@koobiq/components/badge';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqLinkModule } from '@koobiq/components/link';
import { KbqTagsModule } from '@koobiq/components/tags';
import { DevThemeToggle } from '../theme-toggle';

/** How the base icon CSS is delivered into the this.document. */
type IconMode = 'style' | 'adopted' | 'adopted-layer';

@Component({
    selector: 'dev-app',
    imports: [
        FormsModule,
        KbqIconModule,
        KbqButtonModule,
        KbqBadgeModule,
        KbqLinkModule,
        KbqTagsModule,
        KbqFormFieldModule,
        KbqInputModule,
        DevThemeToggle
    ],
    templateUrl: './template.html',
    styleUrls: ['./styles.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class DevApp implements OnInit, OnDestroy {
    private readonly document = inject(DOCUMENT);

    readonly colors = KbqComponentColors;
    readonly badgeColors = KbqBadgeColors;

    /** Non-empty value so that kbq-password-toggle is visible (it is hidden when the control is empty). */
    password = 'Secret123!';

    /** Current icon CSS delivery mode. Defaults to `adopted` (no layer) so the bug is visible right away. */
    readonly mode = signal<IconMode>('adopted');

    /** kbq-icons.css text with its url() rewritten to the served asset path. */
    private css = '';
    private readonly sheet = new CSSStyleSheet();
    private styleEl?: HTMLStyleElement;

    ngOnInit(): void {
        void this.loadCss();
    }

    private async loadCss(): Promise<void> {
        const raw = await fetch('assets/kbq-icons/kbq-icons.css').then((response) => response.text());

        // Both <style> and adopted sheets resolve url() against the document base URL,
        // so rewrite the relative './kbq-icons.(ttf|woff)' to the served asset path.
        this.css = raw.replaceAll('url("./', 'url("assets/kbq-icons/');

        this.apply(this.mode());
    }

    ngOnDestroy(): void {
        this.detach();
    }

    apply(mode: IconMode): void {
        this.mode.set(mode);
        this.detach();

        if (!this.css) {
            return;
        }

        switch (mode) {
            // Baseline "as today": an author <style> at the start of <head> comes earlier in the cascade
            // than component styles, so same-specificity overrides (rotate helpers, etc.) win.
            case 'style': {
                const element = this.document.createElement('style');

                element.textContent = this.css;
                this.document.head.prepend(element);
                this.styleEl = element;
                break;
            }
            // Bug: adopted sheets sort AFTER all author styles → the base `.kbq` (0-1-0) beats the
            // `.kbq-icon-rotate_*`/`.kbq-icon-flip-*` helpers (also 0-1-0) → rotations/flips are lost.
            case 'adopted': {
                this.sheet.replaceSync(this.css);
                this.document.adoptedStyleSheets = [...this.document.adoptedStyleSheets, this.sheet];
                break;
            }
            // Fix: a layered rule loses to any unlayered author rule of the same origin BEFORE
            // specificity and order are compared → component overrides win again.
            case 'adopted-layer': {
                this.sheet.replaceSync(`@layer kbq-icons {\n${this.css}\n}`);
                this.document.adoptedStyleSheets = [...this.document.adoptedStyleSheets, this.sheet];
                break;
            }
        }
    }

    private detach(): void {
        this.document.adoptedStyleSheets = this.document.adoptedStyleSheets.filter((sheet) => sheet !== this.sheet);
        this.styleEl?.remove();
        this.styleEl = undefined;
    }
}
