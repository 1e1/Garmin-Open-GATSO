const FILE = require('./FileMatrix.js');

module.exports = class FileList {

    static from(directory, basenames) {
        const fileList = new this();

        fileList.directory = directory;
        fileList.setBasenames(basenames);

        return fileList;
    }

    constructor() {
        this.directory = '';
        this.fileList = {};
        this.timestampMax = 0;
    }

    addBasename(basename) {
        if (undefined === this.fileList[basename]) {
            const filePath = this.directory + '/' + basename;
            const file = FILE.from(filePath);

            this.fileList[basename] = file;
        }

        return this;
    }

    setBasenames(basenames) {
        basenames.forEach(basename => {
            this.addBasename(basename);
        });

        return this;
    }

    foreachUniqueFiles(callback) {
        const filePaths = [];

        Object.values(this.fileList).forEach(file => {
            Object.values(file.pointers).forEach(pointer => {
                const filePath = pointer.filePath;

                if (!filePaths.includes(filePath)) {
                    filePaths.push(filePath);

                    callback(pointer);
                }
            });
        });

        return this;
    }

    open(sources, formats) {
        Object.values(this.fileList).forEach(file => {
            file
                .setSources(sources)
                .setFormats(formats)
                .open()
                ;
        });

        return this;
    }

    addPoint(source, point, basenames) {
        basenames.forEach((basename, index) => {
            if (index === basenames.indexOf(basename)) {
                this.fileList[basename].addPoint(source, point);
            }
        });

        return this;
    }

    close() {
        Object.values(this.fileList).forEach(file => {
            file
                .close()
                .clean()
                .package()
                ;

            this.timestampMax = Math.max(this.timestampMax, file.timestampMax);

            console.log(file.toString());
        });

        return this;
    }

    getSizedBasenames() {
        const basenames = [];

        for (const basename in this.fileList) {
            const file = this.fileList[basename];

            if (0 !== file.size) {
                basenames.push(basename);
            }
        }

        return basenames;
    }

    toString() {
        return Object.values(this.fileList).join("\n");
    }

}