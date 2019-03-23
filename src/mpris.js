const { ipcMain } = require(`electron`);
const Player = require(`mpris-service`);

const { IPC_EVENTS, MPRIS, MPRIS_EVENTS, APP_NAME } = require(`./constants`);

let player, sender;

const send = (channel, args) => {
  if (sender) sender.send(channel, args);
};

const statusToBool = status => status === MPRIS.PLAYING;
const boolToStatus = bool => (bool ? MPRIS.PLAYING : MPRIS.PAUSED);

ipcMain.on(IPC_EVENTS.IS_PLAYING_CHANGE, (ev, newPlaying) => {
  sender = ev.sender;

  if (player) {
    player.playbackStatus = boolToStatus(newPlaying);
  }
});

const getJpgUrl = webpUrl =>
  webpUrl.replace(`webp/`, ``).replace(`.webp`, `.jpg`);

ipcMain.on(
  IPC_EVENTS.METADATA_CHANGE,
  (ev, { episodeTitle, podcastTitle, podcastImg }) => {
    sender = ev.sender;

    if (player) {
      player.metadata = {
        [MPRIS.METADATA.TITLE]: episodeTitle,
        [MPRIS.METADATA.ARTIST]: [podcastTitle],
        [MPRIS.METADATA.ART_URL]: getJpgUrl(podcastImg),
      };
    }
  }
);

ipcMain.on(IPC_EVENTS.PLAYER_UNREADY, () => {
  if (player) {
    player.playbackStatus = MPRIS.STOPPED;
  }
});

module.exports.init = window => {
  player = new Player({
    name: `pocket_casts_linux`,
    identity: APP_NAME,
    supportedInterfaces: [`player`],
  });
  player.canSeek = false;
  player.canControl = true;
  player.canPlay = true;
  player.canPause = true;
  player.canGoNext = true;
  player.canGoPrevious = true;

  player.on(MPRIS_EVENTS.FOCUS, () => {
    window.focus();
  });

  player.on(MPRIS_EVENTS.QUIT, () => {
    process.exit();
  });

  player.on(MPRIS_EVENTS.IS_PLAYING_CHANGE, () =>
    send(IPC_EVENTS.SET_PLAYING, !statusToBool(player.playbackStatus))
  );
  player.on(MPRIS_EVENTS.SKIP_BACK, () => send(IPC_EVENTS.SKIP_BACK));
  player.on(MPRIS_EVENTS.SKIP_FORWARD, () => send(IPC_EVENTS.SKIP_FORWARD));
};
