var database = process.env.MONGOLAB_URI || process.env.MONGOHQ_URI || 'mongodb://localhost/toapi',
    exports = module.exports = database;
