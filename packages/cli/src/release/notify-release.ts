import chalk from 'chalk';

const { green, red, cyan } = chalk;

type MattermostConfig = {
    url: string;
    channel: string;
};

function getMattermostConfig(): MattermostConfig | null {
    const url = process.env['MATTERMOST_ENDPOINT_URL'];
    const channel = process.env['MATTERMOST_CHANNEL'];

    if (!url || !channel) {
        return null;
    }

    return { url, channel };
}

async function sendNotification(url: string, body: object): Promise<void> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const requestOptions: RequestInit = {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
    };

    console.info(cyan('POST notification:', { url, headers, body: JSON.stringify(body) }));

    const response = await fetch(url, requestOptions);
    if (!response.ok) {
        throw new Error(`Failed to post notification: ${response.status} ${response.statusText}`);
    }
}

function logNotificationResult(success: boolean, error?: Error): void {
    if (success) {
        console.info(green(`  ✓   Notification is posted in Mattermost.`));
    } else {
        console.error(red(`  ✘   Could not post notification in Mattermost.`));
        if (error) {
            console.error(error.message);
        }
    }
}

/**
 * Sends a notification to a Mattermost channel with the provided release data.
 *
 * @param {} releaseData - The data of the release to be included in the notification.
 */
export async function notify(releaseData: any): Promise<void> {
    console.info(green('Start MM notification'));

    const config = getMattermostConfig();
    if (!config) {
        console.error(red(`  ✘   MATTERMOST_ENDPOINT_URL or MATTERMOST_CHANNEL not found.`));
        return;
    }

    const body = {
        channel: `${config.channel}`,
        username: 'Wall-e',
        short: false,
        text: `## ${releaseData.releaseTitle}\n${releaseData.releaseNotes}`
    };

    try {
        await sendNotification(config.url, body);
        logNotificationResult(true);
    } catch (error) {
        logNotificationResult(false, error as Error);
    }
}
