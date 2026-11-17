import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the clamped-text examples. MITRE technique names in the list example stay English as proper names. */
export interface ExampleTranslation {
    ddosText: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        ddosText:
            'При распределённой атаке отказа в обслуживании (атаке DDoS) входящий трафик, заваливающий жертву, исходит из множества разных источников. Для противодействия такой атаке требуются более сложные стратегии: простая блокировка одного источника не поможет, потому что источников много. Атака DoS или DDoS подобна группе людей, толпящихся у входа в магазин: легитимным покупателям трудно войти, торговля нарушается, бизнес теряет деньги. Преступники, устраивающие атаки DoS, часто целятся в сайты или службы, размещённые на высоконагруженных веб-серверах, таких как банки или платёжные шлюзы. Месть, шантаж и хактивизм могут быть мотивами этих атак.'
    },
    default: {
        ddosText:
            'In a distributed denial-of-service attack (DDoS attack), the incoming traffic flooding the victim originates from many different sources. More sophisticated strategies are required to mitigate this type of attack; simply attempting to block a single source is insufficient as there are multiple sources. A DoS or DDoS attack is analogous to a group of people crowding the entry door of a shop, making it hard for legitimate customers to enter, thus disrupting trade and losing the business money. Criminal perpetrators of DoS attacks often target sites or services hosted on high-profile web servers such as banks or credit card payment gateways. Revenge and blackmail, as well as hacktivism, can motivate these attacks.'
    }
};
