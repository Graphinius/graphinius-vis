function activateGA() {
  console.log("ACTIVATING GOOGLE ANALYTICS...");

  (function (i, s, o, g, r, a, m) {
  i['GoogleAnalyticsObject'] = r; i[r] = i[r] || function () {
    (i[r].q = i[r].q || []).push(arguments)
  }, i[r].l = 1 * new Date(); a = s.createElement(o),
    m = s.getElementsByTagName(o)[0]; a.async = 1; a.src = g; m.parentNode.insertBefore(a, m)
  })(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga');

  ga('create', 'UA-129671787-1', 'auto');
  ga('set', 'anonymizeIp', true);
  ga('send', 'pageview');
}

function hasAcceptedGACookie() {
  var name = "acceptsGACookie=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length) === 'true';
    }
  }
  return false;
}

function acceptsGACookie() {
  document.cookie = 'acceptsGACookie = true';
  document.querySelector("#cookieBanner").style.display = "none";
  activateGA();
}

if (hasAcceptedGACookie()) {
  document.querySelector("#cookieBanner").style.display = "none";
}