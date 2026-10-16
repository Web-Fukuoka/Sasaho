/* 篠栗保育園 共通スクリプト
   各機能は、その要素があるページでだけ動きます。 */
(function(){
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const $=s=>document.querySelector(s), $$=s=>Array.from(document.querySelectorAll(s));

/* ---------- えほん（保育の一日） ---------- */
(function(){
  const book=$('#book');if(!book)return;
  try{
    const pages=$$('#pages .page'),dots=$('#dots'),prev=$('#pgPrev'),next=$('#pgNext'),tocB=$$('#toc button');
    let cur=0;
    book.classList.add('flip');
    pages.forEach((p,i)=>{p.style.zIndex=pages.length-i;dots.appendChild(document.createElement('i'))});
    const go=n=>{
      cur=Math.max(0,Math.min(pages.length-1,n));
      pages.forEach((p,i)=>{p.classList.toggle('turned',i<cur);p.setAttribute('aria-hidden',i!==cur)});
      Array.from(dots.children).forEach((d,i)=>d.classList.toggle('on',i===cur));
      tocB.forEach((b,i)=>{if(i===cur)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current')});
      prev.disabled=cur===0;next.disabled=cur===pages.length-1;
    };
    prev.onclick=()=>go(cur-1);next.onclick=()=>go(cur+1);
    tocB.forEach((b,i)=>b.onclick=()=>go(i));
    const pg=$('#pages');
    pg.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){go(cur+1);e.preventDefault()}if(e.key==='ArrowLeft'){go(cur-1);e.preventDefault()}});
    let sx=null,sy=null;
    pg.addEventListener('pointerdown',e=>{sx=e.clientX;sy=e.clientY});
    pg.addEventListener('pointerup',e=>{if(sx===null)return;const dx=e.clientX-sx,dy=e.clientY-sy;if(Math.abs(dx)>40&&Math.abs(dx)>Math.abs(dy)){go(cur+(dx<0?1:-1))}sx=null});
    pg.addEventListener('pointercancel',()=>sx=null);
    go(0);
  }catch(e){book.classList.remove('flip')}
})();

/* ---------- スクロールで表示 ---------- */
if('IntersectionObserver' in window){
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{rootMargin:'0px 0px -10% 0px',threshold:.12});
  $$('.rv,.walk-photo,.sec-head').forEach(el=>io.observe(el));
}else{$$('.rv,.walk-photo,.sec-head').forEach(el=>el.classList.add('in'))}

/* ---------- ヘッダー・下部ボタン・トップへ ---------- */
const bar=$('#topbar'),cta=$('#ctaBar'),top=$('#toTop');
let lastY=scrollY,ticking=false;
function onScroll(){
  const y=scrollY;
  bar.classList.toggle('shrink',y>40);
  if(!document.body.classList.contains('menu-open')){
    if(y>lastY+4&&y>240)bar.classList.add('hide');
    else if(y<lastY-4||y<240)bar.classList.remove('hide');
  }
  cta&&cta.classList.toggle('show',y>(document.body.dataset.page==='home'?520:240));
  if(top&&!top.classList.contains('fly'))top.classList.toggle('show',y>700);
  if(!reduce&&innerWidth>820&&y<innerHeight*1.2){$$('.hills [data-speed]').forEach(s=>s.style.transform='translate3d(0,'+(y*parseFloat(s.dataset.speed)).toFixed(1)+'px,0)')}
  lastY=y;ticking=false;
}
addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(onScroll);ticking=true}},{passive:true});
onScroll();

