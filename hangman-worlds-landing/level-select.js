(() => {
  const stars = document.getElementById('stars');
  const soundToggle = document.getElementById('soundToggle');
  const vibrationToggle = document.getElementById('vibrationToggle');
  const soundStatus = document.getElementById('soundStatus');
  const vibrationStatus = document.getElementById('vibrationStatus');
  const continueButton = document.getElementById('continueButton');
  const hint = document.getElementById('levelHint');
  const speech = document.getElementById('speech');
  const page = document.getElementById('levelPage');
  let soundOn = localStorage.getItem('hangmanSound') !== 'false';
  let vibrationOn = localStorage.getItem('hangmanVibration') !== 'false';
  let selectedLevel = localStorage.getItem('hangmanLevel') || 'easy';
  let audioContext, ambientGain, ambientTimer, ambientNodes = [];

  for (let i = 0; i < 62; i++) {
    const star = document.createElement('span'); const size = Math.random() * 2.4 + 1;
    star.style.width = `${size}px`; star.style.height = `${size}px`; star.style.left = `${Math.random() * 100}%`; star.style.top = `${Math.random() * 100}%`;
    star.style.animationDelay = `${Math.random() * 4}s`; star.style.animationDuration = `${2 + Math.random() * 4}s`; stars.appendChild(star);
  }
  function ensureAudio() {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return false;
    audioContext ||= new AudioCtx();
    if (audioContext.state === 'suspended') audioContext.resume();
    return true;
  }
  function playTone(freq = 620, duration = 0.075, volume = 0.055) {
    if (!soundOn || !ensureAudio()) return;
    try { const o=audioContext.createOscillator(), g=audioContext.createGain(); o.type='sine'; o.frequency.value=freq;
      g.gain.setValueAtTime(0.0001,audioContext.currentTime); g.gain.exponentialRampToValueAtTime(volume,audioContext.currentTime+.025); g.gain.exponentialRampToValueAtTime(.0001,audioContext.currentTime+duration);
      o.connect(g);g.connect(audioContext.destination);o.start();o.stop(audioContext.currentTime+duration+.03);
    } catch (_) {}
  }
  function chime() { if (!soundOn || !ensureAudio()) return; const notes=[523.25,659.25,783.99,659.25]; const f=notes[Math.floor(Math.random()*notes.length)]; playTone(f,.8,.012); }
  function startAmbient() {
    if (!soundOn || !ensureAudio() || ambientTimer) return;
    try {
      // Soft fantasy-game ambience: warm magical pad, airy wind, and occasional sparkles.
      ambientGain = audioContext.createGain();
      ambientGain.gain.setValueAtTime(0.0001, audioContext.currentTime);
      ambientGain.gain.setTargetAtTime(0.42, audioContext.currentTime, 1.2);
      ambientGain.connect(audioContext.destination);
      [[130.81,'sine',0.035],[196,'sine',0.022],[261.63,'triangle',0.012]].forEach(([freq,type,volume]) => {
        const osc = audioContext.createOscillator(); const gain = audioContext.createGain();
        osc.type = type; osc.frequency.value = freq; gain.gain.value = volume;
        osc.connect(gain); gain.connect(ambientGain); osc.start(); ambientNodes.push(osc, gain);
      });
      const length = Math.floor(audioContext.sampleRate * 3);
      const buffer = audioContext.createBuffer(1, length, audioContext.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * 0.45;
      const wind = audioContext.createBufferSource(); wind.buffer = buffer; wind.loop = true;
      const filter = audioContext.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 520;
      const windGain = audioContext.createGain(); windGain.gain.value = 0.025;
      wind.connect(filter); filter.connect(windGain); windGain.connect(ambientGain); wind.start();
      ambientNodes.push(wind, filter, windGain);
      const sparkleNotes = [523.25, 659.25, 783.99, 880, 987.77, 783.99, 659.25];
      ambientTimer = window.setInterval(() => {
        if (!soundOn || !audioContext || audioContext.state !== 'running') return;
        const osc = audioContext.createOscillator(); const gain = audioContext.createGain();
        osc.type = 'sine'; osc.frequency.value = sparkleNotes[Math.floor(Math.random() * sparkleNotes.length)];
        const now = audioContext.currentTime; gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.012, now + 0.18); gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.25);
        osc.connect(gain); gain.connect(audioContext.destination); osc.start(now); osc.stop(now + 1.3);
      }, 4300);
    } catch (_) {}
  }
  function stopAmbient() {
    if (ambientTimer) clearInterval(ambientTimer); ambientTimer = null;
    if (ambientGain && audioContext) { try { ambientGain.gain.setTargetAtTime(0.0001, audioContext.currentTime, 0.12); } catch (_) {} }
    window.setTimeout(() => {
      ambientNodes.forEach(node => { try { if (node.stop) node.stop(); } catch (_) {} });
      ambientNodes = []; ambientGain = null;
    }, 650);
  }

  function vibrate(pattern=[25]) { if(vibrationOn && 'vibrate' in navigator) navigator.vibrate(pattern); }
  function syncToggles() {
    soundToggle.classList.toggle('active',soundOn);soundToggle.setAttribute('aria-pressed',String(soundOn));soundStatus.textContent=soundOn?'ON':'OFF';
    vibrationToggle.classList.toggle('active',vibrationOn);vibrationToggle.setAttribute('aria-pressed',String(vibrationOn));vibrationStatus.textContent=vibrationOn?'ON':'OFF';
  }
  const levelMessages={easy:['Easy mode selected — a perfect place to begin!','Pick your quest!'],medium:['Medium mode selected — time to stretch your word skills!', 'Ready for a challenge?'],hard:['Hard mode selected — only brave word heroes need apply!','A brave choice!']};
  function selectLevel(level,feedback=true){selectedLevel=level;localStorage.setItem('hangmanLevel',level);document.querySelectorAll('.level-card').forEach(card=>{const active=card.dataset.level===level;card.classList.toggle('selected',active);card.setAttribute('aria-pressed',String(active))});hint.textContent=levelMessages[level][0];speech.innerHTML=`${levelMessages[level][1]} <b>☺</b>`;if(feedback){playTone(level==='easy'?570:level==='medium'?680:790);vibrate([18])}}
  soundToggle.addEventListener('click',()=>{soundOn=!soundOn;localStorage.setItem('hangmanSound',String(soundOn));syncToggles();if(soundOn){startAmbient();playTone(740)}else stopAmbient();vibrate([20])});
  vibrationToggle.addEventListener('click',()=>{vibrationOn=!vibrationOn;localStorage.setItem('hangmanVibration',String(vibrationOn));syncToggles();if(vibrationOn)vibrate([25,25,25]);playTone(500)});
  document.querySelectorAll('.level-card').forEach(card=>card.addEventListener('click',()=>selectLevel(card.dataset.level)));
  continueButton.addEventListener('click',()=>{playTone(820,.13);vibrate([35,20,35]);localStorage.setItem('hangmanLevel',selectedLevel);page.classList.add('party');window.setTimeout(()=>{window.location.href='game.html'},180)});
  document.addEventListener('pointerdown',()=>{if(soundOn)startAmbient()},{once:true});
  syncToggles();selectLevel(selectedLevel,false);if(soundOn)startAmbient();
})();
