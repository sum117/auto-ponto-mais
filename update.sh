#!/bin/bash

docker build --no-cache -t sum117/auto-ponto-mais .
docker push sum117/auto-ponto-mais

while getopts "m:" flag; do
    case "${flag}" in
        m) message=${OPTARG} ;;
        *) echo "Uso inválido: -$OPTARG" >&2
           exit 1 ;;
    esac
done

git add .
git commit -am "$message"
git push