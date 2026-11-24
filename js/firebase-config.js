/* ==============================================================================
   Firebase Configuration & Firestore SDK Loader — Versão 3 Serverless
   Projeto: onflux-psicologo-v3
   ============================================================================== */

var firebaseConfig = {
  apiKey: "AIzaSyC29g6oi5WVWuZ7Crc1-kVvcD-8BnH8h2o",
  authDomain: "onflux-psicologo-v3.firebaseapp.com",
  projectId: "onflux-psicologo-v3",
  storageBucket: "onflux-psicologo-v3.firebasestorage.app",
  messagingSenderId: "277475998367",
  appId: "1:277475998367:web:9ece322707bc8bc231c0aa",
  measurementId: "G-MG1YBBEF5H"
};

var db = null;

function inicializarFirestore() {
  if (typeof firebase !== 'undefined' && firebase.initializeApp) {
    try {
      if (!firebase.apps || firebase.apps.length === 0) {
        firebase.initializeApp(firebaseConfig);
      }
      db = firebase.firestore();
      return db;
    } catch (e) {
      console.warn('Aviso: Inicialização do Firestore em modo offline ou pendente:', e);
      return null;
    }
  }
  return null;
}

// Inicializa imediatamente se o SDK já estiver carregado
if (typeof firebase !== 'undefined') {
  inicializarFirestore();
}
