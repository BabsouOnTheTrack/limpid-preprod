/* LIMPID V6.5.9 — repères visuels contextuels (site public)
   AUCUNE modification des modèles de prix, champs, validations, sauvegardes, conversion LIMPID1.
   Accessible sans réseau externe : les images sont dans /assets/guides/.
*/
(function () {
  'use strict';
  if (window.__LIMPID_AIDE_VISUELLE_V659__) return;
  window.__LIMPID_AIDE_VISUELLE_V659__ = true;

  var S = '/assets/guides/';
  var D = {
    vitres: { nom: 'Vitres et vérandas', items: [
      ['Fenêtre classique', 'Fenêtre entière : ne la confondez pas avec une baie.', 'vitres-01.webp'],
      ['Petite baie / porte-fenêtre (1 vantail)', 'Une ouverture vitrée simple.', 'vitres-02.webp'],
      ['Baie / porte-fenêtre (2 vantaux)', 'Une ouverture avec deux panneaux.', 'vitres-03.webp'],
      ['Grande baie (3 vantaux et +)', 'Une grande ouverture complète.', 'vitres-04.webp'],
      ['Petit Velux accessible', 'Uniquement si les deux côtés peuvent être nettoyés depuis l’intérieur, en sécurité.', 'vitres-05.webp'],
      ['Véranda', 'Renseignez sa surface au sol. Les parois seules sont concernées ; la toiture est exclue.', 'vitres-06.webp'],
      ['Rails et glissières', 'Option distincte : nettoyage des rainures et rails.', 'vitres-07.webp'],
      ['Volets', 'Option à demander séparément, sous réserve d’accès.', 'vitres-08.webp']
    ] },
    menage: { nom: 'Ménage courant', items: [
      ['Logement complet','L’ensemble de la maison ou de l’appartement.','menage-01.webp'],
      ['Pièces à nettoyer','Précisez les chambres, salles de bains, WC et bureaux.','menage-02.webp'],
      ['Surface habitable','Une surface approximative en m² suffit pour commencer.','menage-03.webp'],
      ['Fréquence','Une ou plusieurs fois par semaine, ou tous les quinze jours.','menage-04.webp'],
      ['État du logement','Un entretien habituel n’équivaut pas à une remise en état.','menage-05.webp'],
      ['Étages et accès','Aidez-nous à anticiper les contraintes d’accès.','menage-06.webp'],
      ['Animaux','À signaler : peut augmenter le temps de nettoyage.','menage-07.webp'],
      ['Logement fumeur','À signaler pour une estimation réaliste.','menage-08.webp'],
      ['Après travaux','Le grand nettoyage de chantier nécessite une étude spécifique.','menage-09.webp'],
      ['Premier grand passage','Une remise à niveau peut précéder les passages réguliers.','menage-10.webp']
    ] },
    grand: { nom: 'Grand ménage', items: [
      ['Sols et poussière','Inclus dans la base du grand ménage.','grand-01.webp'],
      ['Cuisine','Nettoyage renforcé des surfaces extérieures accessibles.','grand-02.webp'],
      ['Salle de bains','Entretien approfondi des zones accessibles.','grand-03.webp'],
      ['Portes et plinthes','Détails et surfaces accessibles.','grand-04.webp'],
      ['Toiles d’araignée','Nettoyage des endroits atteignables en sécurité.','grand-05.webp'],
      ['Vitrerie','Uniquement si elle a été ajoutée à la demande.','grand-06.webp'],
      ['Non compris','Intérieurs de placards, réfrigérateurs, congélateurs, volets ou accès complexes.','grand-07.webp'],
      ['Avant ou après départ','Remise à niveau du logement selon le périmètre convenu.','grand-08.webp']
    ] },
    bureaux: { nom: 'Bureaux et locaux professionnels', items: [
      ['Surface des locaux','La surface approximative aide à définir le temps.','bureaux-01.webp'],
      ['Fréquence','Combien de passages sont souhaités ?','bureaux-02.webp'],
      ['Espaces de travail','Accueil, bureaux, open space ou salles de réunion.','bureaux-03.webp'],
      ['Sanitaires','Indiquez les toilettes et points d’eau à entretenir.','bureaux-04.webp'],
      ['Salle de pause','À préciser lorsqu’elle fait partie du contrat.','bureaux-05.webp'],
      ['Revêtements de sol','Carrelage, moquette, PVC ou autres surfaces.','bureaux-06.webp'],
      ['Vitres de locaux','À ajouter si la vitrerie doit être comprise.','bureaux-07.webp'],
      ['Contraintes d’accès','Horaires, stationnement, étage, site occupé.','bureaux-08.webp'],
      ['Type de local','Commerce, cabinet, bureaux, copropriété…','bureaux-09.webp']
    ] },
    textile: { nom: 'Textiles d’ameublement', items: [
      ['Canapé','Deux, trois places ou canapé d’angle.','textile-01.webp'],
      ['Fauteuil','Nombre de fauteuils à traiter.','textile-02.webp'],
      ['Chaises en tissu','Indiquez le nombre de sièges.','textile-03.webp'],
      ['Tapis','Dimensions approximatives si vous les connaissez.','textile-04.webp'],
      ['Matelas','À sélectionner uniquement si Limpid propose la prestation.','textile-05.webp'],
      ['Taches','Origine connue ? Précisez-la si possible.','textile-06.webp'],
      ['Nature du tissu','Certains revêtements fragiles exigent une vérification préalable.','textile-07.webp'],
      ['Photos','Une photo permet de vérifier l’état et la faisabilité.','textile-08.webp'],
      ['Accès au logement','Escaliers, étage, possibilité de stationner.','textile-09.webp']
    ] }
  };
  var ORDER = ['menage','grand','vitres','bureaux','textile'];
  var modal = null;
  function elt(tag, cls, txt) {
    var x=document.createElement(tag);
    if(cls) x.className=cls;
    if(txt !== undefined) x.textContent=txt;
    return x;
  }
  function cards(group, indices, short) {
    var grid=elt('div',short?'lmv-grid lmv-grid-compact':'lmv-grid');
    (indices||D[group].items.map(function(_,i){return i;})).forEach(function(i){
      var item=D[group].items[i];
      if(!item)return;
      var figure=elt('figure','lmv-item');
      var img=elt('img');
      img.src=S+item[2]; img.alt='Exemple illustré : '+item[0]; img.loading='lazy'; img.decoding='async'; img.width=410; img.height=240;
      var cap=elt('figcaption');
      cap.appendChild(elt('strong',null,item[0]));
      cap.appendChild(elt('span',null,item[1]));
      figure.appendChild(img);figure.appendChild(cap);grid.appendChild(figure);
    });
    return grid;
  }
  function makeModal() {
    if(modal)return modal;
    modal=elt('dialog','lmv-modal');
    modal.id='limpid-guide-visuel';
    modal.setAttribute('aria-label','Repères illustrés pour votre demande de devis');
    var head=elt('div','lmv-modal-head');
    var h=elt('h2',null,'Repères visuels Limpid');
    var close=elt('button','lmv-close','Fermer ×'); close.type='button';
    close.addEventListener('click',function(){modal.close();});
    head.appendChild(h);head.appendChild(close);
    var tabs=elt('div','lmv-tabs');tabs.setAttribute('role','group');tabs.setAttribute('aria-label','Type de prestation');
    ORDER.forEach(function(k){var b=elt('button','lmv-tab',D[k].nom);b.type='button';b.dataset.guide=k;b.addEventListener('click',function(){showCategory(k);});tabs.appendChild(b);});
    var content=elt('div','lmv-modal-content');content.id='lmv-contenu';
    modal.appendChild(head);modal.appendChild(tabs);modal.appendChild(content);
    document.body.appendChild(modal);
    modal.addEventListener('click',function(e){if(e.target===modal)modal.close();});
    return modal;
  }
  function showCategory(k){
    if(!D[k])return;
    var d=makeModal();
    d.querySelectorAll('[data-guide]').forEach(function(b){var on=b.dataset.guide===k;b.classList.toggle('is-active',on);b.setAttribute('aria-pressed',on?'true':'false');});
    var c=d.querySelector('#lmv-contenu');c.replaceChildren();
    var p=elt('p','lmv-hint',k==='vitres'?'Comptez chaque ouverture physique une seule fois : le moteur calcule les faces techniques et la durée. Les brouillons plus anciens peuvent conserver leur ancien comptage.':k==='grand'?'Seules les prestations sélectionnées et les surfaces accessibles sont comprises.':'Ces images sont des exemples pour vous aider à répondre. Les prestations effectivement prévues seront précisées dans votre devis.');
    c.appendChild(p);c.appendChild(cards(k));
    c.appendChild(elt('p','lmv-foot','En cas de doute, décrivez votre besoin ou proposez une photo lorsque cette option est disponible.'));
  }
  function open(k){var d=makeModal();showCategory(k);if(!d.open)d.showModal();}
  function banner(k,indices,note,serviceList){
    var w=elt('section','lmv-inline');w.dataset.guideRole='inline';
    var top=elt('div','lmv-inline-head');
    var intro=elt('div');intro.appendChild(elt('strong',null,'🖼️ Des exemples pour vous guider'));
    intro.appendChild(elt('span',null,'Reconnaissez ce que vous souhaitez faire nettoyer.'));
    var action=elt('button','lmv-more','Voir le guide complet');action.type='button';
    action.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();open(k);});
    top.appendChild(intro);top.appendChild(action);w.appendChild(top);
    if(serviceList&&serviceList.length>1){
      var choices=elt('div','lmv-inline-tabs');serviceList.forEach(function(group){var b=elt('button','lmv-chip',D[group].nom);b.type='button';b.dataset.group=group;if(group===k)b.classList.add('is-active');b.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();var host=w.parentNode;if(host){host.replaceChild(banner(group,chooseDefault(group),note,serviceList),w);}});choices.appendChild(b);});w.appendChild(choices);
    }
    w.appendChild(cards(k,indices,true));
    if(note)w.appendChild(elt('p','lmv-inline-note',note));
    return w;
  }
  function chooseDefault(k){return k==='vitres'?[0,2,4]:k==='grand'?[0,1,6]:k==='textile'?[0,2,6]:k==='bureaux'?[0,3,7]:[0,2,4];}
  function pcPlan(kind,title){
    if(kind==='vitres'){
      if(title==='Que souhaitez-vous faire nettoyer ?')return ['vitres',[0,2,5],'Choisissez vos vitrages sans compter deux fois la même ouverture.'];
      if(title==='Combien de fenêtres classiques ?')return ['vitres',[0,4,1],'Petit Velux : nettoyage intégral possible depuis l’intérieur uniquement. Les grands modèles ou ceux exigeant un accès extérieur complexe ne sont pas pris en charge automatiquement.'];
      if(title==='Combien de baies et portes-fenêtres ?')return ['vitres',[1,2,3],'Une baie = une ouverture complète, même si elle possède plusieurs vantaux. Ne la recomptez pas dans les fenêtres.'];
      if(title==='Votre véranda')return ['vitres',[5],'Une estimation de la surface au sol suffit. Parois vitrées uniquement ; toiture exclue. Ne recomptez pas les baies de la véranda.'];
      if(title==='Quelles faces faut-il nettoyer ?')return ['vitres',[0,2],'Choisissez intérieur, extérieur ou les deux. Le nombre d’ouvertures ne change pas.'];
      if(title==='Votre logement')return ['vitres',[4,0],'Les petits Velux ne sont pris en charge que si les deux faces sont accessibles en sécurité depuis l’intérieur.'];
    }
    if(kind==='menage'){
      if(title==='Votre logement')return ['menage',[0,5],'Indiquez les niveaux pour faciliter l’estimation.'];
      if(title==='Sa surface et ses pièces')return ['menage',[2,1],'Une surface approximative est suffisante pour commencer.'];
      if(title==='À quel rythme ?')return ['menage',[3,9],'Une intervention dure au minimum deux heures.'];
      if(title==='Que souhaitez-vous ?')return ['menage',[0,1,4],'Comptez les fenêtres et les baies, pas les faces vitrées : la conversion technique est automatique.'];
      if(title==='Quelques précisions')return ['menage',[6,7,5],'Les animaux et le tabac sont à signaler pour une estimation juste.'];
    }
    if(kind==='bureaux'){
      if(title==='Quels locaux faut-il entretenir ?')return ['bureaux',[8,2],'Identifiez le type de local avant de préciser les surfaces.'];
      if(title==='Quelle est leur surface ?')return ['bureaux',[0,5],'Une surface approximative suffit pour la première estimation.'];
      if(title==='À quel rythme ?')return ['bureaux',[1,2],'Précisez les passages souhaités, sans engagement automatique.'];
      if(title==="Qu'attendez-vous de nous ?")return ['bureaux',[2,3,4],'Précisez les zones souhaitées. La vitrerie doit être sélectionnée si nécessaire.'];
      if(title==='Vos contraintes')return ['bureaux',[7,1],'Les accès, les horaires et l’occupation du site peuvent modifier l’organisation.'];
    }
    return null;
  }
  function runPC(kind){
    var z=document.getElementById('pc-corps');if(!z)return;
    var title=z.querySelector('#pc-titre'); if(!title||z.querySelector('[data-guide-role="inline"]'))return;
    var plan=pcPlan(kind,title.textContent.trim());if(!plan)return;
    var p=banner(plan[0],plan[1],plan[2]);
    var under=title.nextElementSibling; if(under&&under.classList.contains('cf-sous'))under.insertAdjacentElement('afterend',p);
    else title.insertAdjacentElement('afterend',p);
  }
  function selectedDevis(){
    var selected=[];
    document.querySelectorAll('#f-prestations button.on').forEach(function(b){
      var k=b.dataset.v;
      if(k==='regulier')k='menage';if(k==='vitres'||k==='grand'||k==='bureaux'||k==='textile'||k==='menage'){
        if(selected.indexOf(k)<0)selected.push(k);
      }
    });
    return selected;
  }
  function runGeneral(){
    var z=document.getElementById('f-description');if(!z||!z.children.length||z.querySelector('[data-guide-role="inline"]'))return;
    var chosen=selectedDevis();if(!chosen.length)return;
    var key=chosen[0];
    var note=key==='vitres'?'Comptez chaque fenêtre et chaque baie une seule fois ; le moteur assure la conversion des faces techniques. Pour un petit Velux accessible depuis l’intérieur, précisez-le dans votre message.':'Les images facilitent le repérage ; le calcul suit les champs et unités affichés dans ce formulaire.';
    var w=banner(key,chooseDefault(key),note,chosen);z.insertBefore(w,z.firstChild);
  }
  function start(){
    makeModal();
    var path=location.pathname.toLowerCase();
    if(path.indexOf('/configurer-devis-')===0){
      var kind=path.indexOf('vitres')>=0?'vitres':path.indexOf('menage')>=0?'menage':'bureaux';
      var z=document.getElementById('pc-corps');if(!z)return;
      var observer=new MutationObserver(function(){runPC(kind);});observer.observe(z,{childList:true,subtree:false});
      runPC(kind);
    }else if(path==='/devis/'||path==='/devis'){
      var z2=document.getElementById('f-description');if(!z2)return;
      var observer2=new MutationObserver(runGeneral);observer2.observe(z2,{childList:true,subtree:false});
      var z3=document.getElementById('f-prestations');if(z3)observer2.observe(z3,{childList:true,subtree:false});
      runGeneral();
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
