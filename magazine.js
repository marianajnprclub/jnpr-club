(() => {
  window.mountPocoyoMagazine = g => {
    g.replaceChildren();g.classList.add('magazine-mode');g.onclick=null;
    const view=document.createElement('div');view.className='book-view';
    const controls=document.createElement('div');controls.className='book-controls';
    controls.innerHTML='<button type="button" aria-label="Previous pages">Previous</button><span aria-live="polite"></span><button type="button" aria-label="Next pages">Next</button>';
    g.append(view,controls);let page=1,busy=false;
    const [prev,next]=controls.querySelectorAll('button'),count=controls.querySelector('span');
    const mobile=()=>matchMedia('(max-width:700px)').matches;
    const single=()=>mobile()||page===1||page===80;
    const image=n=>{const im=new Image();im.src='img/p/pocoyo/book/'+String(n).padStart(2,'0')+'.jpg';im.alt='Pocoyo Early Years — page '+n;return im;};
    function fit(){const ratio=mobile()?.706:1.412;view.style.width=Math.max(100,Math.min(g.clientWidth-40,(g.clientHeight-145)*ratio))+'px';}
    async function draw(direction=0){
      busy=true;prev.disabled=next.disabled=true;
      const old=[...view.querySelectorAll(':scope > img')].map(im=>im.src),n=single()?1:2;
      const pages=Array.from({length:Math.min(n,81-page)},(_,i)=>image(page+i));
      await Promise.all(pages.map(im=>im.decode().catch(()=>{})));
      if(!view.isConnected)return;
      const animate=direction&&old.length&&!matchMedia('(prefers-reduced-motion: reduce)').matches;
      let leaf,stationary;
      if(animate){
        leaf=document.createElement('div');leaf.className='book-leaf'+(direction<0?' reverse':'')+(mobile()?' mobile-leaf':'');
        const front=new Image(),back=new Image();front.src=direction>0?old[old.length-1]:old[0];back.src=direction>0?pages[0].src:pages[pages.length-1].src;front.alt=back.alt='';
        await Promise.all([front.decode(),back.decode()].map(p=>p.catch(()=>{})));
        leaf.append(front,back);
        if(!mobile()&&old.length===2){stationary=new Image();stationary.src=direction>0?old[0]:old[1];stationary.alt='';stationary.className='book-stationary'+(direction<0?' right':'');await stationary.decode().catch(()=>{});}
      }
      if(!view.isConnected)return;
      if(!mobile()&&page===1)pages[0].classList.add('cover-right');
      view.classList.toggle('single',mobile());view.classList.toggle('cover-only',!mobile()&&page===1);fit();
      // All faces are decoded before replacing a single visible node.
      view.replaceChildren(...pages,...(stationary?[stationary]:[]),...(leaf?[leaf]:[]));
      count.textContent=(n===1?String(page):page+'–'+Math.min(page+1,80))+' / 80';
      if(leaf){
        const animation=leaf.animate([{transform:'rotateY(0deg)'},{transform:'rotateY('+(direction>0?-180:180)+'deg)'}],{duration:500,easing:'cubic-bezier(.4,0,.2,1)',fill:'forwards'});
        await animation.finished.catch(()=>{});stationary?.remove();leaf.remove();
      }
      busy=false;prev.disabled=page===1;next.disabled=page+n>80;
      for(let i=page+n;i<Math.min(page+n+2,81);i++)image(i);
    }
    function go(d){if(busy)return;window.clubSound?.play('page');const n=single()?1:2;page=d>0?Math.min(80,page+n):page<=2?1:page-(mobile()?1:2);draw(d);}
    prev.onclick=()=>go(-1);next.onclick=()=>go(1);view.onclick=()=>{if(!next.disabled)go(1);};
    g.onkeydown=e=>{if(!['ArrowLeft','ArrowRight'].includes(e.key))return;e.stopPropagation();e.preventDefault();if(e.key==='ArrowLeft'&&!prev.disabled)go(-1);if(e.key==='ArrowRight'&&!next.disabled)go(1);};
    const observer=new ResizeObserver(()=>{if(!view.isConnected){observer.disconnect();return;}fit();});observer.observe(g);
    return draw();
  };
})();
