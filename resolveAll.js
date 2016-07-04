'use strict'

module.exports = promises =>
  new Promise( ( ok, no ) => {
    const successes  = []
    const rejections = []

    for( const promise of promises )
      promise
        .then( x => successes.push( x ) )
        .catch( e => rejections.push( e ) )
        .finally( () => {
          if( successes.length + rejections.length === promises.length )
            ok( successes, rejections )
        } )
  } )
