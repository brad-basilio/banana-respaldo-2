import BasicRest from "./BasicRest";

class SalesRest extends BasicRest {
    path = "sales";
    hasFiles = true;

    track = async (code, notify) => await this.simpleGet(`/api/${this.path}/track/${code}`, undefined, notify)
}

export default SalesRest;
