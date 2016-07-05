'use strict'

const Promise   = require( 'bluebird' )
const moment    = require( 'moment' )
const Blame     = require( 'blamejs' )
const exec      = Promise.promisify(
  require( 'child_process' ).exec
)
const talk      = require( './talk' )
const transform = require( './transform' )

module.exports = function blameDeps( file ){
  return new Promise( ( ok, no ) => {
    exec( `git blame ${ file } -p` )
      .then( output => {
        // Use blamejs to parse blame output
        const blame      = new Blame()

        blame.parseBlame( output )

        // Associate last commit time with lines of code
        const lines      = transform.toList( blame.line_data )
          .map( pair => pair[ 1 ] )
          .map( ( line, index ) => {
            const commit = blame.commit_data[ line.hash ]
            const time   = moment.unix( commit.committerTime ).utcOffset( commit.committerTz )

            return {
              code : line.code,
              time : time.isValid() ? time : moment()
            }
          } )

        // Build dependency graph by iterating through line code
        const categoryMatcher   = /"(dependencies|devDependencies|peerDependencies)"\s*:\s*\{\s*/
        const dependencyMatcher = /"([^"]+)"\s*:\s*"([^"]+)"/

        const dependencies      = []

        let   currentCategory

        for( const line of lines ){
          const categoryMatch   = categoryMatcher.exec( line.code )

          // Determine whether or not the current line starts a dependency category
          // declaration, ends one, is in one or isn't, and skips iteration accordingly
          if( !categoryMatch ){
            if( line.code.includes( '}' ) ){
              currentCategory = undefined
            }
            if( !currentCategory )
              continue
          }
          else if( categoryMatch.length === 2 ){
            currentCategory = categoryMatch[ 1 ]

            continue
          }

          const dependencyMatch = dependencyMatcher.exec( line.code )

          if( dependencyMatch.length === 3 )
            dependencies.push( {
              category : currentCategory,
              name     : dependencyMatch[ 1 ],
              version  : dependencyMatch[ 2 ],
              time     : line.time
            } )
        }

        return ok( dependencies )
      } )
      .catch( no )
  } )
}
