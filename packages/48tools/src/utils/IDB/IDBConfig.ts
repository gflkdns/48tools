/* 数据库配置 */
export interface ObjectStoreItem {
  name: string;
  key: string;
  data: Array<string>;
}

export interface IDBConfig {
  name: string;
  version: number;
  objectStore: Array<ObjectStoreItem>;
}

const dbConfig: IDBConfig = {
  name: '48tools',
  version: 6,
  objectStore: [
    // b站直播间信息
    {
      name: 'bilibili_live',
      key: 'id',
      data: ['description', 'roomId', 'autoRecord']
    },

    // a站直播间信息
    {
      name: 'acfun_live',
      key: 'id',
      data: ['description', 'roomId']
    },

    // 一些配置
    {
      name: 'options',
      key: 'name',
      data: ['value']
    },

    // 微博登陆列表
    {
      name: 'weibo_login_list',
      key: 'id',
      data: ['username', 'cookie', 'lastLoginTime']
    },
    // ffmpeg命令模板
    {
      name: 'ffmpeg_template',
      key: 'id',
      data: ['name', 'args']
    }
  ]
};

export default dbConfig;