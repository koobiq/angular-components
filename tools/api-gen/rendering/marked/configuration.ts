import {marked} from 'marked';
//@ts-ignore
import {renderer} from './renderer.js';

/** Globally configures marked for rendering JsDoc content to HTML. */
export function configureMarkedGlobally() {
  marked.use({
    renderer,
  });
}
