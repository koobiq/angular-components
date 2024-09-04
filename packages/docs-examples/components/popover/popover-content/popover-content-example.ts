import { Component, ViewEncapsulation } from '@angular/core';
import { KbqComponentColors } from '@koobiq/components/core';

/**
 * @title popover-content
 */
@Component({
    selector: 'popover-content-example',
    templateUrl: 'popover-content-example.html',
    styleUrls: ['popover-content-example.css'],
    encapsulation: ViewEncapsulation.None
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
