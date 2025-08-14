import { CdkMonitorFocus } from '@angular/cdk/a11y';
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
    ViewEncapsulation
} from '@angular/core';
import { KbqLabel } from '@koobiq/components/form-field';
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
        '[tabindex]': 'tabIndex()',
        '[class]': 'className()',
        '(click)': 'onClick()'
    },
    hostDirectives: [KbqFocusMonitor],
    imports: [
        NgTemplateOutlet,
        CdkConnectedOverlay,
        CdkMonitorFocus,
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

    readonly elementRef = inject(ElementRef);

    protected readonly mode = signal<'view' | 'edit'>('view');

    protected readonly className = computed(() => `${baseClass}_${this.mode()}`);
    protected readonly tabIndex = computed(() => (this.mode() === 'edit' ? -1 : 0));

    toggleMode(): void {
        this.mode.update((mode) => (mode === 'view' ? 'edit' : 'view'));
    }

    onClick(): void {
        this.toggleMode();
    }
}
