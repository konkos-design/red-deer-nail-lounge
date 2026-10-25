(function(){
  var d=document, root=d.documentElement, body=d.body;
  root.classList.remove('no-js');
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* header state */
  var header=d.querySelector('.site-header');
  function onScroll(){ if(header) header.classList.toggle('is-scrolled', window.scrollY>12); }
  onScroll(); window.addEventListener('scroll', onScroll, {passive:true});

  /* mobile menu */
  var mbtn=d.querySelector('.menu-btn'), mm=d.getElementById('mobile-menu');
  function setMenu(open){
    body.classList.toggle('menu-open', open);
    if(mbtn){ mbtn.setAttribute('aria-expanded', open?'true':'false'); mbtn.setAttribute('aria-label', open?'Close menu':'Open menu'); }
    if(mm){ mm.setAttribute('aria-hidden', open?'false':'true'); if(open){ mm.removeAttribute('inert'); } else { mm.setAttribute('inert',''); } }
  }
  if(mbtn){ mbtn.addEventListener('click', function(){ setMenu(!body.classList.contains('menu-open')); }); }
  if(mm){ mm.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', function(){ setMenu(false); }); }); }
  d.addEventListener('keydown', function(e){ if(e.key==='Escape' && body.classList.contains('menu-open')) setMenu(false); });
  window.addEventListener('resize', function(){ if(window.innerWidth>960 && body.classList.contains('menu-open')) setMenu(false); });

  /* reveal + frame drawing */
  var io=null;
  var targets=d.querySelectorAll('.reveal, .photo');
  if('IntersectionObserver' in window && !reduce){
    io=new IntersectionObserver(function(entries){
      entries.forEach(function(en){ if(en.isIntersecting){ en.target.classList.add('is-in'); io.unobserve(en.target); } });
    },{rootMargin:'0px 0px -8% 0px', threshold:.12});
    targets.forEach(function(t){ io.observe(t); });
  } else { targets.forEach(function(t){ t.classList.add('is-in'); }); }
  /* safety: anything still hidden after load becomes visible when scrolled past */
  window.addEventListener('load', function(){
    setTimeout(function(){
      d.querySelectorAll('.reveal:not(.is-in), .photo:not(.is-in)').forEach(function(el){
        var r=el.getBoundingClientRect(); if(r.bottom<0) el.classList.add('is-in');
      });
    }, 600);
  });

  /* today in hours table */
  var day=new Date().getDay();
  d.querySelectorAll('.hours tr[data-day="'+day+'"]').forEach(function(tr){ tr.classList.add('today'); });

  /* draggable strip */
  d.querySelectorAll('[data-strip]').forEach(function(wrap){
    var s=wrap.querySelector('.strip'); if(!s) return;
    var prev=wrap.querySelector('[data-prev]'), next=wrap.querySelector('[data-next]'), bar=wrap.querySelector('.strip-progress span');
    var down=false, moved=0, sx=0, sl=0;
    s.addEventListener('pointerdown', function(e){ if(e.pointerType!=='mouse') return; down=true; moved=0; sx=e.clientX; sl=s.scrollLeft; });
    window.addEventListener('pointermove', function(e){ if(!down) return; var dx=e.clientX-sx; if(Math.abs(dx)>4){ moved=dx; s.classList.add('is-drag'); } s.scrollLeft=sl-dx; });
    window.addEventListener('pointerup', function(){ if(!down) return; down=false; setTimeout(function(){ s.classList.remove('is-drag'); },0); });
    s.addEventListener('dragstart', function(e){ e.preventDefault(); });
    function step(){ var c=s.querySelector('.card'); return c ? c.getBoundingClientRect().width+18 : 300; }
    if(prev) prev.addEventListener('click', function(){ s.scrollBy({left:-step(), behavior:reduce?'auto':'smooth'}); });
    if(next) next.addEventListener('click', function(){ s.scrollBy({left:step(), behavior:reduce?'auto':'smooth'}); });
    function upd(){
      var max=s.scrollWidth-s.clientWidth; var p=max>0 ? s.scrollLeft/max : 0;
      if(bar){ var w=Math.max(.18, s.clientWidth/s.scrollWidth); bar.style.width=(w*100)+'%'; bar.style.transform='translateX('+(p*(1/w-1)*100)+'%)'; }
      if(prev) prev.disabled = s.scrollLeft<4; if(next) next.disabled = s.scrollLeft>max-4;
    }
    s.addEventListener('scroll', upd, {passive:true}); window.addEventListener('resize', upd); upd();
  });

  /* review filter */
  var fbar=d.querySelector('.rv-filter');
  if(fbar){
    fbar.addEventListener('click', function(e){
      var b=e.target.closest('button'); if(!b) return;
      fbar.querySelectorAll('button').forEach(function(x){ x.setAttribute('aria-pressed', x===b?'true':'false'); });
      var f=b.getAttribute('data-f');
      d.querySelectorAll('.rv[data-tags]').forEach(function(rv){
        var on = f==='all' || rv.getAttribute('data-tags').split(' ').indexOf(f)>-1;
        rv.classList.toggle('is-hidden', !on); if(on) rv.classList.add('is-in');
      });
    });
  }

  /* year */
  d.querySelectorAll('[data-year]').forEach(function(el){ el.textContent=new Date().getFullYear(); });

  /* GSAP moments (level 2) */
  if(window.gsap && window.ScrollTrigger && !reduce){
    gsap.registerPlugin(ScrollTrigger);
    var mm2=gsap.matchMedia();
    var heroLines=d.querySelectorAll('.hero h1 .ln > span');
    if(heroLines.length){
      var tl=gsap.timeline({defaults:{ease:'power3.out'}});
      tl.from(heroLines,{yPercent:110,duration:1.05,stagger:.1})
        .from('.hero .lead, .hero-actions, .hero-meta',{y:22,opacity:0,duration:.9,stagger:.08},'-=.65')
        .from('.hero-media .slats',{scaleY:0,transformOrigin:'50% 100%',duration:1.1,ease:'power4.out'},0.05)
        .from('.hero-media .photo',{clipPath:'inset(8% 8% 8% 8% round 14px)',scale:1.04,duration:1.3,ease:'power4.out'},0.1)
        .from('.hero-badge',{scale:.6,opacity:0,duration:.8,ease:'back.out(1.6)'},'-=.6');
    }
    mm2.add('(min-width: 961px)', function(){
      gsap.utils.toArray('[data-parallax]').forEach(function(el){
        gsap.fromTo(el,{yPercent:-5},{yPercent:5,ease:'none',scrollTrigger:{trigger:el.closest('.photo')||el,start:'top bottom',end:'bottom top',scrub:true}});
      });
      gsap.utils.toArray('.slat-col').forEach(function(el){
        gsap.fromTo(el,{y:60},{y:-60,ease:'none',scrollTrigger:{trigger:el.parentElement,start:'top bottom',end:'bottom top',scrub:true}});
      });
    });
  }
})();
