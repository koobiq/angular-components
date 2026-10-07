import {
    AfterContentInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    DestroyRef,
    ElementRef,
    inject,
    input,
    OnChanges,
    SimpleChanges,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { KbqColorDirective } from '@koobiq/components/core';
import { EMPTY, ReplaySubject } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { KBQ_ICON_ERROR_STATE_CONTEXT } from './icon-error-state-context';
import { KbqIconRegistry } from './icon-registry';

@Component({
    selector: '[kbq-icon]',
    template: '<ng-content />',
    styleUrls: ['icon.scss', 'icon-tokens.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq kbq-icon',
        '[class]': 'svgIcon ? null : iconName',
        '[class.kbq-error]': 'color() === "error" || hasError || autoColorError'
    }
})
export class KbqIcon extends KbqColorDirective implements AfterContentInit, OnChanges {
    readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

    /**
     * Host providing error state for `autoColor`, when the icon sits inside one (e.g. a form field).
     * @docs-private
     */
    protected readonly errorStateContext = inject(KBQ_ICON_ERROR_STATE_CONTEXT, { optional: true });
    protected readonly changeDetectorRef = inject(ChangeDetectorRef);
    protected readonly registry = inject(KbqIconRegistry, { optional: true });
    protected readonly destroyRef = inject(DestroyRef);

    readonly small = input(false);
    autoColor = false;

    hasError: boolean = false;

    /**
     * Whether `autoColor` takes the error color from the host's error state.
     * @docs-private
     */
    protected get autoColorError(): boolean {
        return this.autoColor && !!this.errorStateContext?.errorState();
    }

    /** Name of an icon within a `@koobiq/icons`. Accepts "namespace:name" syntax. */
    iconName: string;

    /** @docs-private */
    readonly autoColorInput = input<boolean | undefined>(undefined, { alias: 'autoColor' });

    /** @docs-private */
    readonly iconNameInput = input<string | undefined>(undefined, { alias: 'kbq-icon' });

    protected name = 'KbqIcon';

    /**
     * True when icon is being rendered as inline SVG.
     * @docs-private
     */
    protected svgIcon = false;

    /** @docs-private */
    protected readonly svgIconName = new ReplaySubject<string | undefined>(1);

    getHostElement() {
        return this.elementRef.nativeElement;
    }

    /**
     * Sets the icon name outside of the template, keeping the SVG resolution stream in sync.
     * `ngOnChanges` does not run for values assigned in a constructor, so subclasses have to use this.
     *
     * @docs-private
     */
    protected setIconName(name: string): void {
        this.iconName = name;
        this.svgIconName.next(name);
    }

    updateMaxHeight() {
        if (this.name !== 'KbqIcon') {
            return;
        }

        const size = this.parseIconSize();

        if (size) {
            this.getHostElement().style.maxHeight = `${size}px`;
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        // A bound input is handed to its member as the decorator input did; unbound, it leaves what code wrote.
        if (changes['autoColorInput']) {
            const autoColor = this.autoColorInput();

            if (autoColor !== undefined) this.autoColor = autoColor;
        }

        if (changes['iconNameInput']) {
            const iconName = this.iconNameInput();

            if (iconName !== undefined) this.setIconName(iconName);
        }
    }

    ngAfterContentInit(): void {
        this.updateMaxHeight();

        this.svgIconName
            .pipe(
                switchMap((name) => {
                    if (!this.registry || !name) {
                        this.svgIcon = false;

                        return EMPTY;
                    }

                    return this.registry.getNamedSvgIcon(name);
                }),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe({
                next: (svg) => {
                    this.svgIcon = true;
                    const host = this.getHostElement();

                    // Remove any previously injected SVG.
                    const existing = host.querySelector('svg');

                    if (existing) {
                        host.removeChild(existing);
                    }

                    const size = this.parseIconSize();

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

    private parseIconSize(): number {
        const iconName = this.iconName;
        const baseName = iconName?.includes(':') ? iconName.split(':')[1] : iconName;

        return parseInt(baseName?.split('_').pop() ?? '');
    }
}
