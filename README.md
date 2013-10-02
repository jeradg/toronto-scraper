# swimTO

The City of Toronto doesn't provide an API for recreation data, so I'm making one.

The back-end will include a crawler to pull recreation data from the city's website (info about drop-in swimming programmes, for now) and an API for serving the data.

This repo includes the crawler, written in Node.js.

To add venue and schedule information to your local instance of MongoDB, run ``node swimto-crawler.js``.

## Requirements

MongoDB 2.4 or greater (required for location search with GeoJSON data).

## Instructions

### Configuration

The repo includes a sample config file, appropriately named ``sample-config.json``. Rename it to ``config.json`` and change the values as necessary.

#### Configuration example

```
{
  "db": "mongodb://my_database_path",
  "collection": "swimto",
  "venueListURLs": [ 
                     "http://www.toronto.ca/parks/prd/facilities/outdoor-pools/index.htm",
                     "http://www.toronto.ca/parks/prd/facilities/outdoor-pools/2-outdoor_pool.htm",
                     "http://www.toronto.ca/parks/prd/facilities/indoor-pools/index.htm",
                     "http://www.toronto.ca/parks/prd/facilities/indoor-pools/2-indoor_pool.htm"
                   ]
}
```

To do
======

- [ ] Note whether a pool is outdoor or indoor.
- [ ] See if there are possible duplicates between pool types (indoor, outdoor, wading, etc.) and handle them.
- [ ] When new JSON files are created, move any old ones to a subfolder.
- [ ] If a required output folder does not exist, create it.
- [ ] Add the time it took to scrape to the "Scrape completed" message.
- [ x ] Format toronto.ca's dates and times into ISO.
- [ ] Write tests.
- [ ] Rewrite crawler as AMD module.
