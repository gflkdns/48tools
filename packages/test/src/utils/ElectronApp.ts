import * as path from 'node:path';
import { _electron as electron, type ElectronApplication, type Page } from 'playwright';
import electronPath from 'electron/index.js';
import fse from 'fs-extra';
import { metaHelper } from '@sweet-milktea/utils';

const { __dirname }: { __dirname: string } = metaHelper(import.meta.url);

/* 获取electron相关的对象 */
class ElectronApp {
  electronApp: ElectronApplication;
  win: Page;
  mediaDir?: string;
  timer?: NodeJS.Timer;

  // 初始化
  async init(): Promise<void> {
    this.mediaDir && await fse.ensureDir(this.mediaDir);
    this.electronApp = await electron.launch({
      args: [path.join(__dirname, '../../../main/lib/main.js')],
      env: {
        NODE_ENV: 'development',
        TEST: 'true'
      },
      colorScheme: 'light',
      executablePath: electronPath
    });
    this.win = await this.electronApp.firstWindow();
  }

  // 关闭
  close(): Promise<void> {
    return this.electronApp.close();
  }
}

export default ElectronApp;