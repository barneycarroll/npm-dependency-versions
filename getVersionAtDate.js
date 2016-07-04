'use strict'

const Spinner = require( 'cli-spinner' ).Spinner
const moment  = require( 'moment' )

const talk    = require( './talk' )
const exec    = function(){
  return new Promise( ( ok, no ) =>
    require( 'child_process' ).exec(
      [].concat.call( arguments, ( e, stdout, stderr ) =>
        e ? no( e ) : sterr ? no( stderr ) : ok( stout )
      )
    )
  )
}

module.exports = ( time, name ) => {
  const outcome = new Promise( ( ok, no ) => {
    const query = exec( 'npm view --json ' + name )
      .then( output => {
        console.log( '+Got output:' )
        console.log( output )

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

    query.catch( error => {
      console.log( '+NPM error:' )
      console.log( error )

      no(
          `Couldn't get history of ${ name } from npm:\n\n`
        + error
      )
    } )

    return query
  } )

  talk.announce `Querying npm's release history for ${ name }...\n`

  const progress = new Spinner()

  progress.start()

  outcome.catch( () =>
    progress.stop( true )
  )

  outcome.then( () =>
    progress.stop( true )
  )

  return outcome
}
