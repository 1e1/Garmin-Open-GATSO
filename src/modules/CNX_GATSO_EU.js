const META_URL = 'https://lufop.net/zones-de-danger-france-et-europe-asc-et-csv/';
const UPDATE_PATTERN = /Dernière Mise à jours ok le (?:<[^>]*>)?(\d{2})\D(\d{2})\D(\d{4})\D+(\d{2})\D(\d{2})\D(\d{2})(?:<[^>]*>)?/g;
const SOURCE_URL = 'https://lufop.net/wp-content/plugins/downloads-manager/upload/Lufop-Zones-de-danger-EU-CSV.zip';
const FILE_PATTERN = /^([A-Z]{2})(FeuRouge|Fixe|Tunnel)(?:[A-Z]{2})(\d+)?\.csv$/;
const REJECT_COUNTRIES = [ 'FR' ];

const PATH = require('path');
const FS = require('fs');
const OS = require('os');
const URL = require('url');
const ZIP = require('node-stream-zip');
const HTTPS = require('https');
const CRAWLER = require('./Crawler.js');
const POINT = require('./POI.js');

HTTPS.globalAgent.options.rejectUnauthorized = false;

const WORKSPACE = FS.mkdtempSync(PATH.join(OS.tmpdir(), 'lufop-'));


String.prototype.unescapeCsv = function() { 
    const firstChar = this.charAt(0);

    if (['"', "'"].includes(firstChar)) {
        const pattern = new RegExp('\\' + firstChar, 'g');
        const patternLeft = new RegExp('^' + firstChar + '*', 'g');
        const patternRight = new RegExp(firstChar + '*$', 'g');
        
        return this
            .replace(patternLeft, '')
            .replace(patternRight, '')
            .replace(pattern, firstChar)
            ;
    }

    return this;
}


module.exports = class CrawlerGatsoEU extends CRAWLER {
    
    constructor() {
        super();

        this.entryList = [];
    }

    getCode() {
        return 'gatso-EU';
    }

    async prepare() {
        const lastUpdateTimestamps = await this.getLastUpdateTimestamps();
        const lastUpdateTimestamp = lastUpdateTimestamps.reduce((min,val) => Math.max(min,val));
        const zip_path = this.options.cache + '.zip';

        if (!FS.existsSync(zip_path)) {
            await this.downloadSource(zip_path);
        }
        
        await this.unzip(zip_path, lastUpdateTimestamp);
    }

    async downloadSource(zip_path) {
        const options = URL.parse(SOURCE_URL);
        const zip_file = FS.createWriteStream(zip_path);
        
        zip_file.on('error', function(err) {
            console.error('[ERROR]', err); 
            FS.unlink(zip_path);
        });

        options.headers = { 'User-Agent': 'Mozilla/5.0' };

        console.log(zip_path);
        console.log(SOURCE_URL);

        const mainPromise = new Promise((resolve, reject) => {
            HTTPS.get(options, (request) => {
                request.pipe(zip_file).on('close', resolve);
            });
        });

        mainPromise.catch(err => this.kill(err));

        await mainPromise;
        
        zip_file.end();
    }
    
    
    async start() {
        const crawlerPromises = [];
        
        for (let processIndex = 0; processIndex < this.nbParallelProcess; ++processIndex) {
            const crawlerPromise = this.crawlLoopPromise();
    
            crawlerPromise.catch(err => this.kill(err));

            crawlerPromises.push(crawlerPromise);
        }
    
        await Promise.all(crawlerPromises);
    }


    // ---


    parseInfo(gatso, entry) {
        const basenamesList = [];

        const type = this.getTypeByEntry(entry);
        const rule = this.getRuleByEntry(entry, entry.speedLimit);

        const displayTypes = [ type.display ];
        const displayRules = [];

        if (true === rule.filter) {
            if (null !== rule.alert) {
                displayRules.push(rule.alert);
            }

            basenamesList.push(rule.basenames);
        }
    
        const displayType = this.displayTypesToString(displayTypes);
        const displayRule = this.displayRulesToString(displayRules);
        const basenames = basenamesList.concatInside();

        const point = new POINT();

        point
            .setCountry(entry.country)
            .setCoordinates(gatso.longitude, gatso.latitude)
            .setType(displayType)
            .setRule(displayRule)
            .setDescription(gatso.comment)
            .setLastUpdateTimestamp(entry.lastUpdateTimestamp)
            ;
    
        this.storage.addPoint(this.getCode(), point, basenames);
        this.addTimestamp(entry.lastUpdateTimestamp);
    }


    getTypeByEntry(entry) {
        const typeName = entry.type.toLowerCase();

        switch (typeName) {
            case 'fixe':
            return this.getType('instant_speed');

            case 'feurouge':
            return this.getType('traffic_light');

            case 'tunnel':
            return this.getType('tunnel');
        }

        throw `unknown type ${typeName}`;
    }


    getRuleByEntry(entry, speedLimit) {
        const typeName = entry.type.toLowerCase();

        switch (typeName) {
            case 'fixe':
            const ruleName = 'car' + speedLimit;
            return this.getRule(ruleName);

            case 'feurouge':
            return this.getRule('traffic_light');

            case 'tunnel':
            return this.getRule('tunnel');
        }

        throw `unknown rule ${typeName}`;
    }


    async unzip(zip_path, timestamp) {
        const unzipPromise = new Promise((resolve, reject) => {
            const unzip = new ZIP({
                file: zip_path,
                storeEntries: true,
            });

            unzip.on('error', (err) => {
                console.error('[ERROR]', err); 
                reject();
            });
            
            unzip.on('entry', (entry) => {
                const infos = entry.name.match(FILE_PATTERN);

                if (null === infos) {
                    console.log('REJECT', entry.name);
                } else {
                    const file = {
                        filename: entry.name,
                        country: infos[1].toUpperCase(),
                        type: infos[2],
                        speedLimit: undefined === infos[3] ? null : infos[3],
                        lastUpdateTimestamp: timestamp,
                    };

                    if (!REJECT_COUNTRIES.includes(file.country)) {
                        this.entryList.push(file);
                    }
                }
            });
            
            unzip.on('ready', () => {
                unzip.extract(null, WORKSPACE, async (err, count) => {
                    console.log(err ? 'Extract error' : `Extracted ${count} entries`);
                    unzip.close();

                    resolve();
                });
            });
        });

        await unzipPromise;
    }


    async crawlPromise(entry) {
        console.log(this.getCode() + ' ' + entry.filename);

        const csv_path = entry.path;
        const content = FS.readFileSync(csv_path, 'utf8');
        const lines = content.split(/\r?\n/);
        const line_pattern = /^(?:(-?\d*(?:\.\d*))\s*,\s*)(?:(-?\d*(?:\.\d*))\s*,\s*)(.*)$/;

        lines.forEach(line => {
            const lon_lat_comments = line.match(line_pattern);

            if (null !== lon_lat_comments) {
                const longitude = lon_lat_comments[1];
                const latitude = lon_lat_comments[2];
                const comment = lon_lat_comments[3];

                const json = {
                    longitude: longitude.trim(), 
                    latitude: latitude.trim(), 
                    comment: comment.trim().unescapeCsv(),
                };

                this.parseInfo(json, entry);
            }
        });
    }

    
    async crawlLoopPromise() {
        let entry = this.getEntry();
    
        while (null !== entry) {
            await this.crawlPromise(entry);
    
            entry = this.getEntry();
        }
    }
    
    
    getEntry() {
        const entry = this.entryList.pop();
    
        if (entry) {
            const path = PATH.resolve(WORKSPACE, entry.filename);
        
            entry.path = path;
    
            return entry;
        }
    
        return null;
    }


    async getLastUpdateTimestamps() {
        const timestamps = [];
        const options = URL.parse(META_URL);

        options.headers = { 
            'User-Agent': 'Mozilla/5.0',
         };

        const requestPromise = new Promise((resolve, reject) => {
            HTTPS.get(options, (request) => {
                let data = '';
        
                request.on('data', (chunk) => {
                    data += chunk;
                });

                request.on('error', (chunk) => {
                    reject();
                });

                request.on('end', () => {
                    let results;

                    while (results = UPDATE_PATTERN.exec(data)) {
                        const [ , day, month, year, hour, minute, second] = results;
                        const iso = `${year}-${month}-${day}T${hour}:${minute}:${second}`
                        const date = new Date(iso);
                        const timestamp = Math.round(date.getTime() / 1000);

                        timestamps.push(timestamp);
                    }

                    resolve();
                });
            });
        });

        await requestPromise;

        return timestamps;
    }
}