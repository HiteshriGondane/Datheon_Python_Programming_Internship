(() => {
 const $=id=>document.getElementById(id), stars=$('stars');
 for(let i=0;i<58;i++){const s=document.createElement('span');s.style.left=Math.random()*100+'%';s.style.top=Math.random()*100+'%';s.style.animationDelay=Math.random()*4+'s';s.style.animationDuration=2+Math.random()*4+'s';stars.appendChild(s)}
 let soundOn=localStorage.getItem('hangmanSound')!=='false', vibrationOn=localStorage.getItem('hangmanVibration')!=='false';
 let ctx, ambientGain, ambientTimer, ambientNodes=[], wordData, guessed=new Set(), mistakes=0, finished=false, hintUsed=false, praiseTimer, inputLocked=false, timerInterval=null, roundStartedAt=0, finalElapsedMs=0;
 const pools={
  easy:[
   {word:'TREE',category:'NATURE',clue:'A tall plant with branches and leaves.',hint:'Birds often build nests in it.'},
   {word:'MOON',category:'SPACE',clue:'A bright object that appears in the night sky.',hint:'It orbits our planet.'},
   {word:'STAR',category:'SPACE',clue:'A tiny sparkling light seen in the night sky.',hint:'Our Sun is one of these.'},
   {word:'FROG',category:'ANIMALS',clue:'A small animal that jumps and says ribbit.',hint:'It can live both on land and in water.'},
   {word:'BOOK',category:'MAGIC LIBRARY',clue:'Something you read, filled with pages.',hint:'A library has many of these.'},
   {word:'FISH',category:'UNDERWATER',clue:'An animal that swims and breathes underwater.',hint:'It has fins and gills.'},
   {word:'WIND',category:'WEATHER',clue:'Moving air that you can feel.',hint:'It can make leaves dance.'},
   {word:'CLOUD',category:'SKY',clue:'A fluffy shape floating in the sky.',hint:'It may bring rain.'}
  ],
  medium:[
   {word:'PLANET',category:'SPACE',clue:'A large round world that travels around a star.',hint:'Earth is one of these.'},
   {word:'JUNGLE',category:'NATURE',clue:'A thick tropical forest full of wildlife.',hint:'Vines, trees and wild animals live here.'},
   {word:'CASTLE',category:'FANTASY',clue:'A grand building where kings and queens may live.',hint:'It may have towers and a drawbridge.'},
   {word:'PIRATE',category:'ADVENTURE',clue:'A sea adventurer who searches for treasure.',hint:'Often shown with a ship and an eye patch.'},
   {word:'ROCKET',category:'SPACE',clue:'A vehicle that launches beyond Earth.',hint:'Astronauts may travel in one.'},
   {word:'ISLAND',category:'FANTASY ISLAND',clue:'Land surrounded completely by water.',hint:'Your adventure world is one.'},
   {word:'DRAGON',category:'FANTASY',clue:'A legendary creature that may breathe fire.',hint:'It often has wings and scales.'}
  ],
  hard:[
   {word:'BUTTERFLY',category:'NATURE',clue:'A colourful insect that begins life as a caterpillar.',hint:'It has patterned wings and visits flowers.'},
   {word:'ADVENTURE',category:'EXPLORER',clue:'An exciting journey into the unknown.',hint:'Your Hangman Worlds journey is one.'},
   {word:'GALAXIES',category:'SPACE',clue:'Huge collections of stars, gas and dust in space.',hint:'The Milky Way is one of these.'},
   {word:'TREASURE',category:'PIRATE QUEST',clue:'A valuable collection of gold, gems or special objects.',hint:'Pirates often hide it in a chest.'},
   {word:'WATERFALL',category:'NATURE',clue:'A stream of water dropping over a steep edge.',hint:'You might find one in a jungle.'},
   {word:'UNIVERSE',category:'SPACE',clue:'Everything that exists, including space and stars.',hint:'It is bigger than any single galaxy.'},
   {word:'RAINBOWS',category:'WEATHER',clue:'Colourful arcs that can appear after rain.',hint:'They have red, orange, yellow, green, blue and more.'}
  ]
 };
 function ensureAudio(){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return false;ctx ||=new AC();if(ctx.state==='suspended')ctx.resume();return true}
 function tone(freq=620,duration=.09,volume=.045,type='sine'){if(!soundOn||!ensureAudio())return;try{const o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(.0001,ctx.currentTime);g.gain.exponentialRampToValueAtTime(volume,ctx.currentTime+.018);g.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+duration);o.connect(g);g.connect(ctx.destination);o.start();o.stop(ctx.currentTime+duration+.03)}catch(e){}}
 function startAmbient(){
   if(!soundOn||!ensureAudio()||ambientTimer)return;
   try{
     // A quiet fantasy soundtrack: warm magical chords, soft wind, and sparkles.
     ambientGain=ctx.createGain();ambientGain.gain.setValueAtTime(.0001,ctx.currentTime);ambientGain.gain.setTargetAtTime(.42,ctx.currentTime,1.2);ambientGain.connect(ctx.destination);
     [[130.81,'sine',.035],[196,'sine',.022],[261.63,'triangle',.012]].forEach(([f,t,v])=>{const o=ctx.createOscillator(),g=ctx.createGain();o.type=t;o.frequency.value=f;g.gain.value=v;o.connect(g);g.connect(ambientGain);o.start();ambientNodes.push(o,g)});
     const length=Math.floor(ctx.sampleRate*3),buffer=ctx.createBuffer(1,length,ctx.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<length;i++)data[i]=(Math.random()*2-1)*.45;
     const wind=ctx.createBufferSource();wind.buffer=buffer;wind.loop=true;const filter=ctx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=520;const wg=ctx.createGain();wg.gain.value=.025;
     wind.connect(filter);filter.connect(wg);wg.connect(ambientGain);wind.start();ambientNodes.push(wind,filter,wg);
     const notes=[523.25,659.25,783.99,880,987.77,783.99,659.25];
     ambientTimer=setInterval(()=>{if(!soundOn||!ctx||ctx.state!=='running')return;const o=ctx.createOscillator(),g=ctx.createGain(),now=ctx.currentTime;o.type='sine';o.frequency.value=notes[Math.floor(Math.random()*notes.length)];g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(.012,now+.18);g.gain.exponentialRampToValueAtTime(.0001,now+1.25);o.connect(g);g.connect(ctx.destination);o.start(now);o.stop(now+1.3)},4300);
   }catch(e){}
 }
 function stopAmbient(){
   if(ambientTimer)clearInterval(ambientTimer);ambientTimer=null;if(ambientGain&&ctx)try{ambientGain.gain.setTargetAtTime(.0001,ctx.currentTime,.12)}catch(e){}
   setTimeout(()=>{ambientNodes.forEach(n=>{try{if(n.stop)n.stop()}catch(e){}});ambientNodes=[];ambientGain=null},650);
 }

 function vibrate(p=[25]){if(vibrationOn&&navigator.vibrate)navigator.vibrate(p)}
 function sync(){ $('soundToggle').classList.toggle('active',soundOn);$('soundToggle').setAttribute('aria-pressed',String(soundOn));$('soundStatus').textContent=soundOn?'ON':'OFF';$('vibrationToggle').classList.toggle('active',vibrationOn);$('vibrationToggle').setAttribute('aria-pressed',String(vibrationOn));$('vibrationStatus').textContent=vibrationOn?'ON':'OFF'}
 $('soundToggle').addEventListener('click',()=>{soundOn=!soundOn;localStorage.setItem('hangmanSound',String(soundOn));sync();if(soundOn){startAmbient();tone(740)}else stopAmbient();vibrate([20])});
 $('vibrationToggle').addEventListener('click',()=>{vibrationOn=!vibrationOn;localStorage.setItem('hangmanVibration',String(vibrationOn));sync();if(vibrationOn)vibrate([25,20,25]);tone(500)});
 document.addEventListener('pointerdown',()=>{if(soundOn)startAmbient()},{once:true});
 function formatTime(ms){const total=Math.floor(Math.max(0,ms)/1000),m=Math.floor(total/60),sec=total%60;return String(m).padStart(2,'0')+':'+String(sec).padStart(2,'0')}
 function elapsedMs(){return finalElapsedMs || (roundStartedAt ? Date.now()-roundStartedAt : 0)}
 function paintTimer(){$('timerText').textContent=formatTime(elapsedMs())}
 function startTimer(){if(!roundStartedAt){roundStartedAt=Date.now();if(!timerInterval)timerInterval=setInterval(paintTimer,250);paintTimer()}}
 function newRound(){if(timerInterval){clearInterval(timerInterval);timerInterval=null}const level=localStorage.getItem('hangmanLevel')||'easy';const list=pools[level]||pools.easy;wordData=list[Math.floor(Math.random()*list.length)];guessed=new Set();mistakes=0;finished=false;hintUsed=false;inputLocked=false;roundStartedAt=0;finalElapsedMs=0;$('levelBadge').textContent=level.toUpperCase()+' QUEST';$('categoryBadge').textContent=wordData.category;$('clueText').textContent=wordData.clue;$('gameMessage').textContent='Choose your first letter, word explorer!';$('gameMessage').className='game-message';$('hintButton').hidden=false;$('nextButton').hidden=true;document.querySelectorAll('.draw-part').forEach(p=>p.classList.remove('visible'));renderSlots();renderKeyboard();renderStatus();paintTimer()}
 function praise(){const words=['AMAZING 🎊','GOOD 🎊','FABULOUS 🎊','PERFECT 🎊'];const overlay=$('praiseOverlay');$('praiseText').textContent=words[Math.floor(Math.random()*words.length)];overlay.classList.remove('show');void overlay.offsetWidth;overlay.classList.add('show');clearTimeout(praiseTimer);praiseTimer=setTimeout(()=>overlay.classList.remove('show'),3000)}
 function renderSlots(){const box=$('wordSlots');box.innerHTML='';[...wordData.word].forEach(ch=>{const el=document.createElement('span');if(ch===' '){el.className='word-slot space'}else{const revealed=guessed.has(ch)||finished;el.className='word-slot'+(revealed?' revealed':'');el.textContent=revealed?ch:'';if(revealed)el.setAttribute('aria-label','Letter '+ch)}box.appendChild(el)})}
 function renderKeyboard(){const box=$('keyboard');box.innerHTML='';'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(ch=>{const b=document.createElement('button');b.type='button';b.className='letter-key';b.textContent=ch;b.disabled=guessed.has(ch)||finished||inputLocked;if(guessed.has(ch))b.classList.add(wordData.word.includes(ch)?'correct':'wrong');b.addEventListener('click',()=>guess(ch));box.appendChild(b)})}
 function renderStatus(){$('mistakesText').textContent=`Mistakes: ${mistakes} / 6`;$('livesText').textContent=Array.from({length:6},(_,i)=>i<mistakes?'♡':'♥').join(' ');document.querySelectorAll('.draw-part').forEach(p=>p.classList.toggle('visible',Number(p.dataset.step)<=mistakes))}
 function guess(ch){if(finished||inputLocked||guessed.has(ch))return;startTimer();guessed.add(ch);const correct=wordData.word.includes(ch);if(correct){inputLocked=true;tone(680,.12,.045);vibrate([16]);$('gameMessage').textContent='Nice guess! That letter is in the word.';$('gameMessage').className='game-message good';praise()}else{mistakes++;tone(190,.16,.04,'triangle');vibrate([35]);$('gameMessage').textContent='Not this time — try another letter!';$('gameMessage').className='game-message bad'}renderSlots();renderKeyboard();renderStatus();const solved=[...wordData.word].every(ch=>ch===' '||guessed.has(ch));if(solved){setTimeout(()=>endRound(true),correct?3000:0)}else if(mistakes>=6){endRound(false)}else if(correct){clearTimeout(praiseTimer);praiseTimer=setTimeout(()=>{ $('praiseOverlay').classList.remove('show');inputLocked=false;renderKeyboard(); },3000)}}
 function endRound(won){
  if(finished)return;finished=true;inputLocked=true;finalElapsedMs=roundStartedAt?Date.now()-roundStartedAt:0;if(timerInterval){clearInterval(timerInterval);timerInterval=null}const durationMs=elapsedMs();const durationText=formatTime(durationMs);renderSlots();renderKeyboard();$('hintButton').hidden=true;paintTimer();
  let stats=JSON.parse(localStorage.getItem('hangmanStats')||'{"games":0,"wins":0,"losses":0}');stats.games=(stats.games||0)+1;won?stats.wins++:stats.losses++;stats.lastResult=won?'win':'loss';stats.lastWord=wordData.word;stats.lastLevel=localStorage.getItem('hangmanLevel')||'easy';localStorage.setItem('hangmanStats',JSON.stringify(stats));
  localStorage.setItem('hangmanLastResult',JSON.stringify({won,word:wordData.word,category:wordData.category,level:localStorage.getItem('hangmanLevel')||'easy',durationMs,durationText}));
  $('gameMessage').textContent=won?'Word discovered! 🎊':'The mystery word was '+wordData.word+'.';$('gameMessage').className='game-message '+(won?'good':'bad');
  tone(won?784:190,.3,.05);if(won)setTimeout(()=>tone(988,.35,.04),150);
  setTimeout(()=>{window.location.href='results.html'},won?900:850);
 }
 $('hintButton').addEventListener('click',()=>{if(hintUsed||finished)return;hintUsed=true;$('clueText').textContent=wordData.hint;$('gameMessage').textContent='Here is another little clue. You can do it!';$('hintButton').textContent='✓';$('hintButton').setAttribute('aria-label','Hint used');$('hintButton').title='Hint used';$('hintButton').disabled=true;tone(740,.15,.035);});
 $('nextButton').addEventListener('click',()=>{newRound();$('hintButton').disabled=false;$('hintButton').textContent='💡';$('hintButton').setAttribute('aria-label','Show hint');$('hintButton').title='Show hint';tone(740,.1,.04)});
 sync();newRound();if(soundOn)startAmbient();
})();