/* ---------- スマホメニュー ---------- */
const mBtn=$('#menuBtn'),ov=$('#ov'),ovClose=$('#ovClose');
function setMenu(open){
  document.body.classList.toggle('menu-open',open);
  mBtn.setAttribute('aria-expanded',open);
  mBtn.querySelector('.sr').textContent=open?'メニューを閉じる':'メニューを開く';
  ov.setAttribute('aria-hidden',!open);
  document.documentElement.style.overflow=open?'hidden':'';
  bar.classList.remove('hide');
  if(location.hash==='#menu'){try{history.replaceState(null,'',location.pathname+location.search)}catch(e){}}
  if(open)setTimeout(()=>ovClose.focus(),reduce?0:350);else mBtn.focus();
}
if(mBtn&&ov){
  mBtn.addEventListener('click',e=>{e.preventDefault();setMenu(true)});
  ovClose.addEventListener('click',e=>{e.preventDefault();setMenu(false)});
  ov.querySelectorAll('nav a,.ov-cta a').forEach(a=>a.addEventListener('click',()=>{const h=a.getAttribute('href');if(h.startsWith('#'))setMenu(false)}));
  document.addEventListener('keydown',e=>{
    if(!document.body.classList.contains('menu-open'))return;
    if(e.key==='Escape'){setMenu(false);return}
    if(e.key==='Tab'){
      const f=[...ov.querySelectorAll('a')];const i=f.indexOf(document.activeElement);
      if(e.shiftKey&&i<=0){e.preventDefault();f[f.length-1].focus()}
      else if(!e.shiftKey&&i===f.length-1){e.preventDefault();f[0].focus()}
    }
  });
  addEventListener('resize',()=>{if(innerWidth>=1080&&document.body.classList.contains('menu-open'))setMenu(false)});
  /* 別ページから #menu で戻ってきたとき */
  addEventListener('pageshow',()=>{if(document.body.classList.contains('menu-open'))setMenu(false)});
}

/* ---------- ギャラリー ---------- */
const gal=$('#gal');
if(gal){
  const galNo=$('#galNo'),galBar=$('#galBar');
  const shown=Array.from(gal.querySelectorAll('img'));
  if(galNo)gal.addEventListener('scroll',()=>{
    const items=gal.children;const w=items[0].getBoundingClientRect().width+14;
    const i=Math.min(items.length-1,Math.round(gal.scrollLeft/w));
    galNo.textContent=(i+1)+' / '+items.length;galBar.style.transform='scaleX('+((i+1)/items.length)+')';
  },{passive:true});
  const lb=$('#lb'),lbImg=$('#lbImg');let li=0,prevFocus=null;
  if(lb){
    const show=i=>{li=(i+shown.length)%shown.length;lbImg.src=shown[li].src;lbImg.alt=shown[li].alt};
    const openLb=i=>{prevFocus=document.activeElement;show(i);lb.classList.add('open');lb.setAttribute('aria-hidden','false');document.documentElement.style.overflow='hidden';lb.querySelector('.x').focus()};
    const closeLb=()=>{lb.classList.remove('open');lb.setAttribute('aria-hidden','true');document.documentElement.style.overflow='';prevFocus&&prevFocus.focus()};
    gal.querySelectorAll('button').forEach((b,i)=>b.onclick=()=>openLb(i));
    lb.querySelector('.x').onclick=closeLb;
    lb.querySelector('.pv').onclick=()=>show(li-1);
    lb.querySelector('.nx').onclick=()=>show(li+1);
    lb.onclick=e=>{if(e.target===lb)closeLb()};
    lb.addEventListener('keydown',e=>{if(e.key==='Escape')closeLb();if(e.key==='ArrowLeft')show(li-1);if(e.key==='ArrowRight')show(li+1);if(e.key==='Tab'){const b=Array.from(lb.querySelectorAll('button'));if(e.shiftKey&&document.activeElement===b[0]){e.preventDefault();b[b.length-1].focus()}else if(!e.shiftKey&&document.activeElement===b[b.length-1]){e.preventDefault();b[0].focus()}}});
  }
}

/* ---------- ちょうちょで上へ ---------- */
if(top)top.addEventListener('click',()=>{
  if(reduce){scrollTo(0,0);return}
  top.classList.add('fly');
  scrollTo({top:0,behavior:'smooth'});
  setTimeout(()=>{top.classList.remove('fly','show')},1100);
});
})();

/* ---------- 改行の調整：文末の「ます。」などが1行だけ取り残されないように、
   最後の数文字を前の文字とつなげる ---------- */
(function(){
  const sel='main p, main li, main dd, main td, main summary, main h3, .steps span, .entry span, .news span, .fact small, .card p';
  document.querySelectorAll(sel).forEach(el=>{
    if(el.querySelector('p,li,ul,ol,div,table,svg'))return;
    let t=el.lastChild;
    while(t&&t.nodeType===1&&!t.matches('svg')&&t.lastChild)t=t.lastChild;
    if(!t||t.nodeType!==3)return;
    const s=t.textContent.replace(/\s+$/,'');
    if(s.length<10||el.textContent.trim().length<16)return;
    const n=/[。、！？）」]$/.test(s)?5:4;
    const span=document.createElement('span');span.className='nw';
    span.textContent=s.slice(-n);
    t.textContent=s.slice(0,-n);
    t.after(span);
  });
})();
