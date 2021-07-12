const FS = require('fs');
const POINTER = require('./Writer/Writer.js');

const TEMPORARY_EXTENSION = '.part';

module.exports = class FileMatrix {

    static from(filePath) {
        const fileMatrix = new this();

        fileMatrix.filePath = filePath;

        return fileMatrix;
    }

    constructor() {
        this.filePath = '';
        
        this.sources = [];
        this.formats = [];
        this.pointers = {};

        this.size = 0;
        this.timestampMax = 0;
        this.countries = [];
    }

    addSource(source) {
        this.sources.push(source);

        this.formats.forEach(format => {
            this.addPointer(source, format);
        });

        return this;
    }

    setSources(sources) {
        sources.forEach(source => {
            this.addSource(source);
        });

        return this;
    }

    addFormat(format) {
        this.formats.push(format);

        this.sources.forEach(source => {
            this.addPointer(source, format);
        });

        return this;
    }

    setFormats(formats) {
        formats.forEach(format => {
            this.addFormat(format);
        });

        return this;
    }

    addCountry(country) {
        if (!this.countries.includes(country)) {
            this.countries.push(country);
        }

        return this;
    }

    makeKey(source, format) {
        return source + ':' + format;
    }

    getFullFilePath(format) {
        return this.filePath + '.' + format;
    }

    getSourcedFilePath(source, format) {
        return this.filePath + '_' + source + '.' + format;
    }

    generatePointers() {
        this.sources.forEach(source => {
            this.formats.forEach(format => {
                this.addPointer(source, format);
            });
        });
    }

    addPointer(source, format) {
        const key = this.makeKey(source, format);

        if (undefined === this.pointers[key]) {
            if (!this.sources.includes(source)) {
                this.sources.push(source);
            }

            if (!this.formats.includes(format)) {
                this.formats.push(format);
            }

            const filePath = this.getSourcedFilePath(source, format);
            const pointer = POINTER.from(filePath);

            pointer.filePath += TEMPORARY_EXTENSION;

            this.pointers[key] = pointer;
        }

        return this;
    }

    open() {
        Object.values(this.pointers).forEach(pointer => {
            pointer.open();
        });

        return this;
    }

    addPoint(source, point) {
        this.formats.forEach(format => {
            const key = this.makeKey(source, format);
            const pointer = this.pointers[key];

            pointer.addPoint(point);
        });

        this.size++;
        this.timestampMax = Math.max(this.timestampMax, point.lastUpdateTimestamp);
        this.addCountry(point.country);

        return this;
    }

    close() {
        Object.values(this.pointers).forEach(pointer => {
            pointer.close();
        });

        return this;
    }

    delete() {
        Object.values(this.pointers).forEach(pointer => {
            pointer.delete();
        });

        this.pointers = {};

        return this;
    }

    clean() {
        if (0 === this.size) {
            this.delete();
        }

        return this;
    }

    package() {
        if (0 !== this.size) {
            this.formats.forEach(format => {
                const filePath = this.getFullFilePath(format);
                const pointer = POINTER.from(filePath);

                pointer.open();
                pointer.addHeader();

                this.sources.forEach(source => {
                    const key = this.makeKey(source, format);
                    const file = this.pointers[key];

                    if (undefined !== file) {
                        const part = FS.readFileSync(file.filePath);

                        FS.writeSync(pointer.fs, part);
                    }
                });

                pointer.addFooter();
                pointer.close();
            });
        }

        this.delete();

        return this;
    }

    toString() {
        const sources = this.sources.join(',');
        const formats = this.formats.join(',');
        const countries = this.countries.join(',');
        
        return this.filePath + '[' + sources + '][' + formats + '][' + countries + '] x' + this.size + ' ' + this.timestampMax;
    }
}