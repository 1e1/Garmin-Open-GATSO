const WRITER = require('./Writer.js');

module.exports = class Gpx extends WRITER {

    setHeader() {
        const header = '<?xml version="1.0" encoding="UTF-8" standalone="no" ?>' + "\n"
            + '<gpx version="1.1" xmlns="http://www.topografix.com/GPX/1/1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">'
            ;
        
        this.header = Buffer.from(header, this.fileEncoding);

        return this;
    }

    setFooter() {
        const footer = '</gpx>';

        this.footer = Buffer.from(footer, this.fileEncoding);

        return this;
    }

    convertToBuffer(point) {
        const geoJsonLength = point.geoJson.length;
        const title = point.type;
        
        let line;
    
        if (1 === geoJsonLength) {
            const extra = point.rule ? isNaN(point.rule) ? '# ' : '@' + point.rule : '';
    
            // WAYPOINT
            line = '<wpt lon="{lon}" lat="{lat}"><name>{title}</name><desc>{desc}</desc></wpt>'.format({
                lon: point.geoJson[0][0],
                lat: point.geoJson[0][1],
                title: (title + extra).escapeXml(),
                desc: point.description.escapeXml(),
            });
        } else {
            // ROUTE
            const points = [];
            for (let i=0; i<geoJsonLength; ++i) {
                let extra = ' ';
    
                switch (i) {
                    case 0: 
                    extra += this.options.zoneEntryPrefix;
                    break;
    
                    case geoJsonLength -1:
                    extra += this.options.zoneExitPrefix;
                    break;
    
                    default:
                    extra += this.options.zoneInsidePrefix;
                }
    
                if (point.rule) { 
                    extra += isNaN(point.rule) ? '# ' : '@' + point.rule;
                }
    
                //const rtept = '<rtept lon="{lon}" lat="{lat}"><name>{title}</name><desc>{desc}</desc></rtept>'.format({
                const rtept = '<trkpt lon="{lon}" lat="{lat}"><name>{title}</name></trkpt>'.format({
                    lon: point.geoJson[i][0],
                    lat: point.geoJson[i][1],
                    title: (title + extra).trim().escapeXml(),
                    desc: point.description.escapeXml(),
                });
    
                points.push(rtept);
            }
    
            line = '<trk><name>{title}</name><desc>{desc}</desc><trkseg>{points}</trkseg></trk>'.format({
                title: point.type.escapeXml(),
                desc: point.description.escapeXml(),
                points: points.join(''),
            });
        }
    
        return Buffer.from(line, this.fileEncoding);
    }

}