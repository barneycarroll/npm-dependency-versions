const chalk = require( 'chalk' )

// Tag function: consumes template literal, outputs a string
function stringify(){
  const strings = arguments[ 0 ].slice( 1 )

  return [].slice.call( arguments, 1 ).reduce( ( buffer, value, index ) =>
    buffer + value + strings[ index ],
    arguments[ 0 ][ 0 ]
  )
}

module.exports = {
  complain (){ console.log( chalk.red(   stringify.apply( this, arguments ) ) ) },
  observe  (){ console.log( chalk.dim(   stringify.apply( this, arguments ) ) ) },
  rejoice  (){ console.log( chalk.green( stringify.apply( this, arguments ) ) ) }
}
