module.exports = {
  IPC_EVENTS: {
    PLAYER_READY: `PLAYER_READY`,
    PLAYER_UNREADY: `PLAYER_UNREADY`,
    METADATA_CHANGE: `METADATA_CHANGE`,
    IS_PLAYING_CHANGE: `IS_PLAYING_CHANGE`,
    SET_PLAYING: `SET_PLAYING`,
    SKIP_BACK: `SKIP_BACK`,
    SKIP_FORWARD: `SKIP_FORWARD`,
  },
  MPRIS_EVENTS: {
    FOCUS: `raise`,
    QUIT: `quit`,
    IS_PLAYING_CHANGE: `playpause`,
    SKIP_BACK: `previous`,
    SKIP_FORWARD: `next`,
  },
  MPRIS: {
    PLAYING: `Playing`,
    PAUSED: `Paused`,
    STOPPED: `Stopped`,
    METADATA: {
      TITLE: `xesam:title`,
      ARTIST: `xesam:artist`,
      ART_URL: `mpris:artUrl`,
    },
  },
  APP_NAME: `Pocket Casts`,
  POCKET_CASTS_URL: `https://playbeta.pocketcasts.com/web/`,
};
