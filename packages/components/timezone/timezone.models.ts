export interface KbqTimezoneZone {
    id: string;
    offset: string;
    city: string;
    countryCode: string;
    countryName: string;
    cities: string;
}

export interface KbqTimezoneGroup {
    countryName: string;
    countryCode: string;
    zones: KbqTimezoneZone[];
}

export interface KbqTimezonesByCountry {
    [countryName: string]: KbqTimezoneZone[];
}
