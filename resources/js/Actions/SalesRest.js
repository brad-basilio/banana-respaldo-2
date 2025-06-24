import BasicRest from "./BasicRest";

class SalesRest extends BasicRest {
    path = "sales";
    hasFiles = true;

    track = async (code) => await this.simpleGet(`/api/${this.path}/track/${code}`)
}

export default SalesRest;
