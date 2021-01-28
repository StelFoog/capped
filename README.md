# CAPPED system

**A simple way to limit the amount of people in a locale**. Super WIP, currently very limited in its use, in many ways just a glorified counter at the moment. 

## Usage

### Docker
- **Server** (From top dir)
  - **Build image:** `$ docker build -t capped .`
  - **Run container:** `$ docker run -v $(pwd)/datafile.json:/data.json -e DATA_PATH=/data.json -p 8080:8080`
- **Client** (Not finished)

### Testing
- **Server** (From top dir) `$ [npm / yarn] server`
- **Client** (From top dir) `$ [npm / yarn] client [options]`
  - First option is the command and the rest are the body, e.g. user
