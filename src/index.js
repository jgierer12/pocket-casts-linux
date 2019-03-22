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
  window.loadFile(path.join(__dirname, `test.html`));
  // window.loadURL(POCKET_CASTS_URL);

  window.on(`ready-to-show`, showWindow);
  setTimeout(showWindow, 500);

  window.webContents.on(`new-window`, (ev, url) => {
    ev.preventDefault();
    shell.openExternal(url);
  });

  window.on(`closed`, () => {
    window = null;
  });
};

app.on(`ready`, createWindow);
app.on(`window-all-closed`, app.quit);

ipcMain.once(IPC_EVENTS.PLAYER_READY, () => require(`./mpris`).init(window));

const zoom = action => () => {
  const view = window && window.webContents;
  if (!view) {
    return;
  }

  switch (action) {
    case `in`:
      view.getZoomLevel(current => view.setZoomLevel(current + 1));
      break;
    case `out`:
      view.getZoomLevel(current => view.setZoomLevel(current - 1));
      break;
    case `reset`:
      view.setZoomLevel(0);
      break;
  }
};
ipcMain.on(IPC_EVENTS.ZOOM_IN, zoom(`in`));
ipcMain.on(IPC_EVENTS.ZOOM_OUT, zoom(`out`));
ipcMain.on(IPC_EVENTS.ZOOM_RESET, zoom(`reset`));

ipcMain.on(IPC_EVENTS.METADATA_CHANGE, (ev, { episodeTitle, podcastTitle }) => {
  const title = [episodeTitle, podcastTitle, APP_NAME]
    .filter(str => !!str)
    .join(` - `);

  window && window.setTitle(title);
});
