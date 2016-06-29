var fs   = Promise.promisifyAll( require( 'fs' ) )
var exec = Promise.promisify(    require( 'child_process' ).exec )
var git  = Promise.promisifyAll( require( 'git' ) )
