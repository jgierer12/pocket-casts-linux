const { ipcRenderer } = require(`electron`);
const isDev = require(`electron-is-dev`);
const domLoaded = require(`dom-loaded`);
const select = require(`select-dom`);

try {
  isDev && require(`electron-reloader`)(module);
} catch (err) {
  console.error(err);
}

domLoaded.then(() => {
  const getControlsNode = () => select(`.player-controls > .controls`);
  let hasControlsNode = false;

  const observer = new MutationObserver(() => {
    const controlsNode = getControlsNode();
    if (!hasControlsNode && controlsNode) {
      ipcRenderer.send(`playerReady`);
      handlePlayerReady(controlsNode);
    }
    if (hasControlsNode && !controlsNode) {
      ipcRenderer.send(`playerUnready`);
    }
    hasControlsNode = !!controlsNode;
  });
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
});

const handlePlayerReady = controlsNode => {
  const playBtn = select(`.play_pause_button`, controlsNode);
  const isPlaying = () => playBtn.classList.contains(`pause_button`);

  const podcastImg = select(`.podcast-image img`, controlsNode);
  const episodeTitle = select(`.player_episode`, controlsNode);
  const podcastTitle = select(`.player_podcast_title`, controlsNode);
  const getMetadata = () => ({
    podcastImg: podcastImg.src,
    episodeTitle: episodeTitle.textContent,
    podcastTitle: podcastTitle.textContent,
  });

  const skipBackBtn = select(`.skip_back_button`, controlsNode);
  const skipForwardBtn = select(`.skip_forward_button`, controlsNode);

  ipcRenderer.send(`metadataChange`, getMetadata());
  ipcRenderer.send(`isPlayingChange`, isPlaying());

  ipcRenderer.on(
    `setPlaying`,
    (ev, newPlaying) => isPlaying() !== newPlaying && playBtn.click()
  );
  ipcRenderer.on(`skipBack`, () => skipBackBtn.click());
  ipcRenderer.on(`skipForward`, () => skipForwardBtn.click());

  const playBtnObserver = new MutationObserver(() => {
    ipcRenderer.send(`isPlayingChange`, isPlaying());
  });
  playBtnObserver.observe(playBtn, {
    attributes: true,
    attributeFilter: [`class`],
  });

  const episodeTitleObserver = new MutationObserver(() => {
    ipcRenderer.send(`metadataChange`, getMetadata());
  });
  episodeTitleObserver.observe(episodeTitle, {
    characterData: true,
    subtree: true,
  });
};
