swimTO
======

The City of Toronto doesn't provide an API for recreation data, so I'm making one.

The back-end will include a scraper to pull recreation data from the city's website (info about drop-in swimming programmes, for now) and an API for serving the data.

The front-end will start as a web app for finding swimming pools in Toronto. After that, I might expand it to include all Toronto municipal recreational programming.

To do
======

- [ ] Populate database.
- [ ] Note whether a pool is outdoor or indoor.
- [ ] See if there are possible duplicates between pool types (indoor, outdoor, wading, etc.) and handle them.
- [ ] When new JSON files are created, move any old ones to a subfolder.
- [ ] If a required output folder does not exist, create it.
- [ ] Add the time it took to scrape to the "Scrape completed" message.
- [ x ] Format toronto.ca's dates and times into ISO.
- [ ] Write tests.
