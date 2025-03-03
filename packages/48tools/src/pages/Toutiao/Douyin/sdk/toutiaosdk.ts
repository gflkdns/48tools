import loadScript from '../../../../utils/loadScript';

/* 头条sdk */
let bytedAcrawler: any;

export async function acrawler(functionName: string, args: any[]): Promise<any> {
  if (!bytedAcrawler) {
    await loadScript(require('./toutiaosdk-acrawler.js'), 'acrawler');
    bytedAcrawler = globalThis.byted_acrawler;
  }

  return bytedAcrawler[functionName](...args);
}

/* 滑动验证码相关 */
let TTGCaptcha: any;

export async function captcha(functionName: string, args: any[]): Promise<any> {
  if (!TTGCaptcha) {
    await loadScript(require('./toutiaosdk-captcha.js'), 'captcha');
    TTGCaptcha = globalThis.TTGCaptcha;
  }

  return TTGCaptcha[functionName](...args);
}

/* 头条mssdk */
let webmssdk: any;

export async function webmssdkES5(functionName: string, args: any[]): Promise<any> {
  if (!webmssdk) {
    await loadScript(require('./toutiaosdk-webmssdk.es5.js'), 'webmssdk');
    webmssdk = globalThis.webmssdk;
  }

  return webmssdk[functionName](...args);
}