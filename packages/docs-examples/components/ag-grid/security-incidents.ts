const techniqueNames = {
    T1110: 'Brute Force',
    'T1110.003': 'Password Spraying',
    T1078: 'Valid Accounts',
    T1098: 'Account Manipulation',
    T1036: 'Masquerading',
    'T1021.004': 'SSH',
    T1046: 'Network Service Discovery',
    'T1059.001': 'PowerShell',
    'T1566.001': 'Spearphishing Attachment',
    'T1204.002': 'Malicious File',
    'T1071.004': 'DNS',
    'T1567.002': 'Exfiltration to Cloud Storage'
};

export type ExampleTechniqueId = keyof typeof techniqueNames;

export function exampleTechniqueLabel(id: ExampleTechniqueId): string {
    return `${id} · ${techniqueNames[id]}`;
}

export function exampleTechniqueUrl(id: ExampleTechniqueId): string {
    return `https://attack.mitre.org/techniques/${id.replace('.', '/')}/`;
}

export type ExampleSeverity = 'Critical' | 'High' | 'Medium' | 'Low';

type IncidentScenario = {
    event: string;
    category: string;
    aiVerdict: 'Safe' | 'Malicious' | 'Analyzing';
    connection: 'Connected' | 'Disconnected';
    severity: ExampleSeverity;
    description: string;
    detector: string;
    hosts: string[];
    techniques: ExampleTechniqueId[];
    subnet: string;
    sourceIp: string;
    destinationIp: string;
    protocol: string;
    port: number;
    process?: string;
    pid?: number;
    filePath?: string;
    fileSize?: number;
};

export type ExampleSecurityIncident = IncidentScenario & {
    id: string;
    status: (typeof exampleIncidentStatuses)[number];
    assignee: string;
    detectedAt: string;
    affectedHost: string;
};

