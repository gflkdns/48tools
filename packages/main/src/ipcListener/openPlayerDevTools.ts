import { ipcMain, type IpcMainEvent } from 'electron';
import { playerWindowMaps } from './openPlayerHtml';

export const type: string = 'player-developer-tools';

/* 根据当前窗口的唯一id打开子窗口的开发者工具 */
function openPlayerDevTools(): void {
  /**
   * @param { IpcMainEvent } event
   * @param { string } pid: 当前窗口的唯一id
   */
  ipcMain.on(type, function(event: IpcMainEvent, pid: string): void {
    playerWindowMaps.get(pid)?.webContents.openDevTools();
  });
}

export default openPlayerDevTools;