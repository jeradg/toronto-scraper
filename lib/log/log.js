var exports = module.exports = log,
    nodemailer = require( 'nodemailer' ),
    logEmailService = process.env.LOG_EMAIL_SERVICE, // e.g., 'Gmail',
    logEmailSenderUser = process.env.LOG_EMAIL_SENDER_USER, // e.g., 'gmail.user@gmail.com',
    logEmailSenderPassword = process.env.LOG_EMAIL_SENDER_PASS, // e.g., 'userpass'
    logEmailRecipient = process.env.LOG_EMAIL_RECIPIENT; // e.g., 'another.gmail.user@gmail.com',

var log = function() {
  this.send = function( type, content ) {
    var smtpTransport = nodemailer.createTransport( 'SMTP', {
      service: logEmailService,
      auth: {
        user: process.env.logEmailSenderUser,
        pass: process.env.logEmailSenderPassword
      }
    } );

    switch ( type ) {
      case 'error':
        // setup e-mail data with unicode symbols
        var mailOptions = {
          from: logEmailSenderUser, // sender address
          to: logEmailRecipient, // list of receivers
          subject: 'Crawler ERROR', // Subject line
          text: 'Hello,\n\nI\'m sorry to report that the swimTO crawler encountered an error:\n\n' + content // plaintext body
        }

        // send mail with defined transport object
        smtpTransport.sendMail( mailOptions, function( error, response ){
          if ( error ){
            console.log( error );
          } else {
            console.log( 'Message sent: ' + response.message );
          }
        } );

        break;
      case 'success':
        var mailOptions = {
          from: logEmailSenderUser, // sender address
          to: logEmailRecipient, // list of receivers
          subject: 'Crawler success', // Subject line
          text: 'Hello,\n\nHorray! The crawler worked perfectly.\n\n' + content // plaintext body
        }

        // send mail with defined transport object
        smtpTransport.sendMail( mailOptions, function( error, response ){
          if ( error ){
            console.log( error );
          } else {
            console.log( 'Message sent: ' + response.message );
          }
        } );

        break;
    }

    smtpTransport.close(); // shut down the connection pool, no more messages
  }
};