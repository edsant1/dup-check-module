var md5 = require( 'md5' );
var util = require('./util');

function DuplicatePrevention(redisClient, options){
    if( !options ){
        options = {};
    }
    else if( !util.isObject( options ) ){
        throw new Error( 'options must be an object' );
    }
    else{
        var errors = [];

        if( !util.isNumber( options.ttl ) ){
            errors.push( "ttl must be a number" );
        }

        if( !util.isString( options.prefix ) ){
            errors.push( "prefix must be a string" );
        }

        if( options.redisKeys && !Array.isArray( options.redisKeys ) ){
            errors.push( "redisKeys must be an array" );
        }
    }

    if( typeof options !== 'object' ){
        throw new Error( 'options must be an object' );
    }
    else if( !redisClient ){
        throw new Error('redis client required');
    }
    else{
        this.redisClient = redisClient;
        this.ttl = options.ttl || 30;
        this.prefix = options.prefix || '';
        this.redisKeys = options.redisKeys || [ 'method', 'url', 'ip' ];
    }
}

DuplicatePrevention.prototype.createMiddleware = function( options ){
    if( !options ){
        options = {};
    }

    options.ttl = options.ttl || this.ttl;
    options.prefix = options.prefix || this.prefix;
    options.redisKeys = options.redisKeys || this.redisKeys;

    return function( req, res, next ){
        var key = options.prefix;

        options.redisKeys.forEach( function( item ){
            key += req[ item ]
        } );
        this.stopOtherRequests( key, function(){
            let hash = this.createHash( req );
            this.checkHash( hash, function( _, isDuplicate ){
                console.log( isDuplicate );
                if( isDuplicate ){
                    return res.send( 409, { errors: [ 'Duplicate request detected' ] } );
                }
                this.setHash( hash, options.ttl, function(){
                    this.redisClient.del( key );
                    return next();
                }.bind( this ) );
            }.bind( this ) );
        }.bind( this ) );
    }.bind( this )
}

DuplicatePrevention.prototype.checkHash = function( hash, cb ){
    this.redisClient.get( hash, cb );
}

DuplicatePrevention.prototype.stopOtherRequests = function( key, cb ){
    this.redisClient.getset( key, true, function( previous ){
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

DuplicatePrevention.prototype.createHash = function( req ){
    var string = JSON.stringify( req.body );
    return md5( string );
}

DuplicatePrevention.prototype.setHash = function( hash, ttl, cb ){
    this.redisClient.setex( hash, ttl, "true", cb );
}

module.exports = DuplicatePrevention;