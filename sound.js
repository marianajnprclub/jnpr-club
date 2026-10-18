(() => {
  const button=document.getElementById('sound-toggle');let context,master,enabled=false,wanted=true,scratchAt=-Infinity,sleeveAt=-Infinity;
  const buffers={},active=new Set();let decoding;
  function diagnostic() {}
  const files={scratch:'audio/dj-scratch.mp3',fan:'audio/sleeve-shuffle.wav',cassette:'audio/cassette-seat.wav',insertion:'audio/cassette-in.wav'};
  const raw=Object.fromEntries(Object.entries(files).map(([k,url])=>[k,fetch(url).then(r=>{if(!r.ok)throw Error(url);return r.arrayBuffer()}).catch(()=>null)]));
  function nativePlay(key){
    if(!wanted||!files[key])return;
    const media=new Audio(files[key]);media.preload='auto';media.volume=key==='click'?.09:key==='scratch'?.055:.07;
    const duration=key==='fan'?620:key==='page'?520:key==='click'?320:key==='sleeve'||key==='insertion'?350:key==='scratch'?650:key==='stamp'?140:380;
    media.addEventListener('playing',()=>{diagnostic('native-playing',{key});setTimeout(()=>{media.pause();media.removeAttribute('src');media.load();},duration);},{once:true});
    media.play().catch(error=>diagnostic('native-error',{key,error:String(error)}));
  }
  function view(){const audible=wanted&&enabled&&context?.state==='running';button.setAttribute('aria-pressed',String(audible));button.setAttribute('aria-label',audible?'Mute sound effects':'Enable sound effects');button.title=audible?'Mute sound effects':'Enable sound effects';}
  async function start(){const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return false;
    if(!context){context=new Audio();master=context.createGain();master.gain.value=wanted?.14:0;master.connect(context.destination);}
    if(!decoding)decoding=Promise.all(Object.keys(files).map(async k=>{const bytes=await raw[k];if(bytes)try{buffers[k]=await context.decodeAudioData(bytes.slice(0));}catch(error){diagnostic('decode-error',{file:k,error:String(error)});}}));
    const resume=context.resume();
    await decoding;await resume;enabled=context.state==='running';view();diagnostic('started',{sampleRate:context.sampleRate,master:master.gain.value});return enabled;
  }

  function play(kind){
    const key=kind==='fan'||kind==='hero-entry'?'fan':kind==='cassette-in'?'insertion':kind==='cassette'?'cassette':kind==='scratch'?'scratch':null;
    if(!wanted||!key)return;
    if(key==='scratch'){const now=performance.now();if(now-scratchAt<650)return;scratchAt=now;}
    if(!enabled||context?.state!=='running'||!buffers[key]){nativePlay(key);return;}

    if(key==='sleeve'){const now=performance.now();if(now-sleeveAt<350)return;sleeveAt=now;}
    if(key==='insertion'||key==='cassette'){active.forEach(previous=>{if(['insertion','cassette'].includes(previous.effectKey)){try{previous.stop();}catch(_){}}});}
    const source=context.createBufferSource(),gain=context.createGain();source.effectKey=key;source.buffer=buffers[key];gain.gain.value=key==='fan'?.55:key==='insertion'?.35:key==='click'?.65:key==='scratch'?.45:key==='stamp'?.36:key==='sleeve'?.4:.5;source.connect(gain);
    if(key==='stamp'){const filter=context.createBiquadFilter();filter.type='lowpass';filter.frequency.value=650;filter.Q.value=.5;gain.connect(filter);filter.connect(master);gain.gain.setValueAtTime(.36,context.currentTime);gain.gain.exponentialRampToValueAtTime(.001,context.currentTime+.12);}else if(key==='sleeve'){const filter=context.createBiquadFilter();filter.type='lowpass';filter.frequency.value=2200;filter.Q.value=.5;gain.connect(filter);filter.connect(master);gain.gain.setValueAtTime(.001,context.currentTime);gain.gain.linearRampToValueAtTime(.4,context.currentTime+.035);gain.gain.exponentialRampToValueAtTime(.001,context.currentTime+.32);}else gain.connect(master);active.add(source);
    const length=key==='scratch'?Math.min(.65,source.buffer.duration):key==='stamp'?Math.min(.14,source.buffer.duration):source.buffer.duration;source.start(0,key==='sleeve'?.15:0,key==='page'?Math.min(.52,source.buffer.duration):key==='insertion'?source.buffer.duration:key==='sleeve'?Math.min(.34,source.buffer.duration-.15):length);diagnostic('playing',{kind,duration:source.buffer.duration});source.onended=()=>{active.delete(source);source.disconnect();gain.disconnect();};
  }
  button.addEventListener('click',async()=>{
    if(!enabled||context?.state!=='running'){wanted=true;await start();}
    else wanted=!wanted;
    view();if(master)master.gain.setTargetAtTime(wanted?.14:0,context.currentTime,.015);
  });
  document.addEventListener('visibilitychange',()=>{if(!context)return;if(document.hidden)context.suspend().catch(()=>{});else if(enabled)context.resume().catch(()=>{});});
  document.querySelectorAll('.st,.smart-asterisk').forEach(el=>{
    el.removeAttribute('aria-hidden');el.setAttribute('role','button');el.tabIndex=0;el.setAttribute('aria-label','Scratch the record');
    el.addEventListener('pointerenter',e=>{if(e.pointerType!=='touch')play('scratch');});
    el.addEventListener('click',()=>play('scratch'));
    el.addEventListener('keydown',e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();play('scratch');}});
  });
  window.clubSound={start,play,status:()=>({enabled,wanted,state:context?.state||'locked',loaded:Object.keys(buffers)})};view();
})();
