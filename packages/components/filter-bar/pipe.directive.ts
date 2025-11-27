import { AfterContentInit, Directive, inject, Injector, Input, ViewContainerRef } from '@angular/core';
import { KBQ_FILTER_BAR_PIPES, KbqPipe } from './filter-bar.types';
import { KBQ_PIPE_DATA } from './pipes/base-pipe';

@Directive({
    selector: '[kbqPipe]'
})
export class KbqPipeDirective<T extends KbqPipe> implements AfterContentInit {
    private injector = inject(Injector);
    private pipes = inject(KBQ_FILTER_BAR_PIPES);
    private viewContainerRef = inject(ViewContainerRef);

    @Input({ alias: 'kbqPipe' }) pipe: T;

    ngAfterContentInit(): void {
        const component = this.pipes.get(this.pipe.type);

        if (!component) {
            throw new Error(`Can't find component for this type: ${this.pipe.type}`);
        }

        this.viewContainerRef.createComponent(component, { injector: this.getInjector(this.pipe) });
    }

    private getInjector(pipe: T): Injector {
        return Injector.create({
            providers: [{ provide: KBQ_PIPE_DATA, useValue: pipe }],
            parent: this.injector
        });
    }
}
