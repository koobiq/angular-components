export const API_PREFIX = 'api';
export const MODULE_NAME_PREFIX = '@koobiq/';

export function removeKoobiqPrefixFromModule(moduleName: string): string {
  return moduleName.replace(MODULE_NAME_PREFIX, '');
}

export function getLinkToModule(moduleName: string) {
  return `${API_PREFIX}/${removeKoobiqPrefixFromModule(moduleName)}`;
}

export const normalizePath = (path: string): string => {
  if (path[0] === '/') {
    return path.substring(1);
  }
  return path;
};

export const normalizeTabUrl = (tabName: string): string => {
  return tabName
    .toLowerCase()
    .replaceAll(/<code>(.*?)<\/code>/g, '$1') // remove <code>
    .replaceAll(/<strong>(.*?)<\/strong>/g, '$1') // remove <strong>
    .replaceAll(/<em>(.*?)<\/em>/g, '$1') // remove <em>
    .replace(/\s|\//g, '-') // remove spaces and slashes
    .replace(/gt;|lt;/g, '') // remove escaped < and >
    .replace(/&#\d+;/g, '') // remove HTML entities
    .replace(/[^0-9a-zA-Z\-]/g, ''); // only keep letters, digits & dashes
};
