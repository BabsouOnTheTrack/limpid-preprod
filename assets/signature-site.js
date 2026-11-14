/* LIMPID SIGNATURE · Comparateur avant/après. */
(function(){'use strict';var imgs=document.querySelectorAll('.lx-beforeafter input[type="range"]');imgs.forEach(function(input){var root=input.closest('.lx-beforeafter');if(!root)return;var render=function(){root.style.setProperty('--lx-compare',input.value+'%')};input.addEventListener('input',render);render()})})();
