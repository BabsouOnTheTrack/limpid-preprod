/* LIMPID SIGNATURE FLOW — contextual sticky navigation, v2.0.
   Preserve native nodes, IDs, listeners, step logic, auto jumps and scrolling. */
(function(){
  'use strict';
  function init(){
    var nav=document.getElementById('pc-nav')||document.getElementById('cf-nav');
    if(!nav||nav.dataset.signatureDock)return;
    var specialized=nav.id==='pc-nav';
    var stage=document.getElementById(specialized?'pc-app':'cf');
    if(!stage)return;
    /* Moving the SAME element keeps the engine's original click handlers. */
    var anchor=stage.querySelector(specialized?'.pc-carte':'.cf-etape');
    if(!anchor)return;
    stage.insertBefore(nav,anchor);
    nav.dataset.signatureDock='v2';
    nav.setAttribute('role','navigation');
    nav.setAttribute('aria-label','Navigation entre les étapes de votre demande');

    function isField(el){return !!(el&&el.matches&&el.matches('input:not([type="checkbox"]):not([type="radio"]),textarea,select,[contenteditable="true"]'));}
    function cookieVisible(){
      var c=document.getElementById('limpid-cookies');
      if(!c||c.hidden)return false;
      try{var s=window.getComputedStyle(c);return s.display!=='none'&&s.visibility!=='hidden'&&c.getBoundingClientRect().height>0;}
      catch(e){return false;}
    }
    function keyboardOpen(){
      if(window.innerWidth>950||!isField(document.activeElement))return false;
      var v=window.visualViewport;
      return !v||v.height<window.innerHeight*.85||window.innerWidth<=950;
    }
    var pending=false;
    var progress=document.getElementById(specialized?'pc-barre':'cf-barre');
    function refresh(){
      pending=false;
      nav.classList.toggle('signature-dock--suspended',keyboardOpen()||cookieVisible());
      /* Visual-only progress strip; the existing meter remains canonical. */
      if(progress){
        var value=parseFloat(progress.style.width);
        if(Number.isFinite(value))nav.style.setProperty('--sig-step-progress',Math.min(100,Math.max(4,value))+'%');
      }
    }
    function schedule(){if(pending)return;pending=true;if(window.requestAnimationFrame)window.requestAnimationFrame(refresh);else refresh();}
    document.addEventListener('focusin',schedule,true);
    document.addEventListener('focusout',schedule,true);
    window.addEventListener('resize',schedule,{passive:true});
    if(window.visualViewport)window.visualViewport.addEventListener('resize',schedule,{passive:true});
    document.addEventListener('visibilitychange',schedule);
    if(window.MutationObserver){
      if(progress){var meterObserver=new MutationObserver(schedule);meterObserver.observe(progress,{attributes:true,attributeFilter:['style']});}
      var cookie=document.getElementById('limpid-cookies');
      if(cookie){var cookieObserver=new MutationObserver(schedule);cookieObserver.observe(cookie,{attributes:true,childList:true,subtree:true});}
      var addedObserver=new MutationObserver(function(records){
        for(var i=0;i<records.length;i++){
          var list=Array.prototype.slice.call(records[i].addedNodes).concat(Array.prototype.slice.call(records[i].removedNodes));
          for(var j=0;j<list.length;j++)if(list[j].id==='limpid-cookies'){schedule();return;}
        }
      });
      addedObserver.observe(document.body,{childList:true});
    }
    schedule();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
