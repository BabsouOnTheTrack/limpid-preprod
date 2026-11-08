import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Script} from 'node:vm';
const html=readFileSync(new URL('../crm-contract/Limpid_V614_INBOX_UI_LAB_FRAGMENT.html',import.meta.url),'utf8');
test('UI LAB has no server mutator, external fetch nor dynamic innerHTML',()=>{
 for(const forbidden of [/UrlFetchApp/,/XMLHttpRequest/,/\bfetch\s*\(/,/\bdoPost\s*\(/,/\bappendRow\s*\(/,/\.innerHTML\s*=/,/setValues\s*\(/,/LIMPID_V613_ECRITURE_TEST/])
  assert.doesNotMatch(html,forbidden);
});
test('UI only requests the existing read-only LAB method',()=>{
 const calls=html.match(/\.limpidInboxCopie_[A-Za-z0-9_]+\s*\(/g)||[];
 assert.deepEqual(calls,['.limpidInboxCopie_listerTEST(']);
 assert.match(html,/limpidInboxCopie_listerTEST\(50\)/);
});
test('UI explicitly rejects real-looking records and ACK enabled',()=>{
 assert.match(html,/FICTIF/);
 assert.match(html,/r\.ackAutorise!==false/);
 assert.match(html,/Affichage bloqué/);
});
test('UI never activates CRM prospect/devis and callback is disabled',()=>{
 assert.match(html,/action\.disabled=true/);
 assert.match(html,/Traiter le rappel/);
 assert.match(html,/Reprendre dans le devis/);
});
test('UI includes search/type/service and lab sheet link',()=>{
 for(const k of ['limpid-v614-search','limpid-v614-type','limpid-v614-service','limpid-v614-refresh','61130022'])
   assert.ok(html.includes(k),k);
});
test('UI JS source parses and has exactly one script block',()=>{
 const chunks=[...html.matchAll(/<script id="limpid-v614-inbox-script">([\s\S]*?)<\/script>/g)];
 assert.equal(chunks.length,1);
 assert.doesNotThrow(()=>new Script(chunks[0][1]));
});
test('UI injection keeps its own namespace, no doGet routing',()=>{
 assert.match(html,/window\.LimpidInboxUILAB/);
 assert.doesNotMatch(html,/function\s+(vue|doGet|doPost|importerDemande)\s*\(/);
});
