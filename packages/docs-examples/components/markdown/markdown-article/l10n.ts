import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Markdown source of the examples, keyed by example. */
export interface ExampleText {
    article: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        article: `# Основы кибербезопасности

![С подписью](https://koobiq.io/assets/images/markdown/markdown-image.png)
*Подпись*

## Сетевая безопасность

Кибербезопасность — это практика защиты систем, сетей и программ от цифровых атак. Такие атаки обычно направлены на доступ к конфиденциальной информации, её изменение или уничтожение; вымогательство денег у пользователей; или нарушение обычных бизнес-процессов.

Внедрение эффективных мер кибербезопасности сегодня особенно сложно: устройств больше, чем людей, а злоумышленники становятся изобретательнее. Успешный подход к кибербезопасности имеет несколько уровней защиты, распределённых по компьютерам, сетям, программам и данным, которые нужно сохранить.

## Защита данных

### Стандарты шифрования

Сетевая безопасность включает защиту работоспособности и целостности сети и данных. Она объединяет технологии аппаратного и программного обеспечения. Эффективная сетевая безопасность управляет доступом к сети и противодействует разнообразным угрозам, не давая им проникнуть в сеть или распространиться в ней.

### Методы аутентификации

Многофакторная аутентификация добавляет дополнительный уровень защиты, требуя от пользователей два и более факторов подтверждения для доступа к ресурсу. Это значительно снижает риск несанкционированного доступа даже при скомпрометированных паролях.

## Обнаружение угроз

![image-with-custom-width](https://koobiq.io/assets/images/markdown/markdown-image.png)
*Изображение с произвольной шириной*

Целевые многоэтапные атаки (APT) — это сложные долгосрочные кибератаки, при которых злоумышленники получают доступ к сети и остаются незамеченными длительное время. Такие атаки обычно направлены на кражу данных, а не на нанесение ущерба сети или организации. Системы обнаружения угроз используют машинное обучение и поведенческий анализ для выявления подозрительной активности и потенциальных нарушений безопасности до того, как они причинят значительный ущерб.

> Безопасность — это не продукт, а процесс, требующий непрерывного мониторинга и улучшения.

Планирование реагирования на инциденты важно для эффективного управления нарушениями безопасности. Хорошо структурированный план помогает минимизировать ущерб и время восстановления.

1. Выявить и оценить инцидент безопасности
2. Локализовать угрозу, чтобы предотвратить дальнейший ущерб
3. Удалить угрозу со всех затронутых систем
4. Восстановить обычные операции и отслеживать признаки слабости

Оценка рисков и управление уязвимостями — постоянные процессы, помогающие выявлять потенциальные бреши в защите. Регулярные аудиты безопасности и тестирование на проникновение помогают сохранять эффективность мер против развивающихся угроз.

Обучение сотрудников основам кибербезопасности необходимо: человеческая ошибка остаётся одной из главных причин нарушений. Регулярные тренинги помогают персоналу распознавать фишинг, социальную инженерию и другие распространённые векторы атак.

### Мониторинг безопасности

Системы управления информацией и событиями безопасности собирают и анализируют данные о безопасности из различных источников инфраструктуры организации.

\`\`\`bash
$ nmap -sS -O 192.168.1.1
\`\`\`

### Стандарты соответствия

#### Нормативные требования

Организации должны соответствовать различным требованиям и стандартам кибербезопасности в зависимости от отрасли и местоположения. Это могут быть GDPR, HIPAA, SOX и отраслевые требования, предписывающие конкретные меры и практики безопасности.

- Регулярная оценка и аудит безопасности
- Внедрение соответствующих технических и организационных мер
- Процедуры отчётности об инцидентах и уведомления о нарушениях

Постоянное улучшение кибербезопасности требует отслеживания новейших угроз, технологий и лучших практик в этой области.`
    },
    default: {
        article: `# Cybersecurity Fundamentals

![With caption text](https://koobiq.io/assets/images/markdown/markdown-image.png)
*Caption*

## Network Security

Cybersecurity is the practice of protecting systems, networks, and programs from digital attacks. These cyberattacks are usually aimed at accessing, changing, or destroying sensitive information; extorting money from users; or interrupting normal business processes.

Implementing effective cybersecurity measures is particularly challenging today because there are more devices than people, and attackers are becoming more innovative. A successful cybersecurity approach has multiple layers of protection spread across the computers, networks, programs, or data that one intends to keep safe.

## Data Protection

### Encryption Standards

Network security involves protecting the usability and integrity of network and data. It includes both hardware and software technologies. Effective network security manages access to the network and targets a variety of threats and stops them from entering or spreading on your network.

### Authentication Methods

Multi-factor authentication adds an extra layer of security by requiring users to provide two or more verification factors to gain access to a resource. This significantly reduces the risk of unauthorized access even if passwords are compromised.

## Threat Detection

![image-with-custom-width](https://koobiq.io/assets/images/markdown/markdown-image.png)
*Image with custom width*

Advanced persistent threats represent sophisticated, long-term cyber attacks where intruders gain access to a network and remain undetected for extended periods. These attacks are typically aimed at stealing data rather than causing damage to the network or organization. Threat detection systems use machine learning and behavioral analysis to identify suspicious activities and potential security breaches before they can cause significant damage.

> Security is not a product, but a process that requires continuous monitoring and improvement.

Incident response planning is crucial for organizations to effectively handle security breaches when they occur. A well-structured incident response plan helps minimize damage and recovery time.

1. Identify and assess the security incident
2. Contain the threat to prevent further damage
3. Eradicate the threat from all affected systems
4. Recover normal operations and monitor for signs of weakness

Risk assessment and vulnerability management are ongoing processes that help organizations identify potential security gaps. Regular security audits and penetration testing help ensure that security measures remain effective against evolving threats.

Cybersecurity awareness training is essential for all employees as human error remains one of the leading causes of security breaches. Regular training helps staff recognize phishing attempts, social engineering tactics, and other common attack vectors.

### Security Monitoring

Security information and event management systems collect and analyze security-related data from various sources across an organization's infrastructure.

\`\`\`bash
$ nmap -sS -O 192.168.1.1
\`\`\`

### Compliance Standards

#### Regulatory Requirements

Organizations must comply with various cybersecurity regulations and standards depending on their industry and location. These may include GDPR, HIPAA, SOX, and industry-specific requirements that mandate specific security controls and practices.

- Regular security assessments and audits
- Implementation of appropriate technical and organizational measures
- Incident reporting and breach notification procedures

Continuous improvement in cybersecurity requires staying updated with the latest threats, technologies, and best practices in the field.`
    }
};
