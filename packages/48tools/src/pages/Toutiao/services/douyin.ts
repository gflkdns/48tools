import got, { type Response as GotResponse } from 'got';
import { rStr, pcUserAgent } from '../../../utils/utils';
import * as toutiaosdk from '../Douyin/sdk/toutiaosdk';
import type { AwemePostResponse } from './interface';
import type { VideoQuery } from '../types';


// 抖音可能返回中间页，需要根据cookie判断一下
export interface DouyinVideo {
  type: 'html' | 'cookie';
  value: string;
  body: string;
}

/**
 * 获取抖音网页的html
 * @param { string } id: 视频id
 * @param { string } cookie: __ac_nonce和__ac_signature
 */
export async function requestDouyinVideoHtml(id: string, cookie: string = ''): Promise<DouyinVideo> {
  const res: GotResponse<string> = await got.get(`https://www.douyin.com/video/${ id }`, {
    responseType: 'text',
    headers: {
      'User-Agent': pcUserAgent,
      Cookie: '__ac_referer=__ac_blank;' + cookie,
      Host: 'www.douyin.com'
    }
  });

  // 判断是否有__ac_nonce
  if (res.headers['set-cookie']) {
    const val: string | undefined = res.headers['set-cookie'].find((o: string): boolean => o.includes('__ac_nonce'));

    if (val) {
      return {
        type: 'cookie',
        value: val.split(/s*;s*/)[0].split(/=/)[1],
        body: res.body
      };
    }
  }

  return {
    type: 'html',
    value: res.body,
    body: res.body
  };
}

type RequestDouyinHtmlReturn =
  (urlCb: string | ((url?: string) => string), cookie?: string) => Promise<DouyinVideo>;

/**
 * 获取抖音网页的html
 * @param { string } url: 抖音地址
 */
function requestDouyinHtml(url?: string): RequestDouyinHtmlReturn {
  async function _requestDouyinHtml(urlCb: string | ((url?: string) => string), cookie: string = ''): Promise<DouyinVideo> {
    const uri: string = typeof urlCb === 'function' ? urlCb(url) : urlCb;
    const res: GotResponse<string> = await got.get(uri, {
      responseType: 'text',
      headers: {
        'User-Agent': pcUserAgent,
        Cookie: '__ac_referer=__ac_blank;' + cookie,
        Host: new URL(uri).host
      },
      followRedirect: false
    });

    const acNonceStr: string | undefined = res?.headers?.['set-cookie']?.find?.(
      (o: string): boolean => o.includes('__ac_nonce'));

    return acNonceStr ? {
      type: 'cookie',
      value: acNonceStr.split(/s*;s*/)[0].split(/=/)[1],
      body: res.body
    } : {
      type: 'html',
      value: res.body,
      body: res.body
    };
  }

  return _requestDouyinHtml;
}

export const requestDouyinVideo: RequestDouyinHtmlReturn = requestDouyinHtml('https://www.douyin.com/video/');
export const requestDouyinUser: RequestDouyinHtmlReturn = requestDouyinHtml('https://www.douyin.com/user/');
export const requestDouyinUrl: RequestDouyinHtmlReturn = requestDouyinHtml();

/**
 * 抖音302地址的处理
 * @param { string } uri
 */
export async function requestGetVideoRedirectUrl(uri: string): Promise<string> {
  const res: GotResponse<string> = await got.get(uri, {
    responseType: 'text',
    headers: {
      Host: 'www.douyin.com',
      'User-Agent': pcUserAgent
    },
    followRedirect: false
  });

  return res.body;
}

/**
 * 请求user的视频列表
 * @param { string } cookie: string
 * @param { VideoQuery } videoQuery: user id
 */
export async function requestAwemePost(cookie: string, videoQuery: VideoQuery): Promise<AwemePostResponse> {
  const frontierSign: { 'X-Bogus'?: string } = {};

  await toutiaosdk.webmssdkES5('frontierSign', [frontierSign]);

  const urlParam: URLSearchParams = new URLSearchParams({
    device_platform: 'webapp',
    aid: '6383',
    channel: 'channel_pc_web',
    sec_user_id: videoQuery.secUserId,
    max_cursor: `${ videoQuery.maxCursor }`,
    locate_query: 'false',
    show_live_replay_strategy: '1',
    count: '10',
    publish_video_strategy_type: '2',
    pc_client_type: '1',
    version_code: '170400',
    version_name: '17.4.0',
    cookie_enabled: 'true',
    screen_width: '1440',
    screen_height: '900',
    browser_language: 'zh-CN',
    browser_platform: 'MacIntel',
    browser_name: 'Edge',
    browser_version: '109.0.1518.52',
    browser_online: 'true',
    engine_name: 'Blink',
    engine_version: '109.0.0.0',
    os_name: 'Mac+OS',
    os_version: '10.15.7',
    cpu_core_num: '4',
    device_memory: '8',
    platform: 'PC',
    downlink: '0.95',
    effective_type: '3g',
    round_trip_time: '650',
    webid: videoQuery.webId,
    msToken: `${ rStr(36) }-${ rStr(43) }-${ rStr(47) }`,
    'X-Bogus': frontierSign['X-Bogus']!
  });

  const res: GotResponse<AwemePostResponse> = await got.get(
    `https://www.douyin.com/aweme/v1/web/aweme/post/?${ urlParam.toString() }`, {
      responseType: 'json',
      headers: {
        Referer: `https://www.douyin.com/user/${ videoQuery.secUserId }`,
        Host: 'www.douyin.com',
        'User-Agent': pcUserAgent,
        Cookie: cookie
      },
      followRedirect: false
    });

  return res.body;
}