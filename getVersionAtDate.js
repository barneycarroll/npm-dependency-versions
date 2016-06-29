'use strict'

const Promise = require( 'bluebird' )
const moment  = require( 'moment' )
const exec    = Promise.promisify(
  require( 'child_process' ).exec
)
const Spinner = require( 'cli-spinner' ).Spinner

module.exports = ( name, time ) =>
  new Promise( ( ok, no ) => {
    const progress = new Spinner()

    progress.start()

    exec( 'npm view --json ' + name )
      .then( output => {
        const pkg      = JSON.parse( output )

        const releases = pkg.versions.map( version => ( {
          version,
          time : pkg.time[ version ]
        } ) )

        if( moment( releases[ 0 ].time ) > time )
          return no(
              `${ name } was not yet available on npm at ${ time }.\n`
            + `The earliest published version was ${ releases[ 0 ].version }, at ${ releases[ 0 ].time }`
          )

        for( const i of releases.keys() ){
          const a = releases[ i ]
          const b = releases[ i + 1 ] || { time : moment() + 1 }

          if( moment( time ).isBetween( a.time, b.time ) )
            return ok( {
              name,
              version : a.version
            } )
        }
      } )
      .catch( error =>
        no(
            `Failed to query npm for history of ${ name }, citing:\n\n`
          + error
        )
      )
      .finally( () =>
        progress.stop( true )
      )
  } )
