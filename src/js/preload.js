// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('ipcRenderer', {
    send: (channel, data) => {
        const validChannels = ['send-notification']; // Solo permitir estos canales
        if (validChannels.includes(channel)) {
            ipcRenderer.send(channel, data);
        }
    },
});
