#!/bin/bash


readonly BIN_DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )
readonly BASE_DIR=$( dirname $BIN_DIR)
readonly GPSLABEL_EXEC="gpsbabel"
readonly GPSLABEL_VERSION_PATH="$BASE_DIR/gpsbabel.version"
readonly BUILD_PATH="$BASE_DIR/BUILD"
readonly SRC_PATH="$BASE_DIR/src"
readonly MANIFEST_PATH="$BUILD_PATH/manifest.txt"
readonly VERSIONS_PATH="$BUILD_PATH/versions.txt"
readonly MOUNT_PATH="$BASE_DIR/SD_CARD/Garmin/POI"


¶()
{
    echo
    echo '----------------------'
    echo "Garmin   $1"
    echo '----------------------'
}


_install()
{
    ¶ '_install'
}


_uninstall()
{
    ¶ '_uninstall'
}


_init()
{
    ¶ '_init'
    mkdir -p $MOUNT_PATH
}


_get_version()
{
    ¶ '_get_version'

    GPSBABEL_VERSION=`$GPSLABEL_EXEC -V | awk '/GPSBabel Version [0-9]+(\.[0-9]+)*/{ print $3 }'`

    echo "$GPSLABEL_VERSION_PATH < $GPSBABEL_VERSION"

    echo $GPSBABEL_VERSION > $GPSLABEL_VERSION_PATH
}


_clean()
{
    ¶ '_clean'
    [ -f $GPSLABEL_VERSION_PATH   ] && rm -f  $GPSLABEL_VERSION_PATH
}


_unmount()
{
    ¶ '_unmount'
    [ -d $MOUNT_PATH ] && rm -rf $MOUNT_PATH
}


_erase()
{
    ¶ '_erase'
    _uninstall
    _clean
    _unmount
}


_update_version()
{
    ¶ '_update_version'
    if [ ! -f $MYPOIS_TS_PATH ]
    then
        _get_version
    fi 

    GPSLABEL_VERSION=`cat $GPSLABEL_VERSION_PATH`

    echo "$GPSLABEL_VERSION < $GPSLABEL_VERSION_PATH"

    cp $VERSIONS_PATH "$VERSIONS_PATH.old"
    grep -v '^gpsbabel ' "$VERSIONS_PATH.old" > $VERSIONS_PATH
    rm -f "$VERSIONS_PATH.old"

    echo "$VERSIONS_PATH < $GPSLABEL_VERSION"

    echo "gpsbabel $GPSLABEL_VERSION" >> $VERSIONS_PATH
}


_run()
{
    ¶ '_run'
    _unmount
    _init

    while IFS='' read -r line || [[ -n "$line" ]]; do
        IFS='/' read -ra cells <<< "$line"
        FILENAME=${cells[0]}
        DATE=${cells[1]}
        COUNTER=${cells[2]}
        NAME=${cells[3]}

        GPI_NAME=`echo $FILENAME | sed -e 's/_\([0-9]\{1,\}$\)/@\1/'`
        BMP_PATH="$SRC_PATH/assets/icn/${FILENAME}.bmp"

        SOURCE="$BUILD_PATH/${FILENAME}.gpx"
        DESTINATION="$BUILD_PATH/${FILENAME}.gpi"

        [ -f $SOURCE ] && $GPSLABEL_EXEC -i gpx -f $SOURCE -o garmin_gpi,alerts=1,bitmap="$BMP_PATH" -F "$DESTINATION"
    done < $MANIFEST_PATH

    cp $BUILD_PATH/*.gpi ${MOUNT_PATH}/
    
    # remove if empty
    rmdir ${MOUNT_PATH}
}


_help()
{
read -d '' CONFIG <<- EOM
clean
    _clean
erase
    _erase
help
    _help
install
    _install
    _get_version
make
    _run
    _update_version
make-config
    _make_config
run
    _run
update-version
    _update_version
EOM
echo "$CONFIG"
}


for opt in "$@"
do
  case $opt in
  "update-version")
    _update_version
    ;;
  "run")
    _run
    ;;
  "install")
    _install
    _get_version
    ;;
  "uninstall")
    _uninstall
    ;;
  "clean")
    _clean
    ;;
  "erase")
    _erase
    ;;
  "make")
    _run
    _update_version
    ;;
  "help")
    _help
    ;;
  esac
done
