import { DOCUMENT } from '@angular/common';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    OnDestroy,
    TemplateRef,
    ViewEncapsulation,
    inject,
    model,
    signal,
    viewChild
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqModalModule, KbqModalService } from '@koobiq/components/modal';
import { KbqSidepanelModule, KbqSidepanelPosition, KbqSidepanelService } from '@koobiq/components/sidepanel';
import { KbqToastService, KbqToastStyle } from '@koobiq/components/toast';
import { KbqToggleModule } from '@koobiq/components/toggle';
import { DEV_MFE_CONFIG, DevMountedMfe, devMirrorGlobalStyles, devMountMfe } from './mount-mfe';

/**
 * One micro-frontend rendered inside a shadow root (`ViewEncapsulation.ShadowDom`). Reused at every nesting level:
 * it mounts a nested child MFE into `#childHost` (a new independent Angular app) until `maxLevel`, so the playground
 * is a stack of independent, nested shadow-root MFEs. Each MFE can open a modal/sidepanel and then a toast on top —
 * all inside its own shadow root — to verify overlay placement and stacking under Module Federation.
 */
@Component({
    selector: 'dev-app',
    imports: [
        FormsModule,
        KbqButtonModule,
        KbqToggleModule,
        KbqModalModule,
        KbqSidepanelModule
    ],
    templateUrl: './template.html',
    styleUrl: './styles.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.ShadowDom,
    host: {
        '[class.kbq-dark]': 'isDark()',
        '[class.kbq-light]': '!isDark()',
        '[attr.data-mfe-level]': 'config.level'
    }
})
export class DevMfeRoot implements AfterViewInit, OnDestroy {
    private readonly document = inject(DOCUMENT);
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly toastService = inject(KbqToastService);
    private readonly modalService = inject(KbqModalService);
    private readonly sidepanelService = inject(KbqSidepanelService);

    protected readonly config = inject(DEV_MFE_CONFIG);
    protected readonly toastStyle = KbqToastStyle;

    /** Per-MFE theme — toggles the theme class on this MFE's host element (see host bindings). */
    protected readonly isDark = model(false);

    /** Where this MFE's `.cdk-overlay-container` ended up, updated after opening an overlay. */
    protected readonly overlayLocation = signal('— (open something)');

    readonly childHost = viewChild<ElementRef<HTMLElement>>('childHost');
    readonly modalContent = viewChild.required<TemplateRef<any>>('modalContent');
    readonly sidepanelContent = viewChild.required<TemplateRef<any>>('sidepanelContent');

    private observer?: MutationObserver;
    private child?: DevMountedMfe;

    protected get hasChild(): boolean {
        return this.config.level < this.config.maxLevel;
    }

    ngAfterViewInit(): void {
        const shadowRoot = this.elementRef.nativeElement.shadowRoot;

        if (shadowRoot) {
            this.observer = devMirrorGlobalStyles(shadowRoot, this.document);
        }

        const host = this.childHost()?.nativeElement;

        if (this.hasChild && host) {
            // Defer so we don't create a child application during this app's change-detection pass.
            queueMicrotask(() => {
                devMountMfe(host, { ...this.config, level: this.config.level + 1 }, DevMfeRoot)
                    .then((child) => (this.child = child))
                    .catch((error) => console.error('Failed to mount nested MFE', error));
            });
        }
    }

    ngOnDestroy(): void {
        this.observer?.disconnect();
        this.child?.appRef.destroy();
    }

    /** Toggles `?container=shadow` / `?container=default`. The mode is fixed at bootstrap, so this reloads the page. */
    protected toggleContainerMode(): void {
        const params = new URLSearchParams(this.document.location.search);

        params.set('container', this.config.useShadow ? 'default' : 'shadow');
        this.document.location.search = params.toString();
    }

    protected showToast(style: KbqToastStyle): void {
        this.toastService.show({
            style,
            title: `${style} toast · MFE level ${this.config.level}`,
            caption: 'Should appear on top, inside this MFE shadow root'
        });

        this.updateOverlayLocation();
    }

    protected openModal(): void {
        this.modalService.create({
            kbqTitle: `Modal · MFE level ${this.config.level}`,
            kbqContent: this.modalContent(),
            kbqClosable: true
        });

        this.updateOverlayLocation();
    }

    protected openSidepanel(): void {
        this.sidepanelService.open(this.sidepanelContent(), {
            position: KbqSidepanelPosition.Right,
            hasBackdrop: true
        });

        this.updateOverlayLocation();
    }

    private updateOverlayLocation(): void {
        const inShadow = this.elementRef.nativeElement.shadowRoot?.querySelector('.cdk-overlay-container');
        const inBody = this.document.body.querySelector('.cdk-overlay-container');

        this.overlayLocation.set(inShadow ? 'this MFE shadow root ✅' : inBody ? 'document.body ❌ (bug)' : '—');
    }
}
