import type { Dispatch as D, SetStateAction as S } from 'react';
import type { MessageInstance } from 'antd/es/message/interface';
import type { AwemeItem } from './services/interface';

type noProtocolUrl = `//${ string }`;

export interface VideoInfoItem {
  bitRateList: Array<{
    playApi: noProtocolUrl;
    playAddr: Array<{
      src: noProtocolUrl;
    }>;
    width: number;
    height: number;
  }>;
  playAddr: Array<{
    src: noProtocolUrl;
  }>;
  playApi: noProtocolUrl; // 无水印
  ratio: string;
  cover: noProtocolUrl;
  coverUrlList: Array<string>;
}

export interface AwemeDetail {
  desc: string; // 标题
  download: {
    prevent?: boolean;
    url?: string; // 有水印
  };
  video: VideoInfoItem;
}

export interface C0Obj {
  odin: object;
  user: object;
}

export interface CVersionObj {
  aweme: {
    detail: AwemeDetail;
  };
}

export interface ScriptRendedData {
  _location: string;
  C_0: C0Obj;
  [key: `c_${ number }`]: CVersionObj;
}

export interface DownloadUrlItem {
  value: string;
  label: string;
  width?: number;
  height?: number;
}

/* 下载相关 */
export interface DownloadItem {
  qid: string;   // 当前的下载id，随机
  url: string;   // 下载地址
  title: string; // 视频标题
  width?: number;
  height?: number;
}

/* 解析头条验证码 */
export interface VerifyData {
  code: string;
  detail: string;
  fp: `verify_${ string }`;
  from: string;
  region: string;
  server_sdk_env: string;
  subtype: 'slide';
  type: 'verify';
  verify_event: string;
  version: string;
}

/* user相关 */
export interface UserItem1 {
  odin: {
    user_id: string;
    user_is_auth: number;
    user_type: number;
    user_unique_id: string;
  };
  logId: string;
  pathname: string;
}

export interface UserDataItem {
  awemeId: string;
  desc: string;
  video: VideoInfoItem;
  createTime: number;
  tag: {
    inReviewing: boolean;
    isStory: boolean;
    isTop: boolean;
    relationLabels: boolean;
    reviewStatus: number;
  };
}

export interface UserItem2 {
  uid: string;
  post: {
    cursor: number;
    maxCursor: number;
    minCursor: number;
    data: Array<UserDataItem>;
    hasMore: 1 | 0;
  };
  user: {
    user: {
      customVerify: string;
      desc: string;
      nickname: string;
      uid: string;
      uniqueId: string;
      secUid: string;
    };
  };
}

export interface UserScriptRendedData {
  _location: string;
  [key: `${ number }`]: UserItem1 | UserItem2;
}

export interface VideoQuery {
  secUserId: string;
  maxCursor: number;
  webId: string;
  hasMore: 1 | 0;
}

/* context */
export interface GetVideoUrlOnionContext {
  messageApi: MessageInstance;
  html?: string;
  cookie?: string;
  type?: 'video' | 'user';
  value: string;
  id?: string;
  setUrlLoading: D<S<boolean>>;
  setVisible: D<S<boolean>>;
  setDownloadUrl: D<S<DownloadUrlItem[]>>;
  setTitle: D<S<string>>;
  setUserModalVisible: D<S<boolean>>;
  setUserVideoList: D<S<(UserDataItem | AwemeItem)[]>>;
  setVideoQuery: D<S<VideoQuery | undefined>>;
  setUserTitle: D<S<string>>;
}