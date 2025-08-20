import { CdkConnectedOverlay, CdkOverlayOrigin } from '@angular/cdk/overlay';
import { NgTemplateOutlet } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    computed,
    contentChild,
    Directive,
    ElementRef,
    inject,
    input,
    signal,
    TemplateRef,
    viewChild,
    ViewEncapsulation
} from '@angular/core';
import { KbqFormField, KbqLabel } from '@koobiq/components/form-field';
import { KbqFocusMonitor } from './focus-monitor';

const baseClass = 'kbq-inline-edit';

@Directive({
    standalone: true,
    selector: '[kbqInlineEditViewMode]',
    exportAs: 'kbqInlineEditViewMode'
})
export class KbqInlineEditViewMode {
    readonly templateRef = inject(TemplateRef);
}

@Directive({
    standalone: true,
    selector: '[kbqInlineEditEditMode]',
    exportAs: 'kbqInlineEditEditMode'
})
export class KbqInlineEditEditMode {
    readonly templateRef = inject(TemplateRef);
}

@Component({
    standalone: true,
    selector: 'kbq-inline-edit',
    exportAs: 'kbqInlineEdit',
    templateUrl: './inline-edit.html',
    styleUrls: ['./inline-edit.scss', './inline-edit-tokens.scss'],
    host: {
        class: baseClass,
        '[class.kbq-inline-edit_with-label]': '!!label()',
        '[tabindex]': 'tabIndex()',
        '[class]': 'className()',
        '(click)': 'onClick()',
        '(keydown.enter)': 'onClick()',
        '(keydown.space)': 'onClick()'
    },
    hostDirectives: [KbqFocusMonitor],
    imports: [
        NgTemplateOutlet,
        CdkConnectedOverlay,
        CdkOverlayOrigin
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class KbqInlineEdit {
    readonly placeholder = input<string>();

    protected readonly viewModeTemplateRef = contentChild.required(KbqInlineEditViewMode);
    protected readonly editModeTemplateRef = contentChild.required(KbqInlineEditEditMode);
    protected readonly label = contentChild(KbqLabel);
    protected readonly formFieldRef = contentChild(KbqFormField);
    protected readonly overlayOrigin = viewChild(CdkOverlayOrigin);

    protected readonly mode = signal<'view' | 'edit'>('view');

    protected readonly className = computed(() => `${baseClass}_${this.mode()}`);
    protected readonly isEditMode = computed(() => this.mode() === 'edit');
    protected readonly tabIndex = computed(() => (this.isEditMode() ? -1 : 0));
    protected readonly overlayWidth = computed<number | string>(() => {
        const elementRef: ElementRef<HTMLElement> | undefined = this.label()
            ? this.overlayOrigin()?.elementRef
            : this.elementRef;

        return elementRef?.nativeElement.clientWidth ?? '';
    });

    protected readonly elementRef = inject(ElementRef);

    toggleMode(): void {
        this.mode.update((mode) => (mode === 'view' ? 'edit' : 'view'));
    }

    onClick(): void {
        this.toggleMode();
    }

    onAttach() {
        this.formFieldRef()?.focus();
    }
}
