import { NgStyle } from '@angular/common';
import { Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqPopoverModule } from '@koobiq/components/popover';

/**
 * @title Popover content
 */
@Component({
    standalone: true,
    selector: 'popover-content-example',
    templateUrl: 'popover-content-example.html',
    styleUrl: 'popover-content-example.css',
    imports: [
        KbqDropdownModule,
        KbqButtonModule,
        KbqFormFieldModule,
        KbqInputModule,
        KbqIconModule,
        KbqPopoverModule,
        NgStyle
    ]
})
export class PopoverContentExample {
    members: object[] = [
        { name: 'Alex Unipraise', role: 'Editor' },
        { name: 'Serge Vox', role: 'Editor' },
        { name: 'Rick Brick', role: 'Viewer' },
        { name: 'Viber Curly', role: 'Viewer' },
        { name: 'Jackie Ckang', role: 'Viewer' },
        { name: 'Robert Skinner', role: 'Viewer' },
        { name: 'Woodie Hoodie', role: 'Viewer' },
        { name: 'Alex Buckmaster', role: 'Viewer' },
        { name: 'Chris Glasser', role: 'Viewer' },
        { name: 'Corina McCoy', role: 'Viewer' }
    ];
    protected readonly componentColors = KbqComponentColors;
}
