/**
 * need to find a way to call multiple files from here for
 * mocha to test.
 * find out why it hangs. most likely cause done not being called.
 */
describe( "Unit Tests", function(){
  describe( "should run all unit tests", function(){
    require( "./unit/duplicate-check" );
  } );
} );