import { extractApiToJson } from './extraction/index.ts';
import { generateApiToHtml } from './rendering/index.ts';
import { generateManifest } from './manifest/index.ts';

export const generateApiDocs = () => {
    const data = extractApiToJson();
    const filteredData = generateManifest(data);
    generateApiToHtml(filteredData);
}
generateApiDocs();
