const { app, BrowserWindow } = require('electron');
const path = require('node:path');
const { spawn } = require('node:child_process');

let physics;
function createWindow() {
  const win = new BrowserWindow({
    width: 1440, height: 960, minWidth: 860, minHeight: 640,
    backgroundColor: '#0e1218',
    webPreferences: { preload: path.join(__dirname, 'preload.cjs'), contextIsolation: true, nodeIntegration: false, sandbox: true },
  });
  win.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({ responseHeaders: {
      ...details.responseHeaders,
      'Content-Security-Policy': ["default-src 'self' data: blob:; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self' http://127.0.0.1:8765; object-src 'none'; base-uri 'self'"]
    } });
  });
  const index = path.resolve(__dirname, '../../web/dist/index.html');
  win.loadFile(index);
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  win.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith('file://')) event.preventDefault();
  });
}
app.whenReady().then(() => {
  const engine = path.resolve(__dirname, '../../../physics-engine/app/server.py');
  physics = spawn(process.env.PYTHON || 'python3', [engine], { stdio: 'ignore', windowsHide: true });
  physics.on('error', () => {});
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('before-quit', () => { if (physics && !physics.killed) physics.kill(); });
