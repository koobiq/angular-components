import chalk from 'chalk';
import { request as httpsRequest } from 'https';
import { ChangelogReleaseNotes } from './extract-release-notes';

const { cyan, green, red } = chalk;

type MattermostConfig = {
    url: string;
    channel: string;
};

// The webhook host serves a TLS chain rooted in a private CA that Node does not trust, so CI opts
// out of verification for this one request. Off by default on purpose: @koobiq/cli is published, and
// skipping certificate checks must never be something a consumer gets without asking for it.
function allowsUntrustedTls(): boolean {
    return process.env['MATTERMOST_ALLOW_UNTRUSTED_TLS'] === 'true';
}

function getMattermostConfig(): MattermostConfig | null {
    const url = process.env['MATTERMOST_WEBHOOK_URL'];
    const channel = process.env['MATTERMOST_CHANNEL'];

    if (!url || !channel) {
        return null;
    }

    return { url, channel };
}

// Use https.request (not fetch/undici) — the Mattermost webhook is behind a WAF
// that blocks requests by TLS fingerprint / HTTP/2. The Node built-in HTTP stack
// (HTTP/1.1 + standard TLS) is the same one @actions/http-client uses and passes
// the WAF. Don't "modernize" this back to fetch without re-checking the WAF.
async function sendNotification(url: string, body: object): Promise<void> {
    const payload = JSON.stringify(body);
    const headers: Record<string, string> = {
        'Content-Type': 'application/json; charset=utf-8',
        Accept: 'application/json',
        'Content-Length': Buffer.byteLength(payload).toString()
    };

    console.info(cyan('  [DEBUG] HTTP request:'), {
        method: 'POST',
        url,
        headers,
        body: payload
    });

    const rejectUnauthorized = !allowsUntrustedTls();

    if (!rejectUnauthorized) {
        console.info(cyan('  [DEBUG] TLS certificate verification is disabled for this request.'));
    }

    const parsed = new URL(url);
    const { statusCode, statusMessage, responseBody } = await new Promise<{
        statusCode: number;
        statusMessage: string;
        responseBody: string;
    }>((resolve, reject) => {
        const req = httpsRequest(
            {
                method: 'POST',
                hostname: parsed.hostname,
                port: parsed.port || undefined,
                path: parsed.pathname + parsed.search,
                headers,
                rejectUnauthorized
            },
            (res) => {
                let data = '';

                res.setEncoding('utf8');
                res.on('data', (chunk: string) => {
                    data += chunk;
                });
                res.on('end', () => {
                    resolve({
                        statusCode: res.statusCode ?? 0,
                        statusMessage: res.statusMessage ?? '',
                        responseBody: data
                    });
                });
            }
        );

        req.on('error', reject);
        req.write(payload);
        req.end();
    });

    console.info(cyan(`  [DEBUG] HTTP response: ${statusCode} ${statusMessage}`));

    if (statusCode < 200 || statusCode >= 300) {
        console.error(red(`  ✘   Mattermost response body: ${responseBody}`));
        throw new Error(`Failed to post notification: ${statusCode} ${statusMessage}`);
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
export async function notify(releaseData: ChangelogReleaseNotes): Promise<void> {
    console.log(green('Start MM notification'));

    const config = getMattermostConfig();

    if (!config) {
        console.error(red(`  ✘   MATTERMOST_WEBHOOK_URL or MATTERMOST_CHANNEL not found.`));

        return;
    }

    const body = {
        channel: config.channel,
        username: 'Wall-e',
        text: `${releaseData.releaseTitle}\n${releaseData.releaseNotes}`
    };

    try {
        await sendNotification(config.url, body);
        logNotificationResult(true);
    } catch (error) {
        logNotificationResult(false, error as Error);
    }
}
