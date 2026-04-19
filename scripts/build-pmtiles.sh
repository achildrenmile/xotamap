#!/bin/bash
# Convert GeoJSON reference files to PMTiles using tippecanoe.
# Each program gets its own PMTiles file for efficient vector tile serving.

set -euo pipefail

DATA_DIR="public/data/references"

if ! command -v tippecanoe &> /dev/null; then
  echo "ERROR: tippecanoe is not installed."
  echo "Install: https://github.com/felt/tippecanoe"
  exit 1
fi

echo "Converting GeoJSON to PMTiles..."

count=0
for geojson in "${DATA_DIR}"/*.geojson; do
  [ -f "$geojson" ] || continue

  program=$(basename "$geojson" .geojson)
  output="${DATA_DIR}/${program}.pmtiles"

  echo "  ${program}: $(wc -l < "$geojson") bytes -> ${output}"

  tippecanoe \
    --output="$output" \
    --layer="$program" \
    --maximum-zoom=14 \
    --minimum-zoom=2 \
    --drop-densest-as-needed \
    --force \
    "$geojson"

  count=$((count + 1))
done

echo "Done: ${count} PMTiles files created."