const scenarios: IncidentScenario[] = [
    {
        event: 'Repeated SSH sign-in failures',
        aiVerdict: 'Analyzing',
        connection: 'Connected',
        category: 'Identity',
        severity: 'High',
        description:
            'Several accounts received the same pattern of failed sign-ins across six servers. One later opened an SSH session.',
        detector: 'Identity monitor',
        hosts: ['app-01', 'app-02', 'app-03', 'app-04', 'app-05', 'app-06'],
        techniques: ['T1110', 'T1110.003', 'T1078', 'T1021.004'],
        subnet: '192.0.2.0/26',
        sourceIp: '198.51.100.24',
        destinationIp: '192.0.2.11',
        protocol: 'SSH',
        port: 22,
        process: 'sshd',
        pid: 1824
    },
    {
        event: 'Network service discovery',
        aiVerdict: 'Safe',
        connection: 'Connected',
        category: 'Network',
        severity: 'Low',
        description: 'The gateway matched the connection attempts to a scheduled scan from the inventory service.',
        detector: 'Network sensor',
        hosts: ['gateway-01'],
        techniques: ['T1046'],
        subnet: '192.0.2.0/26',
        sourceIp: '203.0.113.7',
        destinationIp: '192.0.2.1',
        protocol: 'TCP',
        port: 8443
    },
    {
        event: 'Unusual PowerShell activity',
        aiVerdict: 'Safe',
        connection: 'Connected',
        category: 'Endpoint',
        severity: 'High',
        description: 'The endpoint sensor recorded an inventory script running outside its scheduled window.',
        detector: 'Endpoint sensor',
        hosts: ['ws-17'],
        techniques: ['T1059.001'],
        subnet: '192.0.2.0/26',
        sourceIp: '198.51.100.62',
        destinationIp: '192.0.2.17',
        protocol: 'WinRM',
        port: 5986,
        process: 'powershell.exe',
        pid: 4820,
        filePath: 'C:\\ProgramData\\Inventory\\collect.ps1',
        fileSize: 3584
    },
    {
        event: 'Suspicious invoice attachment',
        aiVerdict: 'Malicious',
        connection: 'Connected',
        category: 'Email',
        severity: 'Medium',
        description: 'The mail gateway quarantined the same invoice attachment in messages to three recipients.',
        detector: 'Mail gateway',
        hosts: ['mail-02', 'ws-08', 'ws-12'],
        techniques: ['T1566.001', 'T1204.002'],
        subnet: '192.0.2.0/26',
        sourceIp: '203.0.113.15',
        destinationIp: '192.0.2.25',
        protocol: 'SMTP',
        port: 25,
        filePath: '/var/quarantine/invoice.docm',
        fileSize: 735232
    },
    {
        event: 'Unexpected DNS traffic',
        aiVerdict: 'Analyzing',
        connection: 'Disconnected',
        category: 'Network',
        severity: 'Medium',
        description: 'The resolver received unusually long queries from two workstations on the same subnet.',
        detector: 'DNS monitor',
        hosts: ['dns-01', 'ws-06', 'ws-09'],
        techniques: ['T1071.004'],
        subnet: '192.0.2.0/26',
        sourceIp: '192.0.2.46',
        destinationIp: '192.0.2.53',
        protocol: 'DNS',
        port: 53
    },
    {
        event: 'Unscheduled archive upload',
        aiVerdict: 'Malicious',
        connection: 'Connected',
        category: 'Endpoint',
        severity: 'Critical',
        description: 'A backup archive was transferred to an unapproved storage service after business hours.',
        detector: 'Data loss prevention',
        hosts: ['backup-01', 'db-02'],
        techniques: ['T1567.002'],
        subnet: '192.0.2.64/26',
        sourceIp: '192.0.2.80',
        destinationIp: '203.0.113.150',
        protocol: 'HTTPS',
        port: 443,
        process: 'sync-agent',
        pid: 6912,
        filePath: '/srv/backup/accounts.tar.gz',
        fileSize: 1621094400
    },
    {
        event: 'Unexpected directory role assignment',
        aiVerdict: 'Analyzing',
        connection: 'Connected',
        category: 'Identity',
        severity: 'Critical',
        description:
            'Directory audit logs show a new administrator role for a service account outside the approved change window.',
        detector: 'Directory audit',
        hosts: ['dc-01', 'dc-02'],
        techniques: ['T1098', 'T1078'],
        subnet: '192.0.2.128/26',
        sourceIp: '198.51.100.48',
        destinationIp: '192.0.2.130',
        protocol: 'LDAPS',
        port: 636
    },
    {
        event: 'Executable disguised as a document',
        aiVerdict: 'Malicious',
        connection: 'Disconnected',
        category: 'Endpoint',
        severity: 'High',
        description: 'The endpoint sensor quarantined an executable with a document icon in the downloads directory.',
        detector: 'Endpoint sensor',
        hosts: ['ws-21'],
        techniques: ['T1036', 'T1204.002'],
        subnet: '192.0.2.0/26',
        sourceIp: '203.0.113.91',
        destinationIp: '192.0.2.21',
        protocol: 'HTTPS',
        port: 443,
        filePath: 'C:\\Users\\analyst\\Downloads\\statement.pdf.exe',
        fileSize: 194560
    }
];

export const EXAMPLE_INCIDENT_COUNT = 1000;
export const exampleIncidentStatuses = ['New', 'Resolved', 'In progress'] as const;
const assignees = ['Avery Chen', 'Maya Patel', 'Theo Brooks', 'Nina Park', 'Evan Reed'];
const firstDetection = Date.UTC(2026, 8, 3, 9, 40);

/** Each grid gets its own rows. Infinite grids request the same incidents by index. */
export function exampleGetIncidents(startRow = 0, endRow = 100): ExampleSecurityIncident[] {
    return Array.from({ length: Math.min(endRow, EXAMPLE_INCIDENT_COUNT) - startRow }, (_, offset) => {
        const index = startRow + offset;
        const scenario = scenarios[index % scenarios.length]!;
        const hosts = scenario.hosts.map((name) => name + '.example.test');

        return {
            ...scenario,
            hosts,
            techniques: [...scenario.techniques],
            affectedHost: hosts[0]!,
            id: `INC-${1001 + index}`,
            assignee: assignees[index % assignees.length]!,
            status: exampleIncidentStatuses[
                (index + Math.floor(index / scenarios.length)) % exampleIncidentStatuses.length
            ]!,
            detectedAt: new Date(firstDetection + index * 60_000).toISOString()
        };
    });
}
