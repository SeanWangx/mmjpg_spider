require('babel-core/register')
require('./src/app.js')
require("babel-core").transform("code", {
  plugins: ["transform-runtime"]
});
