## Installation

`npm install gnss-rinex -g`

## Usage

### Retrieve rinex from noaa network

`$ rinex auscors alby 2020-09-09T00:00:00Z 2020-09-09T10:00:00Z -o ./demo_output.obs -vv`

`# rinex noaa 1lsu 2020-09-09T00:00:00Z 2020-09-09T10:00:00Z -o ./demo_output.obs -vv`

## Help

`rinex -h`

    usage: rinex [-h] [-v] [-o OUTPUT] [-vv]
                 {noaa,auscors,ordnancesurvey} baseId date_start date_end

    Library to help grab Rinex observations from GNSS networks

    Positional arguments:
      {noaa,auscors,ordnancesurvey}
                            GNSS network adapter service
      baseId                base station ID
      date_start            Initial date range ex. ISO 2020-09-09T00:00:00Z
      date_end              Final date range ex. ISO 2020-09-09T00:00:00Z

    Optional arguments:
      -h, --help            Show this help message and exit.
      -v, --version         Show program's version number and exit.
      -o OUTPUT, --output OUTPUT
                            Output observation rinex file
      -vv, --verbose        Verbose mode
