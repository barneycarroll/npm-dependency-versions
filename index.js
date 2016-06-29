#!/usr/bin/env node
'use strict'

const Promise = require( 'bluebird' )
const cmd     = require( 'commander' )
const moment  = require( 'moment' )
const fs      = require( 'fs' )

const get     = require( './getVersionAtDate' )

cmd
  .arguments( '[packages...]' )
  .option( '--date [date]', 'The date at which the packages should be versioned' )
  .parse( process.argv )

if( cmd.date ){
  if( !moment( cmd.date ).isValid() )
    throw new Error( 'Couldn\'t parse the supplied date. Make sure it\'s in a valid ISO_8601 format (or just omit the option)' )
}
else
  throw new Error( 'You must supply a --date in an ISO_8601 (eg 2016-06-29 or 2016-06-29T12:16:22Z)' )

if( !cmd.args || !cmd.args.length ){
  console.log( 'No packages specified, reading from package.json...' )

  const pkg = Object.create( null )

  try {
    Object.assign( pkg,
      JSON.parse( fs.readFileSync( './package.json', 'utf8' ) )
    )
  }
  catch( e ){
    throw new Error( 'Couldn\'t read from a package.json in the current directory', e )
  }

  [ 'dependencies', 'devDependencies', 'peerDependencies' ].reduce( category => {

  } )
}
else
  Promise
    .all(
      cmd.args.map( name =>
        get( name, moment( cmd.date ) )
          .then( version => ( {
            name,
            version
          } ) )
      )
    )
    .then( releases =>
      process.stdout.write(
        JSON.stringify(
          releases.reduce(
            ( buffer, release ) => {
              buffer[ release.name ] = release.version

              return buffer
            },
            {}
          ),
          undefined,
          2
        )
      )
    )

