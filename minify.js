var compressor = require('node-minify');

// Using UglifyJS
compressor.minify({
  compressor: 'uglifyjs',
  input: './js/*.js',
  output: './build/emailmq.min.js',
  callback: function(err, min) {}
});

compressor.minify({
  compressor: 'clean-css',
  input: './js/*.css',
  output: './build/custom.min.css',
  options: {
    advanced: false, // set to false to disable advanced optimizations - selector & property merging, reduction, etc.
    aggressiveMerging: false // set to false to disable aggressive merging of properties.
  },
  callback: function (err, min) {}
});
