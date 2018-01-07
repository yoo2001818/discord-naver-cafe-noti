if (process.env.NODE_ENV === 'production') {
  require('./lib/index');
} else {
  require('babel-register');
  require('./src/index');
}
