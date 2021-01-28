# Kistan Capped system

## Build container for server

`docker build -t capped .`

## Run in docker

`docker run -v $(pwd)/datafile.json:/data.json -e DATA_PATH=/data.json -p 8080:8080` capped
