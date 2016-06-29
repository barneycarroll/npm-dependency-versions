module.exports = obj => {
  const array = []

  for( const key in obj )
    if( obj.hasOwnProperty( key ) )
      array.push( {
        key   : key,
        value : obj[ key ]
      } )

  return array
}
