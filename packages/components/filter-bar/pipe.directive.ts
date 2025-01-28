import { AfterContentInit, Directive, inject, Injector, Input, ViewContainerRef } from '@angular/core';
import { KbqPipe, KbqPipeData, KbqPipeTemplate, KbqPipeTypes } from './filter-bar.types';
import { KbqPipeDateComponent } from './pipes/pipe-date';
import { KbqPipeDatetimeComponent } from './pipes/pipe-datetime';
import { KbqPipeMultiSelectComponent } from './pipes/pipe-multi-select';
import { KbqPipeSelectComponent } from './pipes/pipe-select';
import { KbqPipeTextComponent } from './pipes/pipe-text';

@Directive({
    standalone: true,
    selector: '[kbq-pipe]'
})
export class KbqPipeDirective<T extends KbqPipe> implements AfterContentInit {
    private injector = inject(Injector);
    protected readonly viewContainerRef = inject(ViewContainerRef);

    values: KbqPipeTemplate[];

    @Input({ alias: 'kbq-pipe' })
    get pipe(): T {
        return this._pipe;
    }

    set pipe(value: T) {
        this._pipe = value;
    }

    private _pipe!: T;

    ngAfterContentInit(): void {
        const options = {
            injector: this.getInjector(this.pipe)
        };

        // this for extend and configure
        if (this.pipe.type === KbqPipeTypes.Text) {
            this.viewContainerRef.createComponent(KbqPipeTextComponent, options);
        } else if (this.pipe.type === KbqPipeTypes.Select) {
            this.viewContainerRef.createComponent(KbqPipeSelectComponent, options);
        } else if (this.pipe.type === KbqPipeTypes.MultiSelect) {
            this.viewContainerRef.createComponent(KbqPipeMultiSelectComponent, options);
        } else if (this.pipe.type === KbqPipeTypes.Date) {
            this.viewContainerRef.createComponent(KbqPipeDateComponent, options);
        } else if (this.pipe.type === KbqPipeTypes.Datetime) {
            this.viewContainerRef.createComponent(KbqPipeDatetimeComponent, options);
        }
    }

    getInjector(pipe: T): Injector {
        return Injector.create({
            providers: [{ provide: KbqPipeData, useValue: pipe }],
            parent: this.injector
        });
    }
}
