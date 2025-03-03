import { createSlice, type Slice, type SliceCaseReducers, type PayloadAction } from '@reduxjs/toolkit';
import type { DataDispatchFunc, CursorDispatchFunc, QueryDispatchFunc } from '@indexeddb-tools/indexeddb-redux';
import IDBRedux, { bilibiliLiveObjectStoreName } from '../../../utils/IDB/IDBRedux';
import type { WebWorkerChildItem, IDBActionFunc } from '../../../commonTypes';
import type { LiveItem } from '../types';

export interface BilibiliLiveInitialState {
  bilibiliLiveList: Array<LiveItem>;
  liveChildList: Array<WebWorkerChildItem>;
  autoRecordTimer: NodeJS.Timer | null;
}

type CaseReducers = SliceCaseReducers<BilibiliLiveInitialState>;

const { actions, reducer }: Slice = createSlice<BilibiliLiveInitialState, CaseReducers, 'bilibiliLive'>({
  name: 'bilibiliLive',
  initialState: {
    bilibiliLiveList: [], // 数据库内获取的直播间列表
    liveChildList: [],    // 直播下载
    autoRecordTimer: null // 自动录制
  },
  reducers: {
    // 获取直播间列表
    setBilibiliLiveList(state: BilibiliLiveInitialState, action: PayloadAction<{ result: Array<LiveItem> }>): void {
      state.bilibiliLiveList = action.payload.result;
    },

    // 直播间列表内添加一个直播间
    setBilibiliLiveListAddRoom(state: BilibiliLiveInitialState, action: PayloadAction<{ data: LiveItem }>): void {
      state.bilibiliLiveList = state.bilibiliLiveList.concat([action.payload.data]);
    },

    // 直播间更新一个直播间
    setBilibiliLiveListUpdateRoom(state: BilibiliLiveInitialState, action: PayloadAction<{ data: LiveItem }>): void {
      const index: number = state.bilibiliLiveList.findIndex((o: LiveItem): boolean => o.id === action.payload.data.id);

      if (index >= 0) {
        const newBilibiliLiveList: Array<LiveItem> = [...state.bilibiliLiveList];

        newBilibiliLiveList[index].autoRecord = action.payload.data.autoRecord;
        state.bilibiliLiveList = newBilibiliLiveList;
      }
    },

    // 直播间列表内删除一个直播间
    setBilibiliLiveListDeleteRoom(state: BilibiliLiveInitialState, action: PayloadAction<{ query: string }>): void {
      const index: number = state.bilibiliLiveList.findIndex((o: LiveItem): boolean => o.id === action.payload.query);

      if (index >= 0) {
        const newBilibiliLiveList: Array<LiveItem> = [...state.bilibiliLiveList];

        newBilibiliLiveList.splice(index, 1);
        state.bilibiliLiveList = newBilibiliLiveList;
      }
    },

    // 添加一个直播下载队列
    setAddLiveBilibiliChildList(state: BilibiliLiveInitialState, action: PayloadAction<WebWorkerChildItem>): void {
      state.liveChildList = state.liveChildList.concat([action.payload]);
    },

    // 删除一个直播下载队列
    setDeleteLiveBilibiliChildList(state: BilibiliLiveInitialState, action: PayloadAction<LiveItem>): void {
      const index: number = state.liveChildList.findIndex((o: WebWorkerChildItem): boolean => o.id === action.payload.id);

      if (index >= 0) {
        state.liveChildList.splice(index, 1);
        state.liveChildList = [...state.liveChildList];
      }
    },

    // 设置自动直播
    setAutoRecordTimer(state: BilibiliLiveInitialState, action: PayloadAction<NodeJS.Timer | null>): void {
      state.autoRecordTimer = action.payload;
    }
  }
});

export const {
  setBilibiliLiveListAddRoom,
  setBilibiliLiveListUpdateRoom,
  setBilibiliLiveList,
  setBilibiliLiveListDeleteRoom,
  setAddLiveBilibiliChildList,
  setDeleteLiveBilibiliChildList,
  setAutoRecordTimer
}: Record<string, Function> = actions;

// 保存数据
export const IDBSaveBilibiliLiveList: DataDispatchFunc = IDBRedux.putAction({
  objectStoreName: bilibiliLiveObjectStoreName,
  successAction: setBilibiliLiveListAddRoom as IDBActionFunc
});

// 更新数据
export const IDBUpdateBilibiliLiveList: DataDispatchFunc = IDBRedux.putAction({
  objectStoreName: bilibiliLiveObjectStoreName,
  successAction: setBilibiliLiveListUpdateRoom as IDBActionFunc
});

// 请求所有列表
export const IDBCursorBilibiliLiveList: CursorDispatchFunc = IDBRedux.cursorAction({
  objectStoreName: bilibiliLiveObjectStoreName,
  successAction: setBilibiliLiveList as IDBActionFunc
});

// 删除
export const IDBDeleteBilibiliLiveList: QueryDispatchFunc = IDBRedux.deleteAction({
  objectStoreName: bilibiliLiveObjectStoreName,
  successAction: setBilibiliLiveListDeleteRoom as IDBActionFunc
});

export default { bilibiliLive: reducer };