const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('ipcRenderer', {
    send: (channel, title, body) => {
        const validChannels = ['send-notification']; 
        if (validChannels.includes(channel)) {
            ipcRenderer.send(channel, { title, body }); 
        }
    },
});
