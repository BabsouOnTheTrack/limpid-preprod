/* LIMPID EXPERIENCE V2 — non métier, progressive enhancement only.
   Does not submit forms, set prices, intercept navigation, mutate analytics or rewrite configurators. */
(() => {
  'use strict';
  const body = document.body;
  if (!body || !body.classList.contains('lx')) return;
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Reading indicator only on editorial pages (never over configurator progress UX).
  if (body.classList.contains('lx--editorial') || body.classList.contains('lx--references') || body.classList.contains('lx--legal')) {
    const progress = document.createElement('div');
    progress.className = 'lx-page-progress';
    progress.setAttribute('aria-hidden', 'true');
    body.appendChild(progress);
    let queued = false;
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = `${max > 0 ? Math.min(100, Math.max(0, window.scrollY / max * 100)) : 100}%`;
      queued = false;
    };
    const schedule = () => {if(!queued){queued=true;window.requestAnimationFrame(update);}};
    window.addEventListener('scroll',schedule,{passive:true});
    window.addEventListener('resize',schedule,{passive:true});
    update();
  }

  // Hero illumination responds subtly to pointer, without blocking click targets.
  if (!reduced && window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
    document.querySelectorAll('.hero,.pc-accueil').forEach(hero => {
      hero.addEventListener('pointermove', e => {
        const rect = hero.getBoundingClientRect();
        hero.style.setProperty('--lx-pointer-x',`${Math.round((e.clientX-rect.left)/rect.width*100)}%`);
        hero.style.setProperty('--lx-pointer-y',`${Math.round((e.clientY-rect.top)/rect.height*100)}%`);
      },{passive:true});
    });
  }

  // Animate only marketing surfaces; exclude any step forms and workflow controls.
  if (!reduced && 'IntersectionObserver' in window) {
    const nodes = [...document.querySelectorAll('.lx-discover-card,.lx-proof-inner,.carte-guide')].slice(0,35);
    const io = new IntersectionObserver((entries,obs) => {
      entries.forEach(entry=> {if(entry.isIntersecting){entry.target.classList.add('lx-is-visible');obs.unobserve(entry.target);}});
    },{rootMargin:'0px 0px 90px 0px',threshold:0.03});
    nodes.forEach(n=>{n.classList.add('lx-reveal','lx-enter');io.observe(n)});
  }

  // Purely visual image comparison: original assets, existing photos and metadata untouched.
  document.querySelectorAll('.lx-beforeafter input[type=range]').forEach(range => {
    const root = range.closest('.lx-beforeafter');
    if(!root) return;
    const set = () => root.style.setProperty('--lx-compare',`${range.value}%`);
    range.addEventListener('input',set);
    set();
  });
})();
