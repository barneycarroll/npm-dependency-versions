'use strict'

const moment    = require( 'moment' )
const fs        = require( 'fs' )

const talk      = require( './talk' )
const transform = require( './transform' )
const settleAll = require( './settleAll' )
const getAtDate = require( './getVersionAtDate' )

module.exports = function dependencyVersions( options ){
  const date = options.date
  const pkgs = options.pkgs

  if( !moment( date ).isValid() ){
    talk.complain `Couldn't parse the supplied date. Make sure it's in a valid ISO_8601 format (or just omit the option)`

    process.exit( 1 )
  }

  const getVersion = pkg =>
    getAtDate( moment( date ), pkg )

  if( pkgs && pkgs.length )
    return settleAll(
      pkgs.map( getVersion )
    )
      .then( transform.toObject )
      .then( manifest =>
        JSON.stringify( manifest, undefined, 2 )
      )
      .then( x =>
        process.stdout.write( x )
      )

  else {
    talk.announce `No packages specified, reading from package.json...`

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
          dependencies[ 1 ].map( getVersion )
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
      .then( x =>
        process.stdout.write( x )
      )
  }
}
