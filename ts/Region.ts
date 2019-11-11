import Util from "util";

export class Region {
    constructor(city?: string | City, network?: string | NetworkType, zone?: string | Zone) {
        if (network) {
            if (typeof network === "string") this._network = network;
            else this._network = this.networkToString(network);
        }

        if (zone) {
            if (typeof zone === "string") this._zone = zone;
            else this._zone = this.zoneToString(zone);
        }

        if (city) {
            if (typeof city === "string") this._city = city;
            else {
                this._city = this.cityToString(city);
                this._zone = this.cityToZone(city);
            }
        }

        this.buildString();
    }

    public buildString(): void {
        // like "ap-southeast-2-internal-vpc"
        this._region = Util.format(this._pattern, this._zone, this._city, this._network);
    }

    public toString(): string {
        return this._region;
    }

    private networkToString(network: NetworkType): string {
        var value: string;
        switch (network) {
            case NetworkType.Public:
                value = "";
                break;
            case NetworkType.Internal:
                value = "-internal";
                break;
            case NetworkType.VPC:
                value = "-internal-vpc";
                break;
            default:
                throw new Error("Unsupported network type value: " + network);
        }
        return value;
    }

    private zoneToString(zone: Zone): string {
        var value: string;
        switch (zone) {
            case Zone.China:
                value = "cn";
                break;
            case Zone.AsiaPacific:
                value = "ap";
                break;
            case Zone.UniteState:
                value = "us";
                break;
            case Zone.Europe:
                value = "eu";
                break;
            case Zone.MiddleEast:
                value = "me";
                break;
            default:
                throw new Error("Unsupported zone value: " + zone);
        }
        return value;
    }

    private cityToString(city: City): string {
        var value: string;
        switch (city) {
            case City.Beijing:
                value = "beijing";
                break;
            case City.Shanghai:
                value = "shanghai";
                break;
            case City.Qingdao:
                value = "qingdao";
                break;
            case City.Hangzhou:
                value = "hangzhou";
                break;
            case City.Shenzhen:
                value = "shenzhen";
                break;

            case City.Hongkong:
                value = "hongkong";
                break;

            case City.Tokyo:
                value = "northeast-1";
                break;
            case City.Singapore:
                value = "southeast-1";
                break;
            case City.Sydney:
                value = "southeast-2";
                break;

            case City.Frankfurt:
                value = "central-1";
                break;

            case City.SiliconValley:
                value = "west-1";
                break;
            case City.Virginia:
                value = "east-1";
                break;

            case City.Dubai:
                value = "east-1";
                break;

            default:
                throw new Error("Unsupported city value: " + city);
        }
        return value;
    }

    private cityToZone(city: City): string {
        var value: string;
        switch (city) {
            case City.Beijing:
            case City.Shanghai:
            case City.Qingdao:
            case City.Hangzhou:
            case City.Shenzhen:
                value = "cn";
                break;

            case City.Hongkong:
                value = "cn";
                break;

            case City.Tokyo:
            case City.Singapore:
            case City.Sydney:
                value = "ap";
                break;

            case City.Frankfurt:
                value = "eu";
                break;

            case City.SiliconValley:
            case City.Virginia:
                value = "us";
                break;

            case City.Dubai:
                value = "me";
                break;

            default:
                throw new Error("Unsupported city value: " + city);
        }
        return value;
    }

    // cn,ap,eu,us,me -> China, Asia Pacific, Europe, Unite State, Middle East
    private _zone = "cn";
    // cn: hangzhou, beijing, qingdao, shanghai, shenzhen,
    // ap: northeast-1[Tokyo], southeast-1[Singapore], southeast-2[Sydney]
    // eu: central-1[Frankfurt]
    // us: west-1[Silicon Valley], west-2[Virginia]
    // me: east-1[Dubai]
    private _city = "hangzhou";
    // public-internal-vpc
    private _network = "";

    // pattern
    private _pattern = "%s-%s%s";

    // region string
    private _region = "cn-hangzhou";
}

export enum NetworkType {
    Public,
    Internal,
    VPC
}

export enum Zone {
    China,
    AsiaPacific,
    Europe,
    UniteState,
    MiddleEast
}

export enum Area {
    UniteState = 1,
    Germany = 49,
    Australia = 61,
    Singapore = 65,
    Japan = 81,
    China = 86,
    Hongkong = 852,
    UnitedArabEmirates = 971
}

export enum City {
    // China
    Beijing = (Area.China << 16) | 10,
    Shanghai = (Area.China << 16) | 21,
    Qingdao = (Area.China << 16) | 532,
    Hangzhou = (Area.China << 16) | 571,
    Shenzhen = (Area.China << 16) | 755,
    Hongkong = (Area.Hongkong << 16) | 0,
    // AsiaPacific
    Tokyo = (Area.Japan << 16) | 3,
    Singapore = (Area.Singapore << 16) | 0,
    Sydney = (Area.Australia << 16) | 2,
    // Europe
    Frankfurt = (Area.Germany << 16) | 335,
    // UniteState
    SiliconValley = (Area.UniteState << 16) | 415, // SanFrancisco
    Virginia = (Area.UniteState << 16) | 571, // Reston
    // MiddleEast
    Dubai = (Area.UnitedArabEmirates << 16) | 4
}
