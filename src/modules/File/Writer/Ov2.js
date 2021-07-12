const WRITER = require('./Writer.js');

module.exports = class Ov2 extends WRITER {

    convertToBuffer(point) {
        const geoJsonLength = point.geoJson.length;
        const buffers = [];
    
        for (let i = 0; i < geoJsonLength; ++i) {
            const lng_lat = point.geoJson[i];
    
            let extra = ' ';
    
            if (geoJsonLength > 1) {
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
            }
    
            if (point.rule) { 
                extra += point.rule;
            }
    
            const title = (point.type + extra).trim();
    
            const data = {
                longitude: Math.round(lng_lat[0] * 100000),
                latitude: Math.round(lng_lat[1] * 100000),
                title: title,
                length: title.length,
            };
         
            const noTitleTrameLength = 14;
            const trameLength = data.title.length + noTitleTrameLength;
            const buffer = Buffer.alloc(trameLength);
    
            let offset = 0;
    
            buffer.writeUInt8('0x02', offset);
            offset += 1;
            buffer.writeUInt32LE(trameLength, offset);
            offset += 4;
            buffer.writeInt32LE(data.longitude, offset);
            offset += 4;
            buffer.writeInt32LE(data.latitude, offset);
            offset += 4;
            buffer.write(data.title, offset, data.title.length);
            offset += data.length;
            buffer.writeUInt8('0x00', offset);
            offset += 1;
    
            buffers.push(buffer);
        }
    
        return Buffer.concat(buffers);
    }

}