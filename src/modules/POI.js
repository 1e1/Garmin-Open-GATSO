const NOW = new Date();

module.exports = class POI {

    constructor() {
        this.country = '';
        this.geoJson = [];
        this.type = '';
        this.rule = '';
        this.description = '',
        this.lastUpdateTimestamp = NOW.getTime();
    }

    setCountry(country) {
        this.country = country;

        return this;
    }

    setCoordinates(longitude, latitude) {
        this.geoJson = [[longitude, latitude]];

        return this;
    }

    addCoordinates(longitude, latitude) {
        this.geoJson.push([longitude, latitude]);

        return this;
    }

    setGeoJson(geoJson) {
        this.geoJson = geoJson;

        return this;
    }

    setType(type) {
        this.type = type.trim();

        return this;
    }

    setRule(rule) {
        this.rule = rule.trim();

        return this;
    }

    setDescription(description) {
        this.description = description.trim();

        return this;
    }

    setLastUpdateTimestamp(timestamp) {
        this.lastUpdateTimestamp = timestamp;

        return this;
    }

    toString() {
        const geoJson = this.geoJson.map(ll=>ll.join(',')).join('|');
        
        return this.type + ' ' + this.rule + ' (' + this.description + ') ' + geoJson;
    }
}