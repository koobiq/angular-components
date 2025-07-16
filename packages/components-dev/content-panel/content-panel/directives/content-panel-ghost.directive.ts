import { Directive, ElementRef, inject, OnInit } from '@angular/core';

@Directive({
    selector: '[icContentPanelGhost], ic-content-panel-ghost',
    standalone: true
})
export class IcContentPanelGhostDirective implements OnInit {
    readonly #elementRef: ElementRef<HTMLElement> = inject<ElementRef<HTMLElement>>(ElementRef);

    ngOnInit(): void {
        this.#elementRef.nativeElement.style.visibility = 'hidden';
        this.#elementRef.nativeElement.style.flex = '0 0 auto';
    }
}
