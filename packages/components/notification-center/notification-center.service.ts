import { AnimationEvent } from '@angular/animations';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class KbqNotificationCenterService {
    get items() {
        return Object.values(this.toastsDict);
    }

    readonly animation = new BehaviorSubject<AnimationEvent | null>(null);

    private toastsDict: { [id: number]: any } = {};

    add() {
        return '';
    }

    delete(id: number) {
        delete this.toastsDict[id];
    }
}
