import { app, BrowserWindow, Menu } from "electron";
import path from "node:path";
import { fileURLToPath } from "url";

const isDev = process.env.NODE_ENV !== "production";
const isMac = process.platform === "darwin";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// main window
function createMainWindow() {
  const win = new BrowserWindow({
    width: isDev ? 1000 : 500,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  win.loadFile("./render/index.html");
  // Open the DevTools.
  if (isDev) {
    win.webContents.openDevTools();
  }
}

// about window
function createAboutWindow() {
  const aboutWin = new BrowserWindow({
    width: 300,
    height: 300,
  });

  aboutWin.loadFile("./render/about.html");
}

// create main window when the app is ready
app.whenReady().then(() => {
  createMainWindow();

  // implement menu
  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu);

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

// menu tamplate
const menu = [
  ...(isMac
    ? [
        {
          label: app.name,
          submenu: [
            {
              label: "About",
              click: createAboutWindow,
            },
          ],
        },
      ]
    : []),
  {
    label: "File",
    submenu: [
      {
        label: "Quit",
        click: () => app.quit(),
        accelerator: "CmdOrCtrl+W",
      },
    ],
  },
  ...(!isMac
    ? [
        {
          label: "Help",
          submenu: [
            {
              label: "About",
              click: createAboutWindow,
            },
          ],
        },
      ]
    : []),
  // {
  //   role: "fileMenu",
  // },
];

app.on("window-all-closed", () => {
  if (!isMac) app.quit();
});
