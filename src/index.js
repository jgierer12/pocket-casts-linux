const path = require(`path`);
const { ipcMain, shell, app } = require(`electron`);
const isDev = require(`electron-is-dev`);
const { initSplashScreen } = require(`@trodi/electron-splashscreen`);

const POCKET_CASTS_URL = `https://playbeta.pocketcasts.com/web/`;

try {
  isDev && require(`electron-reloader`)(module);
} catch (err) {
  console.error(err);
}

let window = null;

const createWindow = () => {
  const size = { width: 1200, height: 800 };
  window = initSplashScreen({
    templateUrl: path.join(__dirname, `splash-screen`, `index.html`),
    splashScreenOpts: size,
    windowOpts: Object.assign(
      {
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          preload: path.join(__dirname, `content.js`),
        },
      },
      size
    ),
  });
  window.setMenuBarVisibility(false);

  isDev && window.webContents.openDevTools();
  window.loadURL(POCKET_CASTS_URL);

  window.webContents.on(`new-window`, (ev, url) => {
    ev.preventDefault();
    shell.openExternal(url);
  });

  window.on(`closed`, () => {
    window = null;
  });
};

app.on(`ready`, createWindow);

ipcMain.once(`playerReady`, () => require(`./mpris`).init(window));
