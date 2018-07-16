var md5 = require( 'md5' );

function DuplicatePrevention(redisClient, options){
    if( !options ){
        options = {};
    }
    else if( typeof options !== 'object' ){
        throw new Error( 'options must be an object' );
    }
    else{
        this.redisClient = redisClient;
        this.ttl = options.ttl;
        this.prefix = options.prefix || '';
        this.redisKeys = options.redisKeys || [ 'method', 'url', 'ip' ];
    }
}

DuplicateCheck.prototype.createMiddleware = function( options ){
    if( !options ){
        options = this.options;
    }
// merge global options to endpoint options
    return function( req, res, next ){
        var key = options.prefix;
        options.redisKeys.forEach( function( item ){
            key += req[ item ]
        } );
        this.stopOtherRequests( key, function(){
            let hash = this.createHash( req );
            this.checkHash( hash, function( isDuplicate ){
                if( isDuplicate ){
                    return res.send( 409, { errors: [ 'Duplicate request detected' ] } );
                }
                this.setHash( hash, options.ttl, function(){
                    this.redisClient.del( key );
                    return next();
                } );
            } );
        } );
    }.bind( this )
}

DuplicateCheck.prototype.checkHash = function( hash, cb ){
    this.redisClient.get( hash, cb );
}

DuplicateCheck.prototype.stopOtherRequests = function( key, cb ){
    this.redisClient.getset( key, true, function(){
        if( previous ){
            process.setImmediate( function(){
                this.stopOtherRequests( key, cb );
            }.bind( this ) );
        }
        else{
            cb();
        }
    } );
}

DuplicateCheck.prototype.createHash = function( req ){
    var string = JSON.stringify( req.body );
    return md5( string );
}

DuplicateCheck.prototype.setHash = function( hash, ttl, cb ){
    this.redisClient.setex( hash, ttl, true, cb );
}

module.exports.DuplicatePrevention = DuplicatePrevention;