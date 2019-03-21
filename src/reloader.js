const isDev = require(`electron-is-dev`);

try {
  isDev && require(`electron-reloader`)(module);
} catch (err) {
  console.error(err);
}
