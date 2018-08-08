var assert = require( 'assert' );
var DuplicateCheck = require( '../../index' );
var redis = require( 'redis' );
var redisClient = redis.createClient();

describe( 'Redis Assertion', function(){
    it( 'Should return an error if no redis client is provided', function(){
        assert.throws( function() {
            new DuplicateCheck();
        } );
    } );

    xit( 'Should return an error if its not an instance of redis', function(){
        assert.throws( function() {
            new DuplicateCheck( {} );
        } );
    } );
} );

describe( 'Options assertion', function(){
    it( 'Should return an error if options is not an object', function(){
        assert.throws( function() {
            new DuplicateCheck( redisClient, 748392 );
        } );
    } );

    it( 'Should return an error if ttl option is not a number', function(){
        assert.throws( function() {
            new DuplicateCheck( redisClient, { ttl: 'Test' } );
        } );
    } );

    it( 'Should return an error if prefix option is not a string', function(){
        assert.throws( function() {
            new DuplicateCheck( redisClient, { prefix: [] } );
        } );
    } );

    it( 'Should return an error if redisKey option is not an array', function(){
        assert.throws( function() {
            new DuplicateCheck( redisClient, { redisKeys: 'string' } );
        } );
    } );
} );

describe( 'Construction using default options', function(){
    var dupCheck = new DuplicateCheck( redisClient );

    it( 'Should return an instance of Duplicate Check', function(){
        assert( dupCheck instanceof DuplicateCheck );
    } );

    xit( 'the DuplicateCheck instance should have a redis client', function(){
        assert( dupCheck.redisClient instanceof redis.createClient );
    } );

    it( 'The DuplicateCheck instance should use default options', function(){
        assert.equal( dupCheck.ttl, 30 );
        assert.equal( dupCheck.prefix, '' );
        assert( Array.isArray( dupCheck.redisKeys ) );
        assert.equal( dupCheck.redisKeys.length, 3 );
        assert.equal( dupCheck.redisKeys[ 0 ], 'method' );
        assert.equal( dupCheck.redisKeys[ 1 ], 'url' );
        assert.equal( dupCheck.redisKeys[ 2 ], 'ip' );
    } );
} );

describe( 'Use user passed in options as global options', function(){
    var dupCheck = new DuplicateCheck( redisClient, {
        ttl: 10,
        prefix: 'test-',
        redisKeys: [ 'path', 'method' ]
    } );

    it( 'The instance should use global options', function(){
        assert.equal( dupCheck.ttl, 10 );
        assert.equal( dupCheck.prefix, 'test-' );
        assert( Array.isArray( dupCheck.redisKeys ) );
        assert.equal( dupCheck.redisKeys.length, 2 );
        assert.equal( dupCheck.redisKeys[ 0 ], 'path' );
        assert.equal( dupCheck.redisKeys[ 1 ], 'method' );
    } );
} );

describe( 'Check/Set redis database flag', function(){
    var dupCheck = new DuplicateCheck( redisClient, {} );
    it( 'Should set flag in db', function(){
        dupCheck.stopOtherRequests( "test", function( previous ){
            dupCheck.checkHash( "test", function( err, res ){
                assert.equal( res, "true" );
            } );
        } );
    } );
} );

describe( 'Create, check, and set hash function', function(){
    var dupCheck = new DuplicateCheck( redisClient, { ttl: 10, prefix: 'test-' } );
    var redisKey = 'POST /tests'
    var hash;
    
    it( 'The instance should have a createHash function', function(){
        assert( 'createHash' in dupCheck );
        assert( ( typeof dupCheck.createHash ) === 'function' );
    } );

    it( 'The instance should have a checkHash function', function(){
        assert( 'checkHash' in dupCheck );
        assert( ( typeof dupCheck.checkHash ) === 'function' );
    } );

    it( 'The instance should have a setHash function', function(){
        assert( 'setHash' in dupCheck );
        assert( ( typeof dupCheck.setHash ) === 'function' );
    } );
    
    it( 'Should create an md5 hash', function(){
        hash = dupCheck.createHash( { body: '31jfds-fdjsk23' } );
        assert( ( typeof hash ) === 'string' );
    } );

    it( 'Should check redis if hash exists and return false', function(){
        dupCheck.checkHash( hash, function( err, res ){
            assert.equal( res, null );
        } )
    } );

    it( 'should set hash in redis', function(){
        dupCheck.setHash( redisKey, 10, function(){
            dupCheck.checkHash( redisKey, function( err, res){
                assert.equal( res, 'true' );
            } );
        } );
    } );

    it( 'Should check redis if hash exists and return true', function(){
        dupCheck.checkHash( redisKey, function( err, res ){
            assert.equal( res, 'true' );
        } );
    } );
} );

describe( 'createMiddleware', function(){
    var dupCheck = new DuplicateCheck( redisClient, {} );

    it( 'Should return have a method called createMiddleware', function(){
        assert( 'createMiddleware' in dupCheck );
    } );

    it( 'Should be a function', function(){
        assert( ( typeof dupCheck.createMiddleware ) === 'function' );
    } );
    
    it( 'Should return a function', function(){
        assert( ( typeof dupCheck.createMiddleware() ) === 'function' );
        
    } );

    after('close all redis connections', function(){
        redisClient.quit();
    } );
} );

/*
    - Defaults for key should be [method, path, ip] with delimited dash (-).
    - Should check for nginx ip e.g x-real-ip.
    - Maybe use event emitter to handle error, duplicate, info.
    - Do not stop flow if redis returns error or is offline use error event to throw.
    - Each middleware function should clone the this.options so that it does not override
    for other routes, and would help with specific endpoints.
    - Check restify and redis versions using version checker.
    - Should not use lexical scope 'this'. Use bind or call functions.
    - Use promises.
    - Add a 'use strict' option so we respond and send message
    - Should set flag to 'this' to hold state instead of writing to redis db?
    - If using redis 2.0.0 use setex to set hash and ttl at the same time, else use set
    and expire.
*/