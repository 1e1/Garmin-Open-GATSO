#!/bin/bash


BASE_DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )
BUILD_PATH="$BASE_DIR/BUILD"
CACHE_PATH="$BASE_DIR/CACHE"
RELEASE_PATH="$BASE_DIR/RELEASES"
RELEASE_PREFIX=''
MOUNT_PATH="$BASE_DIR/SD_CARD"
MANIFEST_PATH="$BUILD_PATH/manifest.txt"
VERSIONS_PATH="$BUILD_PATH/versions.txt"

CACHE_FUEL_FR_URL='https://donnees.roulez-eco.fr/opendata/instantane'
CACHE_FUEL_FR_FILENAME='fuel-FR.zip'

CACHE_GATSO_EU_URL='https://lufop.net/wp-content/plugins/downloads-manager/upload/Lufop-Zones-de-danger-EU-CSV.zip'
CACHE_GATSO_EU_FILENAME='gatso-EU.zip'

BUILD_ARGS=()
INSTALL_ARGS=()

for opt in "$@"
do
  case $opt in
    --build=*)
      BUILD_ARGS+=(${opt#*=})
      ;;
    --install-channel=*)
      INSTALL_ARGS+=("--install-channel=${opt#*=}")
      ;;
    --release=*)
      RELEASE_PATH=${opt#*=}
      ;;
    --release-prefix=*)
      RELEASE_PREFIX=${opt#*=}
      ;;
esac
done


¶()
{
    echo
    echo '=========='
    echo $1
    echo '=========='
}

∂()
{
    #realpath --relative-to=$BASE_DIR $1
    ABSOLUTE_PATH=$1
    RELATIVE_PATH=${ABSOLUTE_PATH#$BASE_DIR}
    echo "./$RELATIVE_PATH"
}


make_flat_zip()
{
    ¶ 'make_flat_zip'
    if [ -d $BUILD_PATH ]
    then
        EXT=$1
        count=`ls -1 *.$EXT 2>/dev/null | wc -l`

        if [ $count != 0 ]
        then
            mkdir -p "${BUILD_PATH}_${EXT}"
            cp -R ${BUILD_PATH}/*.{bmp,$EXT} "${BUILD_PATH}_${EXT}/"
            zip -qjr "${RELEASE_PATH}/${RELEASE_PREFIX}${EXT}_files.zip" $(∂ "${BUILD_PATH}_${EXT}/")
            rm -rf "${BUILD_PATH}_${EXT}"
        fi
    fi
}

cache_dl()
{
    ¶ 'cache_dl'
    curl -sSL -H 'User-Agent: Mozilla/5.0' -D - $1 -o "$CACHE_PATH/$2"
}


_cache()
{
    ¶ '_cache'
    [ ! -f $CACHE_FUEL_FR_FILENAME  ] && cache_dl $CACHE_FUEL_FR_URL  $CACHE_FUEL_FR_FILENAME
    [ ! -f $CACHE_GATSO_EU_FILENAME ] && cache_dl $CACHE_GATSO_EU_URL $CACHE_GATSO_EU_FILENAME
}


_uncache_auto()
{
    ¶ '_uncache_auto'
    find $CACHE_PATH -type f -mmin +360 -delete
}


_uncache()
{
    ¶ '_uncache'
    [ -d $CACHE_PATH ] && rm -rf $CACHE_PATH
}


_init()
{
    ¶ '_init'
    [ ! -d $BUILD_PATH   ] && mkdir -p $BUILD_PATH
}


_install()
{
    ¶ '_install'

    $BASE_DIR/mypois_ctl.sh install ${INSTALL_ARGS[*]}
}


_uninstall()
{
    ¶ '_uninstall'
    $BASE_DIR/mypois_ctl.sh erase
}


_clean()
{
    ¶ '_clean'
    $BASE_DIR/mypois_ctl.sh clean
    
    [ -d $BUILD_PATH ] && rm -rf $BUILD_PATH
}


_erase()
{
    ¶ '_erase'
    _uncache
    $BASE_DIR/mypois_ctl.sh erase
    _clean
    _unrelease
}


_build()
{
    ¶ '_build'
    node $BASE_DIR/src/build.js ${BUILD_ARGS[*]}
}


_release()
{
    ¶ '_release'
    [ ! -d $RELEASE_PATH ] && mkdir -p $RELEASE_PATH
    [ -d $BUILD_PATH ] && zip -qjr $RELEASE_PATH/${RELEASE_PREFIX}all_files.zip $(∂ $BUILD_PATH)
    make_flat_zip csv
    make_flat_zip gpx
    make_flat_zip ov2
    [ -d $MOUNT_PATH ] && zip -qr $RELEASE_PATH/${RELEASE_PREFIX}sd_files.zip $(∂ $MOUNT_PATH)
}


_unrelease()
{
    ¶ '_unrelease'
    [ -d $RELEASE_PATH ] && rm -rf $RELEASE_PATH
}


_mount()
{
    ¶ '_mount'
    $BASE_DIR/mypois_ctl.sh make
    
    rc=$?
    if [ $rc != 0 ]
    then
      exit $rc
    fi
}


_image()
{
    ¶ '_image'
    CMD='genisoimage'

    if [ ! `command -v $CMD` ]
    then
        CMD='mkisofs'
    fi

    $CMD -iso-level 4 -o $BUILD_PATH/sd_image.iso $(∂ $MOUNT_PATH)
    [ ! -d $RELEASE_PATH ] && mkdir -p $RELEASE_PATH
    zip -qr $RELEASE_PATH/${RELEASE_PREFIX}sd_image.iso.zip  $(∂ $BUILD_PATH/sd_image.iso)
    rm -f $BUILD_PATH/sd_image.iso
}


_update_doc()
{
    ¶ '_update_doc'
    $BASE_DIR/mypois_ctl.sh update-version
    node $BASE_DIR/src/update_doc.js
}


_run()
{
    ¶ '_run'
    _init
    _build
    _mount
    _release
    _update_doc
}


_help()
{
read -d '' CONFIG <<- EOM
<nothing>
    _init
    _build
    _mount
    _release
    _update_doc
--init
    _init
--uncache
    _uncache
--cache-force
    _cache
--cache
    _uncache_auto
    _cache
--uninstall
    _uninstall
--install
    _init
    _install
--clean
    _clean
--erase
    _erase
--unrelease
    _unrelease
--build
    _build
--release
    _release
--mount
    _mount
    _update_doc
--image
    _image
--update-doc
    _update_doc
--run
    _init
    _build
    _mount
    _release
    _update_doc
--standalone
    _unrelease
    _init
    _build
    _mount
    _release
    _update_doc
--help
    _help
EOM
echo "$CONFIG"
}


if [ "$#" -gt 0 ]
then
  for opt in "$@"
  do
    case $opt in
    "--init")
      _init
      ;;
    "--cache-force")
      _cache
      ;;
    "--cache")
      _uncache_auto
      _cache
      ;;
    "--uncache")
      _uncache
      ;;
    "--install")
      _init
      _install
      ;;
    "--uninstall")
      _uninstall
      ;;
    "--clean")
      _clean
      ;;
    "--erase")
      _erase
      ;;
    "--unrelease")
      _unrelease
      ;;
    "--build")
      _build
      ;;
    "--release")
      _release
      ;;
    "--mount")
      _mount
      _update_doc
      ;;
    "--image")
      _image
      ;;
    "--update-doc")
      _update_doc
      ;;
    "--run")
      _run
      ;;
    "--standalone")
      _unrelease
      _run
      ;;
    "--help")
      _help
      ;;
    esac
  done
else
  _run
fi

echo 
echo 'done'
