import { initializeApp } from "firebase/app";
import { getMessaging, onBackgroundMessage } from "firebase/messaging/sw";

const firebaseConfig = {
  apiKey: "AIzaSyD8Qzm03splCGEaKFXn2rrkjbftITU6H9U",
  authDomain: "dostana-452011.firebaseapp.com",
  projectId: "dostana-452011",
  storageBucket: "dostana-452011.firebasestorage.app",
  messagingSenderId: "19932708049",
  appId: "1:19932708049:web:0325d4f2bf59f56ae259f0",
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

onBackgroundMessage(messaging, (payload) => {
  console.log("Received background message: ", payload);

  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: "/companyFaviIcon.png",
  });
});
