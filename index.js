'use strict'

const moment     = require( 'moment' )
const fs         = require( 'fs' )

const talk       = require( './talk' )
const transform  = require( './transform' )
const resolveAll = require( './resolveAll' )
const getAtDate  = require( './getVersionAtDate' )

const manifestify = releases =>
  releases.reduce(
    ( buffer, release ) => {
      if( release )
        buffer[ release.name ] = release.version

      return buffer
    },
    {}
  )

module.exports = function dependencyVersions( options ){
  const date = options.date
  const args = options.args

  if( !moment( date ).isValid() ){
    talk.complain `Couldn't parse the supplied date. Make sure it's in a valid ISO_8601 format (or just omit the option)`

    process.exit( 1 )
  }

  const getVersion = pkg =>
    getAtDate( moment( date ), pkg )

  if( args && args.length )
    return Promise.all(
      args.map( getVersion )
    )
      .then( manifestify )
      .then( x => JSON.stringify( x, undefined, 2 ) )
      .then( process.stdout.write )

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

    return Promise.all(
      graph.map( dependencies => {
        const key  = dependencies[ 0 ]
        const list = dependencies[ 1 ]

        return resolveAll(
          list.map( getVersion )
        )
          .then( outcomes => [
            key,
            manifestify( outcomes[ 1 ] )
          ] )
      } )
    )
      .then( categories =>
        transform.toObject( categories )
      )
      .then( x => JSON.stringify( x, undefined, 2 ) )
      .then( process.stdout.write )
  }
}
