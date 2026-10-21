// Statistiques de visites anonymes (GoatCounter : sans cookies, sans données personnelles).
// Désactivé tant que CODE est vide. Pour l'activer : créer un compte gratuit sur goatcounter.com,
// puis mettre ici le nom choisi (ex. 'five-ways' pour five-ways.goatcounter.com).
(function(){
  const CODE='';
  if(!CODE) return;
  if(navigator.doNotTrack==='1') return;
  if(/^(localhost|127\.|\[::1\])/.test(location.hostname)) return;
  const s=document.createElement('script');
  s.async=true; s.src='https://gc.zgo.at/count.js';
  s.setAttribute('data-goatcounter','https://'+CODE+'.goatcounter.com/count');
  document.head.appendChild(s);
})();
