import { AnimationEvent } from '@angular/animations';
import { Injectable } from '@angular/core';
import { DateAdapter } from '@koobiq/date-adapter';
import { BehaviorSubject, merge } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class KbqNotificationCenterService<D> {
    silentMode: BehaviorSubject<boolean> = new BehaviorSubject(false);

    changes = merge(this.silentMode);

    get items() {
        return Object.values(this.notificationsDict);
    }

    readonly animation = new BehaviorSubject<AnimationEvent | null>(null);

    private notificationsDict: { [id: number]: any } = {};

    constructor(readonly adapter: DateAdapter<D>) {
        console.log('KbqNotificationCenterService: ');
    }

    setSilentMode(value: boolean) {
        console.log('setSilentMode: ', value);
        this.silentMode.next(value);
    }

    push() {
        return '';
    }

    removeNotification(item) {
        console.log('removeNotification: ', item);
    }

    removeGroupOfNotifications(item) {
        console.log('removeGroupOfNotifications: ', item);
    }

    removeAllNotifications() {
        console.log('removeAllNotifications: ');
    }
}
