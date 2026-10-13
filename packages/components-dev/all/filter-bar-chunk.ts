/**
 * Single lazy entry point for both dev apps that reach `@koobiq/components/filter-bar`.
 *
 * That package has circular imports between its own files (#DS-5467). While every reference to it
 * comes from one dynamic import, the whole cyclic graph lands in one chunk and evaluates in the
 * order the standalone apps rely on. Give it a second entry point and the bundler hoists it into a
 * shared chunk, the cycle is split across a chunk boundary, and its component definitions read back
 * as `undefined` at runtime.
 */
export { DevApp as DevFilterBarApp } from '../filter-bar/module';
export { DevApp as DevUsernameApp } from '../username/module';
