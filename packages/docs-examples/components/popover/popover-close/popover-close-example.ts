import { Component, ViewEncapsulation } from '@angular/core';
import { KbqComponentColors } from '@koobiq/components/core';

/**
 * @title popover-close
 */
@Component({
    selector: 'popover-close-example',
    templateUrl: 'popover-close-example.html',
    styleUrls: ['popover-close-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class PopoverCloseExample {
    members: object[] = [
        { name: 'Alexandr Vsekhvalnov', role: 'Editor' },
        { name: 'Sergey Voximplant', role: 'Editor' },
        { name: 'Roman Turov', role: 'Viewer' },
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