/* globals tarteaucitron */
var currentLanguage = document.documentElement.lang
window.tarteaucitronForceLanguage = currentLanguage

tarteaucitron.init({
  AcceptAllCta: true /* Privacy policy url */,

  adblocker: false /* Open the panel with this hashtag */,
  cookieName: "tarteaucitron" /* Cookie name */,

  cookieslist: false /* Banner position (top - bottom) */,
  handleBrowserDNTRequest: false /* Show the small banner on bottom right */,
  hashtag: "#tarteaucitron" /* Show the cookie list */,

  highPrivacy: true /* Show a Warning if an adblocker is detected */,
  moreInfoLink: true /* Show the accept all button when highPrivacy on */,
  orientation: "bottom" /* Disable auto consent */,
  privacyUrl: "/politique-confidentialite#cookie" /* If Do Not Track == 1, disallow all */,

  //"cookieDomain": ".my-multisite-domaine.fr", /* Shared cookie for multisite */
  readmoreLink: "/politique-confidentialite#cookie" /* Remove credit link */,

  removeCredit: true /* Show more info link */,

  showAlertSmall: false /* If false, the tarteaucitron.css file will be loaded */,

  useExternalCss: false /* Change the default readmore link */,
})

// tarteaucitron.user.hotjarId = 1672249
// tarteaucitron.user.HotjarSv = 6
// ;(tarteaucitron.job = tarteaucitron.job || []).push("hotjar")
