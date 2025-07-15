class Global {
    static WA_URL = null;
    static PUBLIC_RSA_KEY = null;
    static APP_PROTOCOL = null;
    static APP_URL = null;
    static APP_DOMAIN = null;
    static APP_ENV = "production";
    static APP_NAME = "BananaLab";
    static APP_CORRELATIVE = null;
    static GMAPS_API_KEY = null;
    static APP_COLOR_PRIMARY = null;
    static CULQI_PUBLIC_KEY = null;
    static CULQI_API = null;

    static set = (name, value) => {
        Global[name] = value;
    };

    static get = (name) => {
        return Global[name];
    };
}

export default Global;
