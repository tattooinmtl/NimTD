(function () {
  // ============================================================
  // NimTD Audio UI
  // Adds a small volume control widget in the corner of the screen.
  // ============================================================

  const SOUND = () => window.NimTD?.sound;
  if (!SOUND()) return;

  // CSS for the widget
  const css = `
    #audio-widget {
      position: fixed; bottom: 10px; right: 10px; z-index: 9999;
      font-family: Segoe UI, Arial, sans-serif; color: #ccd3e7;
      user-select: none;
    }
    #audio-toggle {
      width: 36px; height: 36px;
      border: 1px solid #33405f; border-radius: 6px;
      background: #141428e8; color: #55aaff;
      font-size: 18px; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: all .15s;
    }
    #audio-toggle:hover { background: #1f1f3a; border-color: #55aaff; }
    #audio-toggle.muted { color: #ff6680; }
    #audio-panel {
      position: absolute; bottom: 44px; right: 0;
      width: 200px; padding: 10px;
      background: #141428f2; border: 2px solid #33405f; border-radius: 8px;
      box-shadow: 0 8px 24px #0008;
      display: none;
    }
    #audio-panel.open { display: block; }
    #audio-panel h4 {
      margin: 0 0 8px; padding-bottom: 4px;
      border-bottom: 1px solid #33405f;
      color: #ffaa00; font-size: 11px; letter-spacing: .08em;
    }
    .audio-row {
      display: flex; align-items: center; gap: 8px;
      margin: 6px 0; font-size: 11px;
    }
    .audio-row label { width: 50px; color: #929bb4; }
    .audio-row input[type=range] {
      flex: 1; height: 4px; appearance: none;
      background: #33405f; border-radius: 2px; outline: none;
    }
    .audio-row input[type=range]::-webkit-slider-thumb {
      appearance: none; width: 12px; height: 12px;
      background: #55aaff; border-radius: 50%; cursor: pointer;
    }
    .audio-row span { width: 26px; text-align: right; color: #55aaff; }
    #audio-mute-btn {
      width: 100%; margin-top: 6px; padding: 5px;
      border: 1px solid #44506f; border-radius: 4px;
      background: #282846; color: #d8def0; cursor: pointer; font-size: 11px;
    }
    #audio-mute-btn:hover { border-color: #8297ff; background: #36365e; }
    #audio-mute-btn.muted { color: #ff6680; border-color: #853d4d; }
  `;

  // Inject CSS
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  // Build widget HTML
  const widget = document.createElement('div');
  widget.id = 'audio-widget';
  widget.innerHTML = `
    <button id="audio-toggle" title="Audio settings">♪</button>
    <div id="audio-panel">
      <h4>AUDIO</h4>
      <div class="audio-row">
        <label>Master</label>
        <input type="range" id="vol-master" min="0" max="100" value="70">
        <span id="vol-master-val">70</span>
      </div>
      <div class="audio-row">
        <label>Music</label>
        <input type="range" id="vol-music" min="0" max="100" value="50">
        <span id="vol-music-val">50</span>
      </div>
      <div class="audio-row">
        <label>SFX</label>
        <input type="range" id="vol-sfx" min="0" max="100" value="80">
        <span id="vol-sfx-val">80</span>
      </div>
      <button id="audio-mute-btn">Mute All</button>
    </div>
  `;

  // Wait for body before injecting
  function inject() {
    if (!document.body) {
      setTimeout(inject, 50);
      return;
    }
    document.body.appendChild(widget);
    bind();
  }

  function bind() {
    const prefs = SOUND().getPrefs();
    const toggle = document.getElementById('audio-toggle');
    const panel = document.getElementById('audio-panel');
    const muteBtn = document.getElementById('audio-mute-btn');

    // Set initial values
    setSlider('master', prefs.master);
    setSlider('music', prefs.music);
    setSlider('sfx', prefs.sfx);
    updateMuteUI(prefs.muted);

    toggle.onclick = (e) => {
      e.stopPropagation();
      panel.classList.toggle('open');
      SOUND().playSfx('ui_click');
    };

    // Close panel on outside click
    document.addEventListener('click', (e) => {
      if (!widget.contains(e.target)) panel.classList.remove('open');
    });

    // Volume sliders
    ['master', 'music', 'sfx'].forEach(channel => {
      const slider = document.getElementById(`vol-${channel}`);
      const valEl = document.getElementById(`vol-${channel}-val`);
      slider.oninput = () => {
        const v = +slider.value;
        valEl.textContent = v;
        SOUND().setVolume(channel, v / 100);
      };
    });

    muteBtn.onclick = (e) => {
      e.stopPropagation();
      const p = SOUND().getPrefs();
      SOUND().setMuted(!p.muted);
      updateMuteUI(!p.muted);
      SOUND().playSfx('ui_click');
    };
  }

  function setSlider(channel, value) {
    const slider = document.getElementById(`vol-${channel}`);
    const valEl = document.getElementById(`vol-${channel}-val`);
    if (slider && valEl) {
      slider.value = Math.round(value * 100);
      valEl.textContent = slider.value;
    }
  }

  function updateMuteUI(muted) {
    const toggle = document.getElementById('audio-toggle');
    const btn = document.getElementById('audio-mute-btn');
    if (toggle) {
      toggle.classList.toggle('muted', muted);
      toggle.textContent = muted ? '♪̸' : '♪';
    }
    if (btn) {
      btn.classList.toggle('muted', muted);
      btn.textContent = muted ? 'Unmute' : 'Mute All';
    }
  }

  inject();
})();
