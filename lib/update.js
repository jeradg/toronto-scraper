var fs = require( 'fs' ),
    path = require( 'path' ),
    // longjohn = require( 'longjohn' ), // Increases length of the stack trace. Helpful for debugging memory leaks.
    getURLs = require( './getURLs' )
    updateVenues = require( './updateVenues' ),
    exports = module.exports = update;

function update( urlsList ) {
  var crawlStartedDate = new Date(),
      rootPath = path.resolve( __dirname, '../output' ) + '/',
      tempPath = rootPath + 'temp/',
      linksPath = rootPath + 'links/',
      prefix = 'swimto_',
      suffix = crawlStartedDate.getFullYear() + '_'
               + ( crawlStartedDate.getMonth() + 1 ) + '_'
               + crawlStartedDate.getDate() + '_'
               + ( crawlStartedDate.getHours() > 10 ? crawlStartedDate.getHours() : '0' + crawlStartedDate.getHours() )
               + ( crawlStartedDate.getMinutes() > 10 ? crawlStartedDate.getMinutes() : '0' + crawlStartedDate.getMinutes() )
               + ( crawlStartedDate.getSeconds() > 10 ? crawlStartedDate.getSeconds() : '0' + crawlStartedDate.getSeconds() );
      tempLinksFile = tempPath + prefix + 'links_' + suffix + '_TEMP.json',
      linksFile =  linksPath + prefix + 'links_' + suffix + '.json',
      venueListURLs = JSON.parse( fs.readFileSync( urlsList ) ).venueListURLs;

  getURLs( venueListURLs, updateVenues );
}