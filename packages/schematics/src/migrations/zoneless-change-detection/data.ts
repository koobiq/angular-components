/**
 * Data for the `zoneless-change-detection` migration.
 *
 * The library no longer depends on zone.js: nothing in it waits for `NgZone.onStable` any more, so the
 * `MockNgZone` testing helper, which existed to fire that event on demand, is removed from
 * `@koobiq/components/core`. Warn-only: what a spec should wait for instead depends on what it was waiting for.
 */

export interface WarnPattern {
    pattern: string;
    message: string;
}

export const warnPatterns: WarnPattern[] = [
    {
        pattern: '\\bMockNgZone\\b',
        message:
            'MockNgZone was removed from @koobiq/components/core: no Koobiq component waits for NgZone.onStable any ' +
            'more. Drop the import and the `{ provide: NgZone, useFactory: () => new MockNgZone() }` override.'
    },
    {
        pattern: '\\.simulateZoneExit\\s*\\(',
        message:
            'simulateZoneExit() has nothing left to flush. Render with fixture.detectChanges(), or wait with ' +
            '`await fixture.whenStable()` (tick() / flush() inside fakeAsync).'
    }
];

export const SUMMARY = [
    'Koobiq components now render without zone.js, and keep working in applications that still provide',
    'provideZoneChangeDetection(). Specs that relied on zone.js running change detection after every event have',
    'to render explicitly, see "Zoneless change detection" in the migration guide.'
];
