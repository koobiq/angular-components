import { AfterContentInit, ChangeDetectorRef, Directive, inject, Input } from '@angular/core';
import { KbqFilterBar } from '../filter-bar.component';
import { KbqPipe, KbqPipeTemplate } from '../filter-bar.types';
import { KbqPipesComponent } from '../pipes.component';

@Directive({
    standalone: true
})
export class KbqPipeBase implements AfterContentInit {
    protected readonly changeDetectorRef = inject(ChangeDetectorRef);
    protected readonly filterBar = inject(KbqFilterBar);
    protected readonly pipes = inject(KbqPipesComponent);

    @Input() data!: KbqPipe;

    values: KbqPipeTemplate[];

    constructor() {
        console.log('KbqPipeBase: ');
    }

    ngAfterContentInit(): void {
        const template = this.filterBar.templates.find((template) => template.type === this.data?.type);

        if (template) {
            this.values = template.values as KbqPipeTemplate[];
        }
    }

    onDelete() {
        this.pipes.deletePipe(this.data);
    }
}
