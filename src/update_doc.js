const BUILD_DIRECTORY = 'BUILD';
const MANIFEST_FILENAME = 'manifest.txt';
const VERSION_FILENAME = 'version.txt';
const VERSIONS_FILENAME = 'versions.txt';
const UPDATE_FILENAMES = [ './index.html', './cnx/version.svg', './cnx/{source}.svg' ];

const FS = require('fs');
const PATH = require('path');
const CONFIG = require('./modules/config.js');

const PROJECT_PATH = PATH.resolve(__dirname, '..');
const BUILD_PATH = PATH.resolve(PROJECT_PATH, BUILD_DIRECTORY);
const MANIFEST_PATH = PATH.resolve(BUILD_PATH, MANIFEST_FILENAME);
const VERSION_PATH = PATH.resolve(BUILD_PATH, VERSION_FILENAME);
const VERSIONS_PATH = PATH.resolve(BUILD_PATH, VERSIONS_FILENAME);
const UPDATE_PATHS = UPDATE_FILENAMES.map(filename => PATH.resolve(PROJECT_PATH, filename));




String.prototype.replaceToken = function (name, content) {
    const tokenStart = `<!-- [${name}[ -->`;
    const tokenEnd = `<!-- ]${name}] -->`;
    const tokenStartLength = tokenStart.length;

    let start = this.length;
    let end = this.lastIndexOf(tokenEnd, start);

    if (-1 !== end) {
        start = this.lastIndexOf(tokenStart, end);

        if (-1 !== start) {
            return this.substring(0, start + tokenStartLength)
                .concat(content, this.substring(end));
        }
    }

    return this;
}
String.prototype.replaceAllToken = function (name, content) {
    const tokenStart = `<!-- [${name}[ -->`;
    const tokenEnd = `<!-- ]${name}] -->`;
    const tokenStartLength = tokenStart.length;

    let string = this;
    let start = string.length;
    let end = string.lastIndexOf(tokenEnd, start);

    while (-1 !== end) {
        start = string.lastIndexOf(tokenStart, end);

        if (-1 !== start) {
            string = string.substring(0, start + tokenStartLength)
                .concat(content, string.substring(end));
        }

        end = string.lastIndexOf(tokenEnd, start);
    }

    return string;
}
Number.check = x => parseInt(x) == x;



function getLastupdateDate(path) {
    const timestamp = FS.readFileSync(path);
    const date = new Date(timestamp * 1000);

    return date;
};

function getVersions(path) {
    const versions = {};
    const versionsContent = FS.readFileSync(path);
    const versionsLines = versionsContent.toString().split(/\r?\n/);

    versionsLines.forEach(line => {
        const cleanLine = line.trim();
        const [code, timestamp] = cleanLine.split(' ', 2);

        versions[code] = timestamp;

        if (Number.check(timestamp)) {
            const date = new Date(timestamp * 1000);
    
            if (undefined !== timestamp) {
                versions[code] = date.toISOString().substring(0, 10);
            }
        }
    });

    return versions;
};


function createCountryMatrix(path) {
    const matrix = {};
    const manifestContent = FS.readFileSync(path);
    const manifestLines = manifestContent.toString().split(/\r?\n/);

    manifestLines.forEach(line => {
        if (0 < line.length) { 
            const matrix_entry = {};
            const [filename, dateISO, counter, name] = line.split('/');
            const [shortname, countryString] = name.split('| ');
            const countries = countryString.split(' ');
            const shortnameClean = shortname.replace(/^[^A-Za-z0-9]*/, '');

            countries.forEach(country => {
                matrix_entry[country] = parseInt(counter);
            });

            matrix[shortnameClean] = {
                counters: matrix_entry,
                filename: filename,
            };
        }
    });

    return matrix;
}

function createConfigMatrix(config) {
    const matrix = {};

    for (const key in config) {
        const line = config[key];
        const header = key; // line.label;
        
        if (undefined === line.filter || true === line.filter) {
            line.basenames.forEach(basename => {
                const shortnameClean = CONFIG.basenameToString(basename);

                if (undefined === matrix[shortnameClean]) {
                    matrix[shortnameClean] = {
                        counters: {},
                        filename: basename,
                    }
                }
                
                matrix[shortnameClean].counters[key] = 1;
            });
        }
    }

    return matrix;
}

