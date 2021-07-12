# Open GATSO POI

Get the latest build on the [website](https://1e1.github.io/Open-GATSO-POI/)

![preview](./src/assets/img/cover.png)

Daily it gives the latest set of speed cameras on the EU.
Available formats are:

* GPX/GPI (accurate)
    - Garmin (embeded into VolksWagen, MAN, Skoda, Seat, etc.)
    - Mercedes
    - Volvo
* CSV (verbose): 
    - Garmin (embeded into VolksWagen, MAN, Skoda, Seat, etc.)
    - Navman
* OV2 (minimalist):
    - TomTom (embeded into Fiat, Peugeot, etc.)


## installation

![VW website](./src/assets/img/carnet.png)
3 methods:

1. Quick (on SD Card)
    - download the lastest `sd_image.iso.zip` from the [releases page](https://github.com/1e1/Garmin-Open-GATSO/releases)
    - unzip it
    - burn it on a SD Card
    - insert the SD Card in your GPS
    - you should manually import the POI (see [howto for VW](#explanations)) 

2. Official Garmin installation
    - download the lastest `all_files.zip` from the [releases page](https://github.com/1e1/Garmin-Open-GATSO/releases)
    - unzip it
    - download [Garmin POI Loader](https://www8.garmin.com/support/collection.jsp?product=999-99999-12)
    - run Garmin POI Loader and let the wizard lead you
    - insert the SD Card in your GPS
    - you should manually import the POI (see [howto for VW](#explanations)) 

3. Official online
    - download the lastest `all_files.zip` from the [releases page](https://github.com/1e1/Garmin-Open-GATSO/releases)
    - unzip it
    - go to the website of your car maker (eg VW: https://www.volkswagen-car-net.com) (please, contact me for others links)
    - upload every CSV as new POIs
    - connect your car to the Internet
    - update your GPS


## DIY usage

### first run

```bash
# git clone ...
cd ./src
npm install
# export only csv and gpx
node ./build.js csv gpx
```

### batch 

require:
- [cdrtools](http://cdrtools.sourceforge.net/private/cdrecord.html) (making Disk Image)
- [mypois](https://github.com/jimmyH/mypois) (exporting to Discover Media: Volkswagen, Audi, Bugatti, Seat, Škoda, Porsche, Lamborghini, Bentley, Ducati, Scania, MAN)
- [gpsbabel](https://www.gpsbabel.org) (exporting to UConnect: FIAT)

```bash
./bin/make.sh
```

you should read `./bin/make.sh --help`, `./bin/mypois_ctl.sh help`, and `./bin/gpsbabel_ctl.sh help`


## documentation

### Speed Camera
REST service from:
* ![version GATSO FR](https://raw.githubusercontent.com/1e1/Open-GATSO-POI/gh-pages/cnx/gatso-FR.svg?sanitize=true) https://radars.securite-routiere.gouv.fr/ 
* ![version GATSO EU](https://raw.githubusercontent.com/1e1/Open-GATSO-POI/gh-pages/cnx/gatso-EU.svg?sanitize=true) https://lufop.net/zones-de-danger-france-et-europe-asc-et-csv/
* ![version FUEL FR](https://raw.githubusercontent.com/1e1/Open-GATSO-POI/gh-pages/cnx/fuel-FR.svg?sanitize=true) https://www.prix-carburants.gouv.fr/rubrique/opendata/

Other open data sources:
- https://data.opendatasoft.com/
- https://www.europeandataportal.eu/


### GFX tool
* draw 24x24 icons on https://www.piskelapp.com/
* export as animated GIF 
* get every frame: `$ convert -coalesce ./src/assets/org/New\ Piskel.gif  frame_%02d.bmp`
* create PNG thumbs `convert ./src/assets/icn/*.png -strip -resize 24x24\> -depth 8 -define png:compression-filter=2 -define png:compression-level=9 -define png:compression-strategy=1 -set filename:fname '%t_tn' +adjoin './src/assets/img/%[filename:fname].png'`
* remove EXIF from photos `convert ./src/assets/import/* -strip -resize 1024x512\> -set filename:fname '%t_tn' +adjoin './src/assets/export/%[filename:fname].jpg'`

### CSV structure
* https://www8.garmin.com/products/poiloader/creating-custom-poi-files/ <- best doc! 
* http://www.poi-factory.com/garmin-csv-file-format
* https://www.poieditor.com/poi_convert/garmin-csv-to-ov2/

### Gamin POI Loader
* https://www8.garmin.com/support/collection.jsp?product=999-99999-12
* save image disk: `dd if=/dev/disk2 of=./sd_image.img`
* https://www.gpsbabel.org/htmldoc-development/fmt_garmin_gpi.html

### TomTom POI ov2
* https://www.tomtom.com/lib/doc/ttnavsdk3_manual.pdf

### explanations

#### VW Discover Media

> - press the **NAV** button
> - insert the SD Card into the second card connector of your GPS
> - select *Configuration*
> - select *Gérer la mémoire*
> - select *Mise à jour my POI*
> - waiting for *Logiciel de mise à jour disponible* then press *mise à jour* then press *suivant*
> - while it terminated, press the **NAV** button
> - select *Configuration*
> - select *Carte*
> - select *Afficher les catégories*
> - scroll down to GATSO and check which POI you want
> - press the **NAV** button
> - remove your SD Card
> - enjoy

#### others

[SpeedCamUpdates](http://www.speedcamupdates.fr) helps for a lot of configurations

## TODO

waiting for an update from: 
https://www.prix-carburants.gouv.fr/rubrique/opendata/


---

![version](https://raw.githubusercontent.com/1e1/Open-GATSO-POI/gh-pages/cnx/version.svg?sanitize=true)
![Travis CI](https://api.travis-ci.org/1e1/Open-GATSO-POI.svg?branch=master)