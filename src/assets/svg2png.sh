#!/bin/bash


BASE_DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )
SVG_DIR="$BASE_DIR/import"
PNG_DIR="$BASE_DIR/icn"

for f in `ls $SVG_DIR/*.svg`
do
    g="$PNG_DIR/$(basename "$f" .svg).png"
    BGCOLOR=`grep 'id="background"' $f \
        | sed 's/.* fill="\([^"]*\)".*/\1/'`
        
    convert $f -transparent "$BGCOLOR" $g
done
