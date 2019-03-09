const { ipcMain } = require(`electron`);
const Player = require(`mpris-service`);

let player, sender;

const send = (channel, args) => {
  if (sender) sender.send(channel, args);
};

const statusToBool = status => status === `Playing`;
const boolToStatus = bool => (bool ? `Playing` : `Paused`);

ipcMain.on(`isPlayingChange`, (ev, newPlaying) => {
  sender = ev.sender;

  if (player) {
    player.playbackStatus = boolToStatus(newPlaying);
  }
});

const getJpgUrl = webpUrl =>
  webpUrl.replace(`webp/`, ``).replace(`.webp`, `.jpg`);

ipcMain.on(
  `metadataChange`,
  (ev, { episodeTitle, podcastTitle, podcastImg }) => {
    sender = ev.sender;

    if (player) {
      player.metadata = {
        "xesam:title": episodeTitle,
        "xesam:artist": [podcastTitle],
        "mpris:artUrl": getJpgUrl(podcastImg),
      };
    }
  }
);

ipcMain.on(`playerUnready`, () => {
  if (player) {
    player.playbackStatus = `Stopped`;
  }
});

module.exports.init = window => {
  player = new Player({
    name: `pocket_casts_linux`,
    identity: `Pocket Casts`,
    supportedInterfaces: [`player`],
  });
  player.canSeek = false;
  player.canControl = true;
  player.canPlay = true;
  player.canPause = true;
  player.canGoNext = true;
  player.canGoPrevious = true;

  player.on(`raise`, () => {
    window.focus();
  });

  player.on(`quit`, () => {
    process.exit();
  });

  player.on(`playpause`, () =>
    send(`setPlaying`, !statusToBool(player.playbackStatus))
  );
  player.on(`previous`, () => send(`skipBack`));
  player.on(`next`, () => send(`skipForward`));
};
