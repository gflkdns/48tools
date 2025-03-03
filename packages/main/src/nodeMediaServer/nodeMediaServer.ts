import * as path from 'node:path';
import * as process from 'node:process';
import { Worker } from 'node:worker_threads';
import { ipcMain, type IpcMainEvent } from 'electron';
import { isDevelopment } from '../utils';

export const type: string = 'node-media-server';
let nodeMediaServerWorker: Worker | null = null; // node-media-server服务线程

export interface NodeMediaServerArg {
  ffmpeg: string;   // ffmpeg路径
  rtmpPort: number; // rtmp端口号
  httpPort: number; // http端口号
}

/* 关闭node-media-server服务 */
export async function nodeMediaServerClose(): Promise<void> {
  if (nodeMediaServerWorker) {
    await nodeMediaServerWorker.terminate();
    nodeMediaServerWorker = null;
  }
}

/* 新线程启动node-media-server服务 */
function nodeMediaServer(): void {
  ipcMain.on(type, async function(event: IpcMainEvent, arg: NodeMediaServerArg): Promise<void> {
    await nodeMediaServerClose(); // electron在开发者工具刷新时，已存在的node-media-server会有问题，所以需要重新创建服务

    // 对多线程的处理，参考https://github.com/electron/electron/issues/22446
    nodeMediaServerWorker = new Worker(
      isDevelopment
        ? path.join(__dirname, 'server.worker.js')
        : path.join(process.resourcesPath, 'app.asar.unpacked/bin/lib/nodeMediaServer/server.worker.js'),
      {
        workerData: {
          ...arg,
          isDevelopment
        }
      }
    );
  });
}

export default nodeMediaServer;