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
        { name: 'Alexandr Vsekhvalnov', role: 'editor' },
        { name: 'Sergey Voximplant', role: 'editor' },
        { name: 'Roman Turov', role: 'editor' },
        { name: 'Viber Curly', role: 'editor' },
        { name: 'Jackie Ckang', role: 'editor' },
        { name: 'Robert Skinner', role: 'editor' },
        { name: 'Woodie Hoodie', role: 'editor' },
        { name: 'Alex Buckmaster', role: 'editor' },
        { name: 'Chris Glasser', role: 'editor' },
        { name: 'Corina McCoy', role: 'editor' }
    ];
    protected readonly componentColors = KbqComponentColors;
}
