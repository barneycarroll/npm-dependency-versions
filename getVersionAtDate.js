'use strict'

const Promise = require( 'bluebird' )
const Spinner = require( 'cli-spinner' ).Spinner
const moment  = require( 'moment' )

const talk    = require( './talk' )
const exec    = Promise.promisify(
  require( 'child_process' ).exec
)

module.exports = ( time, name ) => {
  const outcome = new Promise( ( ok, no ) => {
    const query = exec( 'npm view --json ' + name )
      .then( output => {
        const pkg      = JSON.parse( output )

        const releases = pkg.versions.map( version => ( {
          version,
          time : pkg.time[ version ]
        } ) )

        if( moment( releases[ 0 ].time ) > time )
          no(
              `${ name } was not yet available on npm at ${ time }.\n`
            + `The earliest published version was ${ releases[ 0 ].version }, at ${ releases[ 0 ].time }`
          )

        for( const i of releases.keys() ){
          const a = releases[ i ]
          const b = releases[ i + 1 ] || { time : moment() + 1 }

          if( moment( time ).isBetween( a.time, b.time ) )
            return ok( [ name, a.version ] )
        }
      } )

    query.catch( error => {
      no(
          `Couldn't get history of ${ name } from npm:\n`
        + error
        + `\n\n`
      )
    } )

    return query
  } )

  {
    const progress = new Spinner()

    talk.announce `Querying npm's release history for ${ name }...`

    progress.start()

    outcome.catch( talk.complain )

    outcome.finally( () =>
      progress.stop( true )
    )
  }

  return outcome
}
