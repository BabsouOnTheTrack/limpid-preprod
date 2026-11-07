/* LIMPID SIGNATURE — copyright year rolling annually on January 1. */
(function () {
  'use strict';
  function updateLimpidYear() {
    var year = String(new Date().getFullYear());
    document.querySelectorAll('[data-limpid-year]').forEach(function (element) {
      if (element.textContent !== year) element.textContent = year;
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateLimpidYear, {once:true});
  } else { updateLimpidYear(); }
  document.addEventListener('visibilitychange', function () { if (!document.hidden) updateLimpidYear(); });
})();
