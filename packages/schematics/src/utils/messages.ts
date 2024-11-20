export function noProject(project: string) {
    return `Unable to find project '${project}' in the workspace`;
}

export const logMessage = (logger, logContent) => {
    logger.warn('-------------------------');
    logContent();
    logger.warn('-------------------------');
};
