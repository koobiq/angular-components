import { TemplateRef } from '@angular/core';
import { KbqNotificationItem } from '@koobiq/components/notification-center';
import { KbqToastStyle } from '@koobiq/components/toast';

/** Text of one notification of the example list. */
export interface ExampleNotificationText {
    title: string;
    caption?: string;
}

/**
 * What the example notifications have in common across locales; their text comes from
 * the localized list by position. `richCaption` items take the caption template instead.
 * `date` has no year: the notifications are dated in the current one.
 */
const NOTIFICATIONS: { date: string; style: KbqToastStyle; actions?: boolean; richCaption?: boolean }[] = [
    { date: '10-03T10:30:00Z', style: KbqToastStyle.Success, actions: true, richCaption: true },
    { date: '10-03T09:01:00Z', style: KbqToastStyle.Warning, actions: true },
    { date: '10-03T09:10:00Z', style: KbqToastStyle.Warning, actions: true },
    { date: '10-03T09:15:00Z', style: KbqToastStyle.Error },
    { date: '10-02T23:45:00Z', style: KbqToastStyle.Error, actions: true, richCaption: true },
    { date: '10-02T20:30:00Z', style: KbqToastStyle.Warning, actions: true },
    { date: '10-02T18:10:00Z', style: KbqToastStyle.Contrast },
    { date: '10-02T14:22:00Z', style: KbqToastStyle.Warning, actions: true },
    { date: '10-02T12:00:00Z', style: KbqToastStyle.Contrast },
    { date: '10-01T23:50:00Z', style: KbqToastStyle.Warning, actions: true },
    { date: '10-01T20:15:00Z', style: KbqToastStyle.Contrast },
    { date: '10-01T17:40:00Z', style: KbqToastStyle.Error, actions: true },
    { date: '10-01T06:15:00Z', style: KbqToastStyle.Success },
    { date: '09-30T23:59:00Z', style: KbqToastStyle.Contrast },
    { date: '09-30T21:20:00Z', style: KbqToastStyle.Success },
    { date: '09-30T19:05:00Z', style: KbqToastStyle.Error },
    { date: '09-30T13:45:00Z', style: KbqToastStyle.Warning },
    { date: '09-30T09:18:00Z', style: KbqToastStyle.Warning },
    { date: '09-29T23:15:00Z', style: KbqToastStyle.Error },
    { date: '09-29T21:10:00Z', style: KbqToastStyle.Warning, actions: true },
    { date: '09-29T18:40:00Z', style: KbqToastStyle.Warning, actions: true },
    { date: '09-29T15:00:00Z', style: KbqToastStyle.Contrast },
    { date: '09-29T09:45:00Z', style: KbqToastStyle.Error },
    { date: '09-29T07:20:00Z', style: KbqToastStyle.Error, actions: true },
    { date: '09-28T22:30:00Z', style: KbqToastStyle.Success },
    { date: '09-28T19:15:00Z', style: KbqToastStyle.Warning },
    { date: '09-28T14:00:00Z', style: KbqToastStyle.Error },
    { date: '09-28T08:55:00Z', style: KbqToastStyle.Warning, actions: true },
    { date: '09-27T21:40:00Z', style: KbqToastStyle.Success },
    { date: '09-27T08:00:00Z', style: KbqToastStyle.Contrast, actions: true }
];

/**
 * The example notification list in the language of `text`. The ids are stable, so a list rebuilt on a
 * locale switch keeps the read state it had in `current`.
 */
export const createNotifications = (
    list: ExampleNotificationText[],
    templates: { actions: TemplateRef<unknown>; caption?: TemplateRef<unknown> },
    current: KbqNotificationItem[] = []
): KbqNotificationItem[] => {
    const read = new Map(current.map((item) => [item.id, item.read]));
    const year = new Date().getUTCFullYear();

    return NOTIFICATIONS.map(({ date, actions, richCaption, ...item }, index) => {
        const id = String(index + 1);
        const { title, caption } = list[index];

        return {
            ...item,
            id,
            date: `${year}-${date}`,
            title,
            caption: richCaption ? templates.caption : caption,
            icon: true,
            actions: actions ? templates.actions : undefined,
            read: read.get(id)
        };
    });
};
