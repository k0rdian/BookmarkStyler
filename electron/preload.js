const { contextBridge, clipboard } = require('electron');

contextBridge.exposeInMainWorld('bookmarkStyler', {
  copyToClipboard: (text) => clipboard.writeText(text)
});
