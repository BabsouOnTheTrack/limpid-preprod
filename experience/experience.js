(()=>{
  'use strict';
  const q=(sel,root=document)=>root.querySelector(sel);
  const qa=(sel,root=document)=>Array.from(root.querySelectorAll(sel));
  const services={
    pro:[
      {icon:'▦',title:'Bureaux & cabinets',desc:'Un entretien pensé autour de vos horaires et de vos espaces de travail.',href:'./configurer-devis-locaux-professionnels/index.html',cta:'Configurer mes locaux'},
      {icon:'◫',title:'Commerces & vitrines',desc:'Des surfaces vitrées soignées qui valorisent votre établissement.',href:'./configurer-devis-vitres/index.html',cta:'Décrire mes vitrages'},
      {icon:'⌘',title:'Copropriétés & espaces communs',desc:'La régularité et la clarté attendues par les occupants et les syndics.',href:'./configurer-devis-locaux-professionnels/index.html',cta:'Étudier mon besoin'}
    ],
    home:[
      {icon:'⌂',title:'Ménage à domicile',desc:'Un intérieur entretenu avec soin, selon la fréquence qui vous convient.',href:'./configurer-devis-menage/index.html',cta:'Configurer mon ménage'},
      {icon:'◫',title:'Lavage de vitres',desc:'Fenêtres, portes-fenêtres, baies vitrées : un besoin clairement décrit.',href:'./configurer-devis-vitres/index.html',cta:'Décrire mes vitrages'},
      {icon:'✧',title:'Grand nettoyage',desc:'Remise en état, changement de logement ou intervention ponctuelle.',href:'./devis/index.html',cta:'Décrire mon intervention'}
    ]
  };
  const wizardServices={
    pro:[
      {id:'regular',icon:'▦',title:'Entretien régulier',desc:'Bureaux, locaux, parties communes.',url:'./configurer-devis-locaux-professionnels/index.html'},
      {id:'windows',icon:'◫',title:'Vitres / vitrines',desc:'Surfaces vitrées, vitrines commerciales.',url:'./configurer-devis-vitres/index.html'},
      {id:'textile',icon:'▧',title:'Textiles',desc:'Fauteuils, canapés ou tapis à qualifier.',url:'./devis/index.html'},
      {id:'other',icon:'✧',title:'Grand nettoyage',desc:'Ouverture, remise en état ou besoin ponctuel.',url:'./devis/index.html'}
    ],
    home:[
      {id:'regular',icon:'⌂',title:'Ménage à domicile',desc:'Entretien régulier ou besoins courants.',url:'./configurer-devis-menage/index.html'},
      {id:'windows',icon:'◫',title:'Lavage de vitres',desc:'Fenêtres, baies, vérandas.',url:'./configurer-devis-vitres/index.html'},
      {id:'textile',icon:'▧',title:'Canapé / tapis',desc:'Entretien de textiles d’ameublement.',url:'./devis/index.html'},
      {id:'other',icon:'✧',title:'Grand nettoyage',desc:'Fin de bail, remise en état.',url:'./devis/index.html'}
    ]
  };
  const state={audience:'pro',step:1,service:'regular'};
  function make(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;}
  function renderCards(){const grid=q('#service-grid');grid.replaceChildren();for(const s of services[state.audience]){
      const c=make('article','service-card reveal visible');const icon=make('span','service-icon',s.icon);icon.setAttribute('aria-hidden','true');const h=make('h3','',s.title),p=make('p','',s.desc);
      const a=make('a','',s.cta);a.href=s.href;const arr=make('span','','↗');a.append(arr);c.append(icon,h,p,a);grid.append(c);
    }
    q('#service-intro').textContent=state.audience==='pro'?'Vos locaux accueillent des collaborateurs, des clients, des visiteurs. Nous adaptons l’entretien à votre activité.':'Votre maison a son rythme. Nous adaptons le ménage, les vitres et les interventions ponctuelles à votre besoin.';
  }
  function selectAudience(type){if(!services[type])return;state.audience=type;state.service='regular';qa('.audience-button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.audience===type)));qa('[data-wiz-audience]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.wizAudience===type)));renderCards();renderWizardServices();if(state.step===3)renderResult();}
  qa('.audience-button').forEach(b=>b.addEventListener('click',()=>selectAudience(b.dataset.audience)));
  qa('[data-wiz-audience]').forEach(b=>b.addEventListener('click',()=>selectAudience(b.dataset.wizAudience)));
  function renderWizardServices(){const grid=q('#wizard-services');grid.replaceChildren();wizardServices[state.audience].forEach(s=>{
      const b=make('button','wizard-option');b.type='button';b.dataset.service=s.id;b.setAttribute('aria-pressed',String(s.id===state.service));b.append(make('span','opt-ico',s.icon),make('strong','',s.title),make('small','',s.desc));b.addEventListener('click',()=>{state.service=s.id;qa('#wizard-services .wizard-option').forEach(e=>e.setAttribute('aria-pressed',String(e.dataset.service===state.service)));});grid.append(b);
    });
  }
  function setStep(n){state.step=Math.max(1,Math.min(3,n));qa('.wizard-panel').forEach(p=>p.hidden=Number(p.dataset.step)!==state.step);qa('.wiz-step').forEach((b,i)=>b.classList.toggle('on',i<state.step));q('#wizard-back').hidden=state.step===1;q('#wizard-next').hidden=state.step===3;q('#wizard-step-note').textContent=state.step===3?'Étape finale : vous choisissez la suite.':'Vous pourrez modifier votre sélection.';if(state.step===3){renderResult();q('#wizard-zone').focus({preventScroll:true});}}
  q('#wizard-next').addEventListener('click',()=>setStep(state.step+1));q('#wizard-back').addEventListener('click',()=>setStep(state.step-1));
  function norm(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[-’']/g,' ').replace(/\s+/g,' ').trim();}
  const towns=['darnieulles','epinal','golbey','chantraine','les forges','sanchey','chaumousey','girancourt','uxegney','fomerey','domevre sur aviere','chavelot','thaon les vosges','igney','nomexy','dogneville','jeuxey','dey​villers'.replace('\u200b',''),'dinoze'];
  const expandedWindows=['arches','archettes','hadol','xertigny','pouxeux','chenimenil'];
  function zoneFeedback(){const raw=q('#wizard-zone').value.trim(),commune=norm(raw),el=q('#zone-feedback');if(!raw){el.textContent='Indiquez votre commune pour une indication de couverture. La faisabilité finale est confirmée par Limpid.';return;}
    if(towns.includes(commune))el.textContent='✓ '+raw+' figure dans les communes mentionnées sur le site actuel de Limpid. La disponibilité et les conditions exactes restent à confirmer.';
    else if(state.service==='windows'&&expandedWindows.includes(commune))el.textContent='✓ '+raw+' figure dans la zone vitrerie élargie mentionnée sur le site actuel. La faisabilité sera confirmée avant devis.';
    else el.textContent=raw+' : zone à vérifier avec Limpid. Vous pouvez continuer et décrire votre besoin sans engagement.';
  }
  function renderResult(){const item=wizardServices[state.audience].find(s=>s.id===state.service)||wizardServices[state.audience][0];q('#wizard-result-title').textContent=item.title+' · '+(state.audience==='pro'?'professionnel':'particulier');q('#wizard-result-description').textContent='Votre demande sera détaillée dans le parcours déjà disponible. Aucune réservation ou estimation de prix n’est réalisée ici.';q('#wizard-go').href=item.url;zoneFeedback();}
  q('#wizard-zone').addEventListener('input',zoneFeedback);
  const r=q('#compare-range'),before=q('.compare-before'),track=q('#compare-track'),handle=q('#compare-handle');function syncCompare(){const v=Number(r.value);before.style.clipPath='inset(0 '+(100-v)+'% 0 0)';track.style.left=v+'%';handle.style.left=v+'%';}r.addEventListener('input',syncCompare);syncCompare();
  // Scroll reveal: content is visible by default when IntersectionObserver is unavailable.
  const reduced=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!reduced&&'IntersectionObserver'in window){const obs=new IntersectionObserver(entries=>entries.forEach(ent=>{if(ent.isIntersecting){ent.target.classList.add('visible');obs.unobserve(ent.target);}}),{threshold:.08,rootMargin:'0px 0px -20px 0px'});qa('.reveal').forEach(el=>obs.observe(el));}
  else qa('.reveal').forEach(el=>el.classList.add('visible'));
  const drawer=q('#mobile-menu'),shade=q('#menu-shade'),open=q('#nav-open'),close=q('#nav-close');
  function toggleNav(show){drawer.classList.toggle('open',show);drawer.setAttribute('aria-hidden',String(!show));open.setAttribute('aria-expanded',String(show));shade.hidden=!show;shade.classList.toggle('on',show);document.body.classList.toggle('drawer-open',show);if(show){close.focus();}else{open.focus();}}
  open.addEventListener('click',()=>toggleNav(true));close.addEventListener('click',()=>toggleNav(false));shade.addEventListener('click',()=>toggleNav(false));qa('#mobile-menu a').forEach(a=>a.addEventListener('click',()=>toggleNav(false)));window.addEventListener('keydown',e=>{if(e.key==='Escape'&&drawer.classList.contains('open'))toggleNav(false);});
  selectAudience('pro');setStep(1);
})();
