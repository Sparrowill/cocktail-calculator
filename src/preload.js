// This stops stuff that I don't understand from erroring.

const { contextBridge, ipcRenderer } = require('electron')



contextBridge.exposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
  pdf: (title, content, numDrinks, drinks) => ipcRenderer.invoke('PDF', title, content, numDrinks, drinks),
  // we can also expose variables, not just functions
})


