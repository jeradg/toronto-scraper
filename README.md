# toronto-scraper

The City of Toronto doesn't provide an API for recreation data, so I'm making one.

The back-end will include a scraper to pull recreation data from the city's website (info about drop-in swimming programmes, for now) and an API for serving the data.

This repo is the scraper, written in Node.js.

If you'd like to see the data in action, check out http://swimto.ca.

## Requirements

MongoDB 2.4 or greater (required for location search with GeoJSON data).

## Instructions

### Configuration

The database URI is set in ``lib/config/database.js``.

The list of toronto.ca URIs with links to venue pages is found in ``venueListURLs.json``.

## To do

- [x] Note whether a pool is outdoor or indoor.
- [x] See if there are possible duplicates between pool types (indoor, outdoor, wading, etc.) and handle them.
- [ ] Add the time it took to scrape to the "Scrape completed" message.
- [x] Format toronto.ca's dates and times into ISO.
- [x] Write tests.
- [ ] Improve test coverage.
