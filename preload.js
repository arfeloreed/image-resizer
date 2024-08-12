const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("os", {
  homedir: () => ipcRenderer.invoke("homedir"),
});

contextBridge.exposeInMainWorld("path", {
  join: (arg1, arg2) => {
    if (typeof arg1 === "string" && typeof arg2 === "string") {
      return ipcRenderer.invoke("join", [arg1, arg2]);
    } else {
      throw new Error(
        "Invalid arguments passed to path.join. Expected two strings.",
      );
    }
  },
});

contextBridge.exposeInMainWorld("ipc", {
  send: (channel, data) => ipcRenderer.send(channel, data),
  on: (channel, func) =>
    ipcRenderer.on(channel, (event, ...args) => func(...args)),
});
