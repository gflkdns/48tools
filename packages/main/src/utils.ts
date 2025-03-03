import * as process from 'node:process';
import * as path from 'node:path';
import * as fs from 'node:fs';

/* 判断是开发环境还是生产环境 */
export const isDevelopment: boolean = process.env.NODE_ENV === 'development';

/* 判断是否是测试环境 */
export const isTest: boolean = process.env.TEST === 'true';

/* 文件夹路径 */
export const wwwPath: string = path.join(__dirname, '../..');

/* 生成initialState */
export function initialState(value: any): string {
  return encodeURIComponent(JSON.stringify(value));
}

/* 获取package.json文件的位置 */
const packageJsonPath: Array<string> = [
  path.join(__dirname, '../package.json'),
  path.join(__dirname, '../../package.json')
];
let packageJsonPathIndex: number = isDevelopment ? 0 : 1;

if (!fs.existsSync(packageJsonPath[packageJsonPathIndex])) {
  packageJsonPathIndex = packageJsonPathIndex === 1 ? 0 : 1;
}

export const packageJson: any = require(packageJsonPath[packageJsonPathIndex]);