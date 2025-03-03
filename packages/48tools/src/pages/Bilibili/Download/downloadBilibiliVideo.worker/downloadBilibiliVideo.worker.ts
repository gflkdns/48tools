import { pipeline } from 'node:stream/promises';
import * as fs from 'node:fs';
import got, { type Headers } from 'got';
import type { ProgressEventData } from '../../types';

type WorkerEventData = {
  type: 'start';
  filePath: string;
  durl: string;
  qid: string;
  headers?: Headers;
};

export type MessageEventData = {
  type: 'success' | 'progress';
  qid: string;
  data: number;
};

/**
 * 下载文件
 * @param { string } fileUrl: 文件url地址
 * @param { string } filename: 文件本地地址
 * @param { Headers | undefined } headers: 文件本地地址
 * @param { (e: ProgressEventData) => void } onProgress: 进度条
 */
async function requestDownloadFileByStream(
  fileUrl: string,
  filename: string,
  headers: Headers | undefined,
  onProgress: (e: ProgressEventData) => void
): Promise<void> {
  await pipeline(
    got.stream(fileUrl, {
      headers: headers ?? {
        referer: 'https://www.bilibili.com/'
      }
    }).on('downloadProgress', onProgress),
    fs.createWriteStream(filename)
  );
}

/**
 * 下载视频或者音频
 * @param { string } qid: qid
 * @param { string } durl: 文件的网络地址
 * @param { string } filePath: 保存位置
 * @param { Headers } headers: 重新定义headers
 */
function download(qid: string, durl: string, filePath: string, headers?: Headers): void {
  requestDownloadFileByStream(durl, filePath, headers, function(e: ProgressEventData): void {
    if (e.percent >= 1) {
      postMessage({ type: 'success', qid });
    } else {
      postMessage({
        type: 'progress',
        data: Math.floor(e.percent * 100),
        qid
      });
    }
  });
}

addEventListener('message', function(event: MessageEvent<WorkerEventData>): void {
  const { type, filePath, durl, qid, headers }: WorkerEventData = event.data;

  if (type === 'start') {
    download(qid, durl, filePath, headers);
  }
});