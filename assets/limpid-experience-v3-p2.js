/* LIMPID EXPERIENCE V3-P2 — habillage contextuel NON METIER.
   Aucun stockage, reseau, tracking, calcul, champ d'envoi ou changement des
   scripts historiques. L'observation ne touche que des noeuds V3-P2 ajoutes. */
(function(){
  'use strict';
  function id(name){return document.getElementById(name);}
  function create(tag,cls,value){var n=document.createElement(tag);if(cls)n.className=cls;if(value!=null)n.textContent=value;return n;}
  var reduced=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function context(host, before, rubrique){
    var wrap=create('section','lx3p2-context');
    wrap.setAttribute('aria-label','Repères de votre demande');
    var k=create('p','lx3p2-kicker','LIMPID • '+rubrique);
    var line=create('div','lx3p2-line');
    var current=create('p','lx3p2-current','Votre demande, étape par étape');
    var actions=create('div','lx3p2-actions');
    var guide=create('button','lx3p2-guide','Voir les exemples illustrés');
    guide.type='button'; guide.hidden=true;
    guide.addEventListener('click',function(){
      var original=(id('pc-corps')||id('cf')).querySelector('.lmv-inline .lmv-more');
      if(original){original.click();return;}
      var banner=(id('pc-corps')||id('cf')).querySelector('.lmv-inline');
      if(banner)banner.scrollIntoView({block:'center',behavior:reduced?'auto':'smooth'});
    });
    actions.appendChild(guide);line.appendChild(current);line.appendChild(actions);
    var sub=create('p','lx3p2-subline','Choisissez selon votre situation. Vos réponses restent vérifiables avant l’envoi.');
    wrap.appendChild(k);wrap.appendChild(line);wrap.appendChild(sub);
    host.insertBefore(wrap,before);
    return {wrap:wrap,current:current,sub:sub,guide:guide};
  }
  var preciseHints={
    'Combien de fenêtres classiques ?':'Comptez les fenêtres complètes dans leur catégorie ; ne confondez pas fenêtre et baie vitrée.',
    'Combien de baies et portes-fenêtres ?':'Une baie à deux vantaux reste une seule ouverture. Le nombre de panneaux n’est pas le nombre de baies.',
    'Votre véranda':'Indiquez la surface au sol ; les vitrages de la véranda ne doivent pas être comptés une seconde fois.',
    'Quelles faces faut-il nettoyer ?':'La sélection intérieur / extérieur ne change pas le nombre d’ouvertures déclaré.',
    'Que souhaitez-vous ?':'Les quantités demandées portent sur les éléments entiers ; les faces techniques restent calculées par le moteur Limpid.',
    'Vérifiez votre demande':'Vous pouvez revenir sur chaque rubrique pour la modifier avant de transmettre votre demande.'
  };
  function initSpec(){
    var app=id('pc-app'),prog=id('pc-prog'),corps=id('pc-corps');
    if(!app||!prog||!corps)return;
    var tunnel=document.body.getAttribute('data-tunnel');
    var kind=tunnel==='vitres'?'Vitres':tunnel==='menage'?'Ménage et domicile':'Locaux professionnels';
    var ui=context(app,prog,kind);var pending=false;
    function sync(){pending=false;var t=corps.querySelector('#pc-titre');var title=t&&t.textContent.trim();
      if(!title){ui.current.textContent='Votre demande, étape par étape';ui.sub.textContent='Les informations affichées sont indicatives tant que Limpid n’a pas confirmé votre demande.';ui.guide.hidden=true;return;}
      ui.current.textContent=title;
      if(title==='Demande enregistrée'){
        ui.sub.textContent='Dossier fictif enregistré en préproduction. Aucun devis ni e-mail client n’est envoyé.';
        ui.guide.hidden=true;
        return;
      }
      ui.sub.textContent=preciseHints[title]||'Répondez simplement selon votre situation. Les informations pourront être relues avant l’envoi.';
      ui.guide.hidden=!corps.querySelector('.lmv-inline .lmv-more');
    }
    function schedule(){if(pending)return;pending=true;requestAnimationFrame(sync);}
    new MutationObserver(schedule).observe(corps,{childList:true,subtree:false});
    sync();
  }
  function initGeneral(){
    var main=id('cf');if(!main)return;
    var prog=main.querySelector('.cf-prog');if(!prog)return;
    var ui=context(main,prog,'Demande multi-prestations');var pending=false;
    function sync(){pending=false;var active=main.querySelector('.cf-etape.on');
      var title=active&&active.querySelector('h2');
      ui.current.textContent=title?title.textContent.trim():'Votre devis de nettoyage';
      var n=active&&active.getAttribute('data-etape');
      ui.sub.textContent=n==='8'?'Dossier fictif enregistré en préproduction. Aucun devis ni e-mail client n’est envoyé.':n==='3'?'Les éléments sont comptés selon les unités de chaque prestation. Consultez les exemples pour éviter les confusions.':n==='6'?'Relisez le périmètre, les quantités et la fréquence avant d’envoyer votre demande.':'Vous pouvez combiner plusieurs prestations et vérifier les rubriques avant l’envoi.';
      ui.guide.hidden=!(active&&active.querySelector('.lmv-inline .lmv-more'));
    }
    function schedule(){if(pending)return;pending=true;requestAnimationFrame(sync);}
    new MutationObserver(schedule).observe(main,{subtree:true,attributes:true,attributeFilter:['class']});
    // L'ancien moteur remplace aussi le contenu des rubriques dynamiques.
    var description=id('f-description');if(description)new MutationObserver(schedule).observe(description,{childList:true,subtree:false});
    sync();
  }
  function start(){
    if(document.body.classList.contains('lx--config'))initSpec();
    else if(document.body.classList.contains('lx--general-devis'))initGeneral();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
