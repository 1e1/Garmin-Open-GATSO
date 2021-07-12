const LAUNCHER = require('./modules/Launcher.js');

const DEFAULTS = {
    sources: [ 'CNX_FUEL_FR', 'CNX_GATSO_EU', 'CNX_GATSO_FR' ],
    formats: [ 'csv', 'ov2', 'gpx' ],
    isTruck: false,
    hasCache: false,
};



(async () => {
    const arguments = process.argv.slice(2);
    const options = {};

    for (let optionName in DEFAULTS) {
        const optionValues = DEFAULTS[optionName];

        if (Array.isArray(optionValues)) {
            if (undefined === options[optionName]) {
                options[optionName] = [];
            }

            options[optionName] = arguments.filter(argument => optionValues.includes(argument));

            if (0 === options[optionName].length) {
                options[optionName] = optionValues;
            }
        } else if (true === optionValues || false === optionValues) {
            options[optionName] = arguments.includes(optionName);
        }
    }

    console.log(options);

    try {
        const launcher = LAUNCHER.from(options);

        launcher.prepare();

        await launcher.runSingle();

        launcher.package();
    } catch (err) {
        console.log('~~~~~~~~~');
        console.log(err);

        process.exit(1);
    }

    console.log("done");
 })();
