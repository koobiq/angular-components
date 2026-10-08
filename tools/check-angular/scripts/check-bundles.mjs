// Asserts what each production build carries: the library must pull in neither zone.js nor @angular/animations,
// so the zoneless application has neither, the zone one only zone.js, and the one that asks for both has both.
import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const dist = resolve(import.meta.dirname, '../dist');

// Strings the minifier keeps: a zone.js symbol prefix, and CSS classes of the animation engine.
const MARKERS = {
    'zone.js': ['__zone_symbol__'],
    '@angular/animations': ['ng-animate-queued', 'ng-trigger']
};

const EXPECTED = {
    zoneless: { 'zone.js': false, '@angular/animations': false },
    zone: { 'zone.js': true, '@angular/animations': false },
    'zone-animations': { 'zone.js': true, '@angular/animations': true }
};

let failed = false;

for (const [project, expected] of Object.entries(EXPECTED)) {
    const browser = join(dist, project, 'browser');
    const code = readdirSync(browser)
        .filter((file) => file.endsWith('.js'))
        .map((file) => readFileSync(join(browser, file), 'utf8'))
        .join('\n');

    for (const [dependency, markers] of Object.entries(MARKERS)) {
        const found = markers.some((marker) => code.includes(marker));
        const ok = found === expected[dependency];

        failed ||= !ok;
        console.log(`${ok ? '✓' : '✗'} ${project}: ${dependency} ${found ? 'bundled' : 'absent'}`);
    }
}

process.exitCode = failed ? 1 : 0;
