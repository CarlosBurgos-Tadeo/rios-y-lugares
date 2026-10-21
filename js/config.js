export const CONFIG = {
  commonsApi: 'https://commons.wikimedia.org/w/api.php',
  commonsWeb: 'https://commons.wikimedia.org/wiki/',

  // OAuth 2.0 de Wikimedia (registrar el consumidor en
  // https://meta.wikimedia.org/wiki/Special:OAuthConsumerRegistration/propose/oauth2).
  oauth: {
    clientId: '', // TODO: pegar el client_id cuando Wikimedia apruebe el consumidor
    authorizeUrl: 'https://meta.wikimedia.org/w/rest.php/oauth2/authorize',
    tokenUrl: 'https://meta.wikimedia.org/w/rest.php/oauth2/access_token',
  },

  // Si la subida directa desde el navegador falla por CORS, apuntar aquí un
  // proxy serverless (Netlify/Cloudflare) que reenvíe a la API de Commons.
  uploadProxyUrl: '',

  license: '{{self|cc-by-sa-4.0}}',
  uploadCategory: 'Ríos y Lugares',

  // Prefijo de los QR impresos en las cartas: "ryl:<id-de-carta>"
  qrPrefix: 'ryl:',

  categoriasCarta: ['Fauna', 'Flora', 'Lugar', 'Evento', 'Saber comunitario'],
};
