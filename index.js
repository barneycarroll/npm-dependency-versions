'use strict'

const fs        = require( 'fs' )
const path      = require( 'path' )
const moment    = require( 'moment' )

const talk       = require( './talk' )
const transform  = require( './transform' )
const blameGraph = require( './blameGraph' )
const settleAll  = require( './settleAll' )
const getAtDate  = require( './getVersionAtDate' )

module.exports = function dependencyVersions( options ){
  return new Promise( ( ok, no ) => {
    const date = options.date
    const pkgs = options.pkgs

    if( !moment( date ).isValid() ){
      talk.complain `Couldn't parse the supplied date. Make sure it's in a valid ISO_8601 format (or just omit the option)`

      process.exit( 1 )
    }

    const getVersion = ( pkg, version ) =>
      getAtDate( moment( date ), pkg, version )

    if( pkgs && pkgs.length )
      return settleAll(
        pkgs.map( getVersion )
      )
        .then( transform.toObject )
        .then( manifest =>
          JSON.stringify( manifest, undefined, 2 )
        )
        .then( ok )
        .catch( no )

    else {
      if( !options.date )
        return blameGraph( './package.json' )
          .then( blame => {
            const manifest = Object.create( null )

            settleAll(
              blame.map( blamedDep =>
                getAtDate(
                  blamedDep.time,
                  blamedDep.name,
                  blamedDep.version
                ).then( versionedDep => {
                  if( !( blamedDep.category in manifest ) )
                    manifest[ blamedDep.category ] = {}

                  manifest[ blamedDep.category ][ versionedDep[ 0 ] ] = versionedDep[ 1 ]
                } )
              )
            )
              .then( () =>
                JSON.stringify( manifest, undefined, 2 )
              )
              .then( ok )
          } )
          .catch( error => {
            talk.complain( `Couldn't use git blame on ./package.json for the reasons cited below. Getting versions for today instead:` + error )
          } )

      talk.announce `No packages specified, attempting to use git blame on package.json...`

      const pkg = Object.create( null )

      try {
        Object.assign( pkg,
          JSON.parse( fs.readFileSync( './package.json', 'utf8' ) )
        )
      }
      catch( e ){
        talk.complain `Couldn't read from a package.json in the current directory`

        process.exit( 1 )
      }

      talk.announce `Building historical dependency graph`

      const graph = [
        'dependencies',
        'devDependencies',
        'peerDependencies'
      ]
        .filter( key => key in pkg )
        .map( key => [
          key,
          transform.toList( pkg[ key ] )
        ] )
        .map( pair => [
          pair[ 0 ],
          pair[ 1 ].map( entry => entry[ 0 ] )
        ] )

      return settleAll(
        graph.map( dependencies =>
          settleAll(
            dependencies[ 1 ].map( x => getVersion( x ) )
          )
            .then( outcomes => [
              dependencies[ 0 ],
              transform.toObject( outcomes )
            ] )
        )
      )
        .then( transform.toObject )
        .then( x =>
          JSON.stringify( x, undefined, 2 )
        )
        .then( ok )
        .catch( no )
    }
  } )
}
