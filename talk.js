'use strict'

const chalk = require( 'chalk' )
const untag = require( './untag' )

module.exports = {
  announce (){ console.log( chalk.dim(   untag.apply( this, arguments ) ) ) },
  complain (){ console.log( chalk.red(   untag.apply( this, arguments ) ) ) },
  rejoice  (){ console.log( chalk.green( untag.apply( this, arguments ) ) ) }
}
