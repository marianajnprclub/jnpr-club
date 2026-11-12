(() => {
  window.clubStarted=false;
  // A tap, scroll or key ends the intro at once.
  let skipped=false;const skip=new Promise(resolve=>{const go=()=>{skipped=true;resolve();};['pointerdown','touchmove','wheel','keydown'].forEach(t=>addEventListener(t,go,{once:true,passive:true}));});
  addEventListener('DOMContentLoaded',async()=>{
    const home=!location.hash||location.hash==='#top';if(home)window.scrollTo({top:0,behavior:'instant'});
    const root=document.documentElement,intro=document.getElementById('brand-intro'),mark=intro?.querySelector('.intro-brand'),cover=intro?.querySelector('.intro-cover');
    try{
      const urls=['img/jnpr-wordmark.svg','tex/pocoyo.webp','img/col/pocoyo.webp','img/ast/chrome.webp','img/walkman.webp','img/cassette.webp'];
      // Tope de 0,5 s: la intro nunca espera a la red; lo que falte aparece al cargar.
      await Promise.race([Promise.all([document.fonts.ready,...urls.map(src=>{const im=new Image();im.src=src;return im.decode().catch(()=>{});})]),new Promise(resolve=>setTimeout(resolve,500)),skip]);
      await Promise.race([new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))),new Promise(resolve=>setTimeout(resolve,120)),skip]);
      const word=document.querySelector('.rb .w');if(word){const width=word.scrollWidth+'px';word.style.setProperty('--rebel-width',width);word.closest('h1').style.setProperty('--rebel-width',width);}
      const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches||new URLSearchParams(location.search).has('still');
      if(mark&&!reduced&&home&&!skipped){
        window.scrollTo({top:0,behavior:'instant'});
        const from=mark.getBoundingClientRect(),to=document.querySelector('.sleeve header .logo').getBoundingClientRect();
        Object.assign(mark.style,{left:from.left+'px',top:from.top+'px',width:from.width+'px',height:from.height+'px',transform:'none',transformOrigin:'0 0'});
        const coverTarget=matchMedia('(max-width:1100px)').matches?0:innerWidth*.4;
        const coverMove=cover?.animate([{transform:'translateX(0)'},{transform:`translateX(${-coverTarget}px)`}],{duration:480,easing:'cubic-bezier(.65,0,.25,1)',fill:'forwards'});
        const textureMove=cover?.animate([{backgroundPosition:'0px 0px'},{backgroundPosition:coverTarget+'px 0px'}],{pseudoElement:'::before',duration:480,easing:'cubic-bezier(.65,0,.25,1)',fill:'forwards'});
        const move=mark.animate([
          {transform:'translate(0,0) scale(1)',backgroundColor:'#FCFCFC'},
          {transform:`translate(${to.left-from.left}px,${to.top-from.top+(to.height-from.height*(to.width/from.width))/2}px) scale(${to.width/from.width})`,backgroundColor:'#FCFCFC'} /* 12/11: same scale both ways, the logo never stretches */
        ],{duration:480,easing:'cubic-bezier(.65,0,.25,1)',fill:'forwards'});
        await Promise.race([Promise.all([move.finished.catch(()=>{}),coverMove?.finished.catch(()=>{}),textureMove?.finished.catch(()=>{})]),skip,new Promise(resolve=>setTimeout(resolve,900))]);
      }
    }finally{
      // Finish the surface/logo travel, then start all home animations on one frame.
      root.classList.remove('brand-intro-active');root.classList.add('club-started');window.clubStarted=true;window.clubState?.set('entry','started');
      intro?.remove();
      dispatchEvent(new Event('club:entered'));

    }
  },{once:true});
  async function unlock(e){if(e.target.closest?.('#sound-toggle'))return;const ready=await window.clubSound?.start().catch(()=>false);if(ready){removeEventListener('pointerdown',unlock);removeEventListener('keydown',unlock);}}
  addEventListener('pointerdown',unlock);addEventListener('keydown',unlock);
})();
