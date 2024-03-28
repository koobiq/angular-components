/* tslint:disable:no-console */
/* tslint:disable:no-string-literal */
import chalk from 'chalk';


const { green, red } = chalk;

export async function notify(releaseData: any) {
    console.log(green('Start MM notification'));

    if (!verifyNotificationPossibility()) {
        return;
    }

    const matterMost = process.env['MATTERMOST_ENDPOINT_URL']!;
    const channel = process.env['MATTERMOST_CHANNEL'];

    const headers = { 'Content-Type': 'application/json' };
    const body = {
        channel: `${channel}`,
        username: 'Wall-e',
        short: false,
        text: `## ${releaseData.releaseTitle}\n ${releaseData.releaseNotes}`
    };

    console.log('POST notification: ', { url: matterMost, headers, body: JSON.stringify(body) });

    try {
        const response = await fetch(matterMost, {
            method: 'post',
            body: JSON.stringify(body),
            headers
        });

        if (response.ok) {
            console.info(green(`  ✓   Notification is posted in Mattermost.`));
        } else {
            console.error(red(`  ✘   Could not post notification in Mattermost.`));
            console.log(response.status, response.statusText);
        }
    } catch (error) {
        console.error(red(`  ✘   Could not post notification in Mattermost.`));
        console.log(error);
    }
}

export function verifyNotificationPossibility() {
    return process.env['MATTERMOST_ENDPOINT_URL'] && process.env['MATTERMOST_CHANNEL'];
}
