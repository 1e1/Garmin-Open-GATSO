module.exports = { 
    
types: { 
    traffic_light: { label: 'Feux rouges', type: 'stop', display: 'stop' },
    instant_speed: { label: 'Fixes', type: 'fixed', display: 'max' },
    multi_instant_speed: { label: 'Discriminants', type: 'fixed+', display: 'max' },
    railroad: { label: 'Passages à niveau', type: 'stop', display: 'stop' },
    average_speed: { label: 'Vitesse Moyenne', type: 'average', display: 'average' },
    route: { label: 'Itinéraires', type: 'fixed?', display: 'max' }, 
    tunnel: { label: 'Tunnel', type: 'average', display: 'tunnel' }, 
},

rules: { 
    empty: { label: 'Sur toute la longueur de cet itinéraire, il peut y avoir de un à plusieurs radars, de plusieurs types.', type: 'unknown', alert: null, filter: true, basenames: [ 'GATSO_ALL', 'GATSO_unknown_0' ] },
    car30: { label: 'Vitesse VL 30', type: 'speed', alert: 30, filter: true, basenames: [ 'GATSO_ALL', 'GATSO_speed_0', 'GATSO_30' ] },
    car40: { label: 'Vitesse VL 40', type: 'speed', alert: 50, filter: true, basenames: [ 'GATSO_ALL', 'GATSO_speed_0', 'GATSO_40' ] },
    car50: { label: 'Vitesse VL 50', type: 'speed', alert: 50, filter: true, basenames: [ 'GATSO_ALL', 'GATSO_speed_0', 'GATSO_50' ] },
    car60: { label: 'Vitesse VL 60', type: 'speed', alert: 70, filter: true, basenames: [ 'GATSO_ALL', 'GATSO_speed_0', 'GATSO_60' ] },
    car70: { label: 'Vitesse VL 70', type: 'speed', alert: 70, filter: true, basenames: [ 'GATSO_ALL', 'GATSO_speed_0', 'GATSO_70' ] },
    car80: { label: 'Vitesse VL 80', type: 'speed', alert: 80, filter: true, basenames: [ 'GATSO_ALL', 'GATSO_speed_0', 'GATSO_80' ] },
    car90: { label: 'Vitesse VL 90', type: 'speed', alert: 90, filter: true, basenames: [ 'GATSO_ALL', 'GATSO_speed_0', 'GATSO_90' ] },
    car100: { label: 'Vitesse VL 100', type: 'speed', alert: 100, filter: true, basenames: [ 'GATSO_ALL', 'GATSO_speed_0', 'GATSO_100' ] },
    car110: { label: 'Vitesse VL 110', type: 'speed', alert: 110, filter: true, basenames: [ 'GATSO_ALL', 'GATSO_speed_0', 'GATSO_110' ] },
    car120: { label: 'Vitesse VL 120', type: 'speed', alert: 120, filter: true, basenames: [ 'GATSO_ALL', 'GATSO_speed_0', 'GATSO_120' ] },
    car130: { label: 'Vitesse VL 130', type: 'speed', alert: 130, filter: true, basenames: [ 'GATSO_ALL', 'GATSO_speed_0', 'GATSO_130' ] },
    truck50: { label: 'Vitesse PL 50', type: 'speed', alert: 50, filter: false, basenames: [ 'GATSO_ALL', 'GATSO_speed_0', 'GATSO_50' ] },
    truck70: { label: 'Vitesse PL 70', type: 'speed', alert: 70, filter: false, basenames: [ 'GATSO_ALL', 'GATSO_speed_0', 'GATSO_70' ] },
    truck80: { label: 'Vitesse PL 80', type: 'speed', alert: 80, filter: false, basenames: [ 'GATSO_ALL', 'GATSO_speed_0', 'GATSO_80' ] },
    truck90: { label: 'Vitesse PL 90', type: 'speed', alert: 90, filter: false, basenames: [ 'GATSO_ALL', 'GATSO_speed_0', 'GATSO_90' ] },
    traffic_light: { label: 'Franchissement de feux', type: 'redlight', alert: null, filter: true, basenames: [ 'GATSO_ALL', 'GATSO_stop_0', 'GATSO_redlight_0' ] },
    railroad: { label: 'Franchissement de voie ferrée', type: 'redlight', alert: null, filter: true, basenames: [ 'GATSO_ALL', 'GATSO_stop_0', 'GATSO_railway_0' ] },
    tunnel: { label: 'Franchissement de tunnel', type: 'unknown', alert: null, filter: true, basenames: [ 'GATSO_ALL', 'GATSO_speed_0', 'GATSO_tunnel_0' ] },
},

services: {
    gazole: { label: 'Gazole', type: 'gazo', basenames: [ 'FUEL_gazole', 'FUEL_b7' ] },
    b7:  { label: 'B7',  type: 'b7',  basenames: [ 'FUEL_gazole', 'FUEL_b7' ] },
    b10: { label: 'B10', type: 'b10', basenames: [ 'FUEL_gazole', 'FUEL_b10' ] },
    xtl: { label: 'XTL', type: 'xtl', basenames: [ 'FUEL_gazole', 'FUEL_xtl' ] },

    e85:  { label: 'E85',  type: 'e85',  basenames: [ 'FUEL_flex', 'FUEL_e85' ] },
    e10:  { label: 'E10',  type: 'e10',  basenames: [ 'FUEL_flex', 'FUEL_petrol', 'FUEL_e10' ] },
    sp95: { label: 'SP95', type: 'sp95', basenames: [ 'FUEL_flex', 'FUEL_petrol', 'FUEL_e5', 'FUEL_sp95' ] },
    e5:   { label: 'E5',   type: 'e5',   basenames: [ 'FUEL_flex', 'FUEL_petrol', 'FUEL_e5' ] },
    sp98: { label: 'SP98', type: 'sp98', basenames: [ 'FUEL_flex', 'FUEL_petrol', 'FUEL_e5', 'FUEL_sp98' ] },

    gpl: { label: 'GPL', type: 'gpl', basenames: [ 'FUEL_gaz', 'FUEL_lpg', 'FUEL_gpl' ] },
    lpg: { label: 'LPG', type: 'lpg', basenames: [ 'FUEL_gaz', 'FUEL_lpg', 'FUEL_gpl' ] },
    gnv: { label: 'GNV', type: 'gnv', basenames: [ 'FUEL_gaz', 'FUEL_gnv' ] },
    lng: { label: 'LNG', type: 'lng', basenames: [ 'FUEL_lng' ] },
    h2: { label: 'H2', type: 'h2', basenames: [ 'FUEL_gaz', 'FUEL_h2' ] },

    electricity: { label: 'Bornes électriques', type: 'elec', basenames: [ 'FUEL_electricity' ] },

    pressure: { label: 'Station de gonflage', type:'tyre', basenames: [ 'FUEL_pressure' ]  },
    adblue: { label: 'Carburant additivé', type:'adblue', basenames: [ 'FUEL_adblue' ]  },
},

basenameToString: (basename) => {
    const cleanFilename = basename
        .replace('GATSO_', '')
        .replace('_0', '')
        .replace('FUEL_', '')
        ;
    
    switch (cleanFilename) {
        case 'ALL': return basename.split('_', 1).join(' ');
    }
    
    return cleanFilename;
},
}
