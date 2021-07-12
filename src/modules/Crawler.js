const OS = require('os');
const CONFIG = require('./config.js');

const NB_PARALLEL_PROCESS_PER_CORE = 1;
const NB_PARALLEL_PROCESS = OS.cpus().length * NB_PARALLEL_PROCESS_PER_CORE;



module.exports = class Crawler {
    
    static from(storage) {
        const crawler = new this();

        crawler.storage = storage;

        return crawler;
    }

    constructor() {
        this.nbParallelProcess = NB_PARALLEL_PROCESS;

        this.options = {};
        this.storage = null;
        this.timestampMax = 0;
    }

    addTimestamp(timestamp) {
        this.timestampMax = Math.max(this.timestampMax, timestamp);

        return this;
    }

    getConfig(section, name) {
        const output = CONFIG[section][name];

        if (undefined === output) {
            throw `undefined CONFIG.${section}.${name}`;
        }

        return output;
    }

    getType(name) {
        return this.getConfig('types', name);
    }

    getRule(name) {
        return this.getConfig('rules', name);
    }

    getService(name) {
        return this.getConfig('services', name);
    }

    displayTypesToString(displayTypes) {
        return displayTypes.join(' ');
    }

    displayRulesToString(displayRules) {
        if (0 === displayRules.length) {
            return '';
        }

        const min = displayRules.reduce((min,val) => Math.min(min,val));

        return '' + min;
    }

    displayServicesToString(displayServices) {
        return displayServices.join(' ');
    }

    async run() {
        await this.prepare();
        await this.start();
    }

    async sleep(ms) {
        return new Promise(resolve => {
            setTimeout(resolve, ms);
        });
    }
    
    kill(err) {
        console.log(err);

        process.exit(1);
    }

    getCode() { throw "getCode() undefined" };
    
    async prepare() { throw "start() undefined" };
    async start() { throw "start() undefined" };
}