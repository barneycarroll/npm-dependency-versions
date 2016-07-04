'use strict'

// Tag function: consumes template literal, outputs a string
module.exports = function untag(){
  const strings = arguments[ 0 ].slice( 1 )

  return [].slice.call( arguments, 1 ).reduce( ( buffer, value, index ) =>
    buffer + value + strings[ index ],
    arguments[ 0 ][ 0 ]
  )
}
