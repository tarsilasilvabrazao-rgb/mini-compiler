const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    compile: (sourceCode) => ipcRenderer.invoke('compile-code', sourceCode),
    onInputRequest: (callback) => ipcRenderer.on('input-request', (event, prompt) => callback(prompt)),
    sendInput: (text) => ipcRenderer.send('input-response', text)
});