function createGatsoMatrix() {
    return createConfigMatrix(CONFIG.rules);
}

function createServiceMatrix() {
    return createConfigMatrix(CONFIG.services);
}

function getCounterSum(matrix) {
    let sum = 0;

    Object.values(matrix).forEach(entry => {
        sum += Object.values(entry.counters)[0];
    });

    return sum;
}

function getCounters(matrix) {
    const counters = {};

    Object.values(matrix).forEach(entry => {
        const countries = entry.counters;

        Object.keys(countries).forEach(country => {
            const counter = countries[country];

            if (undefined === counters[country]) {
                counters[country] = counter;
            } else {
                counters[country] += counter;
            }
        });
    });

    return counters;
}

function getMatrixHTML(matrix, hasCounter) {
    const counters = getCounters(matrix);
    const countries = Object.keys(counters).sort();
    const shortnames = Object.keys(matrix);

    let thead = '<thead><tr><td></td>';
    let tfoot = '<tfoot><tr><td></td>';
    countries.forEach(country => {
        const counter = counters[country];

        thead += `<th><span>${country}</span></th>`;
        tfoot += `<th>${counter}</th>`;
    });

    if (true === hasCounter) {
        thead += '<td></td>';
        tfoot += '<td>#</td>';
    }

    thead += '</tr></thead>';
    tfoot += '</tr></tfoot>';

    let tbody = '<tbody>';
    shortnames.forEach(shortname => {
        const line = matrix[shortname];
        const filename = line.filename;
        const img = `<img alt="${shortname}" src="./src/assets/img/${filename}_tn.png" />`;
        let counter = 0;

        tbody += `<tr><th nowrap>${img} ${shortname}</th>`;
        countries.forEach(country => {
            const _counter = line.counters[country];

            if (undefined === _counter) {
                tbody += `<td></td>`;
            } else {
                tbody += `<td>✔︎</td>`;
                counter = _counter;
            }
        });

        if (true === hasCounter) {
            tbody += `<th>${counter}</th>`;
        }

        tbody += '</tr>';
    });
    tbody += '</tbody>';

    if (true !== hasCounter) {
        tfoot = '';
    }

    const table = `<table>${thead}${tbody}${tfoot}</table>`;

    return table;
}

function replaceIntoFile(path, replacements) {
    if (FS.existsSync(path)) {
        let content = FS.readFileSync(path, 'utf8');

        for (let token in replacements) {
            const value = replacements[token];

            content = content.replaceAllToken(token, value);
        }

        FS.writeFileSync(path, String(content));

        console.log(`updated ${path} at ${replacements.VERSION}`);
    }
}

(async () => {
    const countryMatrix = createCountryMatrix(MANIFEST_PATH);
    const date = getLastupdateDate(VERSION_PATH);
    const versions = getVersions(VERSIONS_PATH);
    const gatsoMatrix = createGatsoMatrix();
    const serviceMatrix = createServiceMatrix();
    const dateISO = date.toISOString().substring(0, 10);

    const amount = getCounterSum(countryMatrix);
    const countryTable = getMatrixHTML(countryMatrix, true);
    const gatsoTable = getMatrixHTML(gatsoMatrix, false);
    const serviceTable = getMatrixHTML(serviceMatrix, false);

    const replacements = {
        VERSION: dateISO,
        AMOUNT: amount,
        X_COUNTRY: countryTable,
        X_GATSO: gatsoTable,
        X_SERVICE: serviceTable,
    }

    for (let key in versions) {
        const _version = versions[key];
        const _key = 'V_' + key;

        replacements[_key] = _version;
    }

    UPDATE_PATHS.forEach(path => {
        if (-1 === path.indexOf('{source}')) {
            replaceIntoFile(path, replacements);
        } else {
            Object.keys(versions).forEach(key => {
                const realPath = path.replace('{source}', key);
                
                replaceIntoFile(realPath, replacements);
            });
        }
    });
})();
