import firebase from 'firebase';

const config = {
    apiKey: "AIzaSyDfKf_XOPHfuVO4Qp_IyUKuoRgrEcdeZVU",
    authDomain: "ljsprojects.firebaseapp.com",
    databaseURL: "https://ljsprojects.firebaseio.com",
    projectId: "ljsprojects",
    storageBucket: "ljsprojects.appspot.com",
    messagingSenderId: "808827301077",
    appId: "1:808827301077:web:0162feb96f49c42342065c",
    measurementId: "G-1GRWKPJNT9"
  };

  firebase.initializeApp(config);

  export const db = firebase.firestore();