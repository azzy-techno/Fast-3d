#!/usr/bin/bash
cd "$(dirname "$0")/.."
B="${BLENDER:-/c/Program Files/Blender Foundation/Blender 5.2/blender.exe}"
F='^\[fast\] (built|lightmap|vertex|exported|env|sunset|dusk)|Error|Traceback|line [0-9]+, in|File "'
run() { "$B" -b --factory-startup -P "tools/blender/$1.py" -- "${@:2}" 2>&1 | grep -E "$F" | cut -c1-220; }
for job in "$@"; do
  echo "== $job"
  case "$job" in
    sky) run sky; node -e "
const sharp=require('sharp');const w='../_work/';const t='public/tex/';
(async()=>{for(const n of ['sunset','dusk']){await sharp(w+'sky_'+n+'.png').webp({quality:84,effort:5}).toFile(t+'sky_'+n+'.webp');await sharp(w+'env_'+n+'.png').webp({quality:86}).toFile(t+'env_'+n+'.webp');}})()";;
    city) run city; node tools/pack.mjs city | grep -v -i prune;;
    floor) run floor; node tools/pack.mjs floor --lm lm_floor:1536 | grep -v -i prune; node -e "require('sharp')('../_work/env_floor.png').webp({quality:86}).toFile('public/tex/env_floor.webp')";;
    arrival) run arrival --poster; node tools/pack.mjs arrival --lm lm_arrival --lm lm_lobby:1536 | grep -v -i prune; node -e "
const sharp=require('sharp');(async()=>{await sharp('../_work/env_lobby.png').webp({quality:86}).toFile('public/tex/env_lobby.webp');
await sharp('../_work/poster.jpg').resize(1600).webp({quality:70}).toFile('public/img/poster.webp');})()";;
    cars) run props; node tools/pack.mjs cars | grep -v -i prune;;
    roof) run roof --still; node tools/pack.mjs roof --lm lm_roof:1536 | grep -v -i prune; node -e "
const sharp=require('sharp');(async()=>{try{await sharp('../_work/floor-roof.jpg').resize(1200).webp({quality:72}).toFile('public/img/floor-roof.webp');}catch(e){}})()";;
    ex_*) id=${job#ex_}; run "$job" --still; node tools/pack.mjs "$job" | grep -v -i prune; node -e "
const sharp=require('sharp');(async()=>{try{await sharp('../_work/floor-$id.jpg').resize(1200).webp({quality:72}).toFile('public/img/floor-$id.webp');}catch(e){console.log('no still')}})()";;
  esac
done
echo "== done"
