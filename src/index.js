const path = require(`path`);
const { ipcMain, shell, app, BrowserWindow } = require(`electron`);
const isDev = require(`electron-is-dev`);
const getWindowState = require(`electron-window-state`);

const { POCKET_CASTS_URL, IPC_EVENTS, APP_NAME } = require(`./constants`);

require(`./reloader`);

let window = null;

const showWindow = () => {
  window && window.show && window.show();
};

const exitWindow = () => {
  window = null;
};

const createWindow = () => {
  const windowState = getWindowState({
    defaultWidth: 1200,
    defaultHeight: 800,
  });

  window = new BrowserWindow(
    Object.assign(
      {
        show: false,
        title: APP_NAME,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          preload: path.join(__dirname, `content.js`),
        },
      },
      windowState
    )
  );
  window.setMenuBarVisibility(false);

  windowState.manage(window);

  isDev && window.webContents.openDevTools();
  window.loadURL(POCKET_CASTS_URL);

  window.on(`ready-to-show`, showWindow);
  setTimeout(showWindow, 500);

  window.webContents.on(`new-window`, (ev, url) => {
    ev.preventDefault();
    shell.openExternal(url);
  });

  window.on(`closed`, exitWindow);
  process.on(`beforeExit`, exitWindow);
};

app.on(`ready`, createWindow);

ipcMain.once(IPC_EVENTS.PLAYER_READY, () => require(`./mpris`).init(window));
