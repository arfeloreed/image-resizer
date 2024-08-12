import { app, BrowserWindow, Menu, ipcMain, shell } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import os from "os";
import fs from "fs";
import resizeImg from "resize-img";

const isDev = process.env.NODE_ENV !== "production";
const isMac = process.platform === "darwin";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
let win;

// main window
function createMainWindow() {
  win = new BrowserWindow({
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
  // for preload setup
  ipcMain.handle("homedir", () => os.homedir());
  ipcMain.handle("join", (...args) => {
    const paths = args[1];
    return path.join(...paths);
  });
  // create the main window when ready
  createMainWindow();

  // implement menu
  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu);

  // remove win var for main window from memory on close
  win.on("closed", () => (win = null));

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

// response to ipcRenderer resize image
ipcMain.on("image:resize", (e, options) => {
  options.dest = path.join(os.homedir(), "Pictures");
  resizeImage(options);
});

// resize the image
async function resizeImage({ imgPath, width, height, dest }) {
  try {
    const newImg = await resizeImg(fs.readFileSync(imgPath), {
      width: +width,
      height: +height,
    });
    // create filename
    const filename = path.basename(imgPath);
    // create destination folder if doesn't exists
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest);
    }
    // write file to destination folder
    fs.writeFileSync(path.join(dest, filename), newImg);
    // send success notification to user
    win.webContents.send("resize:done");
    // open the destination folder
    shell.openPath(dest);
  } catch (err) {
    console.log("\nAn error occured while resizing the image; ", err);
  }
}

app.on("window-all-closed", () => {
  if (!isMac) app.quit();
});
