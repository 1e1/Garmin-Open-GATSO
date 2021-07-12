#!/bin/bash


readonly BASE_DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )
readonly ROOT_DIR=$(dirname $BASE_DIR)
readonly FILES="./index.html ./version.svg ./cnx"



_reset()
{
  file=$1

  echo "reset $file"
  perl -pe 's|(<!-- \[([^\[\]]+)\[ -->).*(<!-- \]\2\] -->)|\1\3|g' -i $file
}


_fetch()
{
  directory=$1
  contents=$2

  for f in $contents
  do
    path="$directory/$f"

    if [ -d $path ]
    then
      _fetch $path "`ls $path`"
    else
      _reset $path
    fi
  done
}



_fetch $ROOT_DIR "$FILES"

