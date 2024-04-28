// @ts-ignore
import { extractApiToJson } from './extraction/index.js';
// @ts-ignore
import { generateApiToHtml } from './rendering/index.js';
// @ts-ignore
import { generateManifest } from './manifest/index.js';

export const generateApiDocs = () => {
    const data = extractApiToJson();
    const filteredData = generateManifest(data);
    generateApiToHtml(filteredData);
}
generateApiDocs();
