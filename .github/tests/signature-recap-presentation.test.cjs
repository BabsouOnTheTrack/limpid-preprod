'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const render=require('../../assets/signature-recap-detail.js').render;
const root=path.resolve(__dirname,'../..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
test('Le détail reprend Compris, Options, Non compris et estimation sans calculer de nouvelle durée',()=>{
 const p={inclus:[{piece:'Cuisine',taches:['Nettoyage des plans de travail','Façades accessibles']}],
  options:['Fenêtres intérieures : 1'],exclus:['Déplacement des meubles lourds'],
  retires:['Vaisse[l]le']};
 const html=render(p,{minutes:280},'menage',true);
 for(const item of ['Cuisine','Compris','Non compris','Éléments et options','Retiré à votre demande','4 h 40 min','crédit d’impôt','aucun devis commercial'])assert.ok(html.includes(item),item);
 assert.ok(html.includes('Fenêtres intérieures'));
});
test('Aucune injection HTML dans les valeurs provenant des réponses du client',()=>{
 const h=render({inclus:[{piece:'<img src=x>',taches:['<script>alert(1)</script>']}],
    exclus:['<svg onload=alert(1)>']},{minutes:0},'b2b',true);
 assert.ok(!h.includes('<script>')&&!h.includes('<svg onload')&&!h.includes('<img src'));
 assert.ok(h.includes('&lt;script&gt;')&&h.includes('&lt;img src=x&gt;'));
});
test('Professionnels : pas de crédit impôt et pas de promesse de prix automatique',()=>{
 const html=render({inclus:[{piece:'Locaux',taches:['Sols']}],exclus:[]}, {minutes:90},'b2b',false);
 assert.ok(!html.includes('crédit d’impôt'));
 assert.ok(html.includes('1 h 30 min'));
 assert.ok(html.includes('après étude'));
});
test('Trois récapitulatifs spécialisés intègrent le détail sans toucher au code d’import',()=>{
 for(const page of ['configurer-devis-menage/index.html','configurer-devis-vitres/index.html','configurer-devis-locaux-professionnels/index.html']){
   const src=read(page);
   assert.ok(src.includes('src="/assets/signature-recap-detail.js"'));
   assert.ok(src.includes('LimpidSignatureRecap.render(LimpidMoteur.perimetre(scopeSaisie), LimpidMoteur.estimer(scopeSaisie)'));
   assert.ok(src.includes('CFG.recap(R).forEach(function (s)'));
   assert.ok(src.includes('LimpidMoteur.coder(demande)')||src.includes('LimpidMoteur.coder('));
 }
});
test('Libellé de marque : taille au moins 11 px sur grand écran sans modifier le DOM de navigation',()=>{
 const css=read('assets/signature-site.css');
 assert.ok(css.includes('min-width:1600px'));
 assert.ok(css.includes('font-size:12px!important'));
 assert.ok(css.includes('min-width:1450px'));
 assert.ok(css.includes('font-size:11px!important'));
 assert.ok(!read('assets/signature-recap-detail.js').includes('fetch('));
});
