import { logging } from '@angular-devkit/core';

export function noProject(project: string) {
    return `Unable to find project '${project}' in the workspace`;
}

export const logMessage = (logger: logging.LoggerApi, content: string[]) => {
    logger.warn('-------------------------');
    logger.warn(content.join('\n'));
    logger.warn('-------------------------');
};
