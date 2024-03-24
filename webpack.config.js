const path = require('path');

module.exports = {
  entry: './src/index.js',
  // The location of the build folder described above
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.js'
  },
};