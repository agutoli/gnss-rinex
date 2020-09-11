## Installation

`npm install gnss-rinex -g`

## Usage

### Retrieve rinex from noaa network

`$ rinex --gnss noaa 1lsu 2020-09-09T00:00:00Z 2020-09-09T10:00:00Z -o ./demo_output.obs`

## Help

`rinex -h`

    usage: rinex [-h] [-v] [-n {noaa,ordnancesurvey}] [-o OUTPUT] [-vv]
                baseId start end

    Library to help grab Rinex observations from GNSS networks

    Positional arguments:
    baseId                base station ID
    start                 Initial date range
    end                   Final date range

    Optional arguments:
    -h, --help            Show this help message and exit.
    -v, --version         Show program's version number and exit.
    -n {noaa,ordnancesurvey}, --gnss {noaa,ordnancesurvey}
                            GNSS network adapter service
    -o OUTPUT, --output OUTPUT
                            Output observation rinex file
    -vv, --verbose        Verbose mode
