'use strict'

module.exports = {
  toList : object => {
    const list = []

    for( const key in object )
      if( object.hasOwnProperty( key ) )
        list.push( [ key, object[ key ] ] )

    return list
  },

  toObject : list =>
    list.reduce(
      ( object, item ) => {
        object[ item[ 0 ] ] = item[ 1 ]
      },
      {}
    )
}
