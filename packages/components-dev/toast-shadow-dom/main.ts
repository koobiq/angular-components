import { DevMfeRoot } from './module';
import { devMountMfe } from './mount-mfe';

// `?container=shadow` routes each MFE's overlays into its own shadow root (the fix); anything else keeps the default
// CDK behavior (overlays escape to `document.body` — the bug). Defaults to the broken behavior so it is visible
// immediately. The root MFE then recursively mounts nested independent MFEs up to `maxLevel`.
const useShadow = new URLSearchParams(globalThis.location.search).get('container') === 'shadow';
const host = globalThis.document.querySelector('dev-app');

if (host instanceof HTMLElement) {
    devMountMfe(host, { level: 1, maxLevel: 2, useShadow }, DevMfeRoot).catch((error: unknown) =>
        console.error('Failed to mount root MFE', error)
    );
}
