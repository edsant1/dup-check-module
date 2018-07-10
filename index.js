var md5 = require( 'md5' );

function PreventDuplicate( options, redisConnection ){
  this.wait = options.wait || 60000;
  this.redisConnection = redisConnection;
}

PreventDuplicate.prototype.middleware = function( req, res, next ){
  var reqCopy = JSON.parse( JSON.stringify( req.body ) );
  // MD5 hash
  // then check database
  // then save to database
  // this.redisConnection.write
  var hash = md5.hash( req.body );
}

PreventDuplicate.prototype.retry = function( req, res, next ){
  process.setImmediate( function(){
    this.check( req, res, nex );
  } );
}