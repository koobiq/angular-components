import {
    AfterContentInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    DestroyRef,
    ElementRef,
    inject,
    Input,
    OnChanges,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DomSanitizer } from '@angular/platform-browser';
import { KBQ_FORM_FIELD_REF, KbqColorDirective } from '@koobiq/components/core';
import { KbqIconRegistry } from './icon-registry';

@Component({
    selector: '[kbq-icon]',
    template: '<ng-content />',
    styleUrls: ['icon.scss', 'icon-tokens.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'kbq kbq-icon',
        '[class]': 'svgIcon ? null : iconName',
        '[class.kbq-error]': 'color === "error" || hasError'
    }
})
export class KbqIcon extends KbqColorDirective implements AfterContentInit, OnChanges {
    readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

    protected readonly formField = inject(KBQ_FORM_FIELD_REF, { optional: true });
    protected readonly changeDetectorRef = inject(ChangeDetectorRef);
    protected readonly registry = inject(KbqIconRegistry, { optional: true });
    protected readonly sanitizer = inject(DomSanitizer);
    protected readonly destroyRef = inject(DestroyRef);

    @Input() small = false;
    @Input() autoColor = false;

    hasError: boolean = false;

    /** Name of an icon within a @koobiq/icons. Accepts "namespace:name" syntax. */
    @Input({ alias: 'kbq-icon' }) iconName: string;

    protected name = 'KbqIcon';

    /** True when icon is being rendered as inline SVG. */
    protected svgIcon = false;

    getHostElement() {
        return this.elementRef.nativeElement;
    }

    updateMaxHeight() {
        if (this.name !== 'KbqIcon') {
            return;
        }

        const iconName = this.iconName?.includes(':') ? this.iconName.split(':')[1] : this.iconName;
        const size = parseInt(iconName?.split('_')[1]);

        if (size) {
            this.getHostElement().style.maxHeight = `${size}px`;
        }
    }

    ngOnChanges(): void {
        this.renderSvgIcon();
    }

    ngAfterContentInit(): void {
        if (this.autoColor) {
            this.formField?.control?.stateChanges.subscribe(this.updateState);
            this.updateState();
        }

        this.updateMaxHeight();
    }

    private renderSvgIcon(): void {
        if (!this.registry || !this.iconName) {
            this.svgIcon = false;

            return;
        }

        this.registry
            .getNamedSvgIcon(this.iconName)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (svg) => {
                    this.svgIcon = true;
                    const host = this.getHostElement();

                    // Remove any previously injected SVG.
                    const existing = host.querySelector('svg');

                    if (existing) {
                        host.removeChild(existing);
                    }

                    const size = parseInt(this.iconName?.split('_').pop() ?? '');

                    if (size) {
                        svg.setAttribute('width', `${size}`);
                        svg.setAttribute('height', `${size}`);
                    }

                    host.insertBefore(svg, host.firstChild);
                    this.changeDetectorRef.markForCheck();
                },
                error: () => {
                    // Icon not registered — fall through to font-class path.
                    this.svgIcon = false;
                    this.updateMaxHeight();
                    this.changeDetectorRef.markForCheck();
                }
            });
    }

    private updateState = () => {
        this.hasError = this.formField?.control?.errorState;

        this.changeDetectorRef.markForCheck();
    };
}
