// This stops stuff that I don't understand from erroring.

const { contextBridge, ipcRenderer } = require('electron')


contextBridge.exposeInMainWorld("api",{
  send: (channel, data) => ipcRenderer.send(channel, data),
  receive: (channel, func) => ipcRenderer.on(
        channel,
        (event, ...args) => func(args)
    )
})

contextBridge.exposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
  pdf: (title, content, numDrinks, drinks, options, shoppingList) => ipcRenderer.invoke('PDF', title, content, numDrinks, drinks, options, shoppingList),
  json: () => ipcRenderer.invoke('JSON'),
  exit: () => ipcRenderer.invoke('exit'),
  edit: (content) => ipcRenderer.invoke('edit', content),
  updatePrices: (hen, flair, bartender, bar, travel, glassR, glassF, ingredientM) => ipcRenderer.invoke('updatePrices', hen, flair, bartender, bar, travel, glassR, glassF, ingredientM)
  // we can also expose variables, not just functions
})



