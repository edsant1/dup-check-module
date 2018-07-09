var md5 = require( 'md5' );
var redis = require('redis');
var client = redis.createClient();

function DuplicateCheck( options, redisConnection ){
  this.isChecking = false;
  this.wait = options.wait || 60000;
  this.redisConnection = redisConnection;
}

DuplicateCheck.prototype.check = function( req, res, next ){
  if( this.isChecking ){
    this.retry();
  }
  else{
    this.isChecking = true;
    // MD5 hash
    // then check database
    // then save to database
    // this.redisConnection.write
    var hash = md5.hash( req.body );
  }
}

DuplicateCheck.prototype.retry = function( req, res, next ){
  process.setImmediate( function(){
    this.check( req, res, nex );
  } );
}