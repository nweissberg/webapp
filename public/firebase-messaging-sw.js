importScripts('/__/firebase/9.2.0/firebase-app-compat.js');
importScripts('/__/firebase/9.2.0/firebase-messaging-compat.js');
importScripts('/__/firebase/init.js');

const messaging = firebase.messaging();


messaging.onMessage(function(payload) {
    const notificationTitle = payload.data.title;
    const notificationOptions = {
        body: payload.data.message,
        icon: '/firebase-logo.png',
        data:{link:payload.data.url},
        actions: [
            {
                action: 'view_link',
                title: 'Abrir Link'
            }
        ]
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
});

messaging.onBackgroundMessage(function(payload) {
    const notificationTitle = payload.data.title;
    const notificationOptions = {
        body: payload.data.message,
        icon: '/firebase-logo.png',
        data:{link:payload.data.url},
        actions: [
            {
                action: 'view_link',
                title: 'Abrir Link'
            }
        ]
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    const link = 'https://app.pilar.com.br/'+ event.notification.data.link;
    event.waitUntil(
        clients.openWindow(link)

    );
}, false);