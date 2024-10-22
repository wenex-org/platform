/* eslint-disable @typescript-eslint/no-var-requires */
const madge = require('madge');

madge('./', {
  fileExtensions: ['ts'],
  tsConfig: require('./tsconfig.json'),
}).then((res) => res.image('circular-dependencies.svg'));
