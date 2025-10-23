self.addEventListener('push', function (event) {
    if (!event.data) return;

    const data = event.data.json();

    // Exemple de structure de la notification
    const title = data.title || 'Nouveau message';
    const options = {
        body: data.body || '',
        icon: '/icon.png', // optionnel
        data: data, // pour le transmettre au client
    };

    // Affiche la notification
    event.waitUntil(self.registration.showNotification(title, options));

    // Notifie l'application React en cours
    self.clients.matchAll({ includeUncontrolled: true, type: 'window' })
        .then((clients) => {
            clients.forEach((client) => {
                client.postMessage({
                    type: 'PUSH_NOTIFICATION',
                    payload: data,
                });
            });
        });
});
