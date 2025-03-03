import { createSlice, type Slice, type SliceCaseReducers, type PayloadAction } from '@reduxjs/toolkit';
import type { DataDispatchFunc, CursorDispatchFunc, QueryDispatchFunc } from '@indexeddb-tools/indexeddb-redux';
import IDBRedux, { acfunLiveObjectStoreName } from '../../../utils/IDB/IDBRedux';
import type { WebWorkerChildItem, IDBActionFunc } from '../../../commonTypes';
import type { LiveItem } from '../types';

export interface AcFunLiveInitialState {
  acfunLiveList: Array<LiveItem>;
  liveWorkers: Array<WebWorkerChildItem>;
}

type CaseReducers = SliceCaseReducers<AcFunLiveInitialState>;

const { actions, reducer }: Slice = createSlice<AcFunLiveInitialState, CaseReducers, 'acfunLive'>({
  name: 'acfunLive',
  initialState: {
    acfunLiveList: [], // 配置的acfun直播间信息
    liveWorkers: []    // 正在录制的线程
  },
  reducers: {
    // 获取直播间列表
    setAcFunLiveList(state: AcFunLiveInitialState, action: PayloadAction<{ result: Array<LiveItem> }>): void {
      state.acfunLiveList = action.payload.result;
    },

    // 直播间列表内添加一个直播间
    setAcFunLiveListAddRoom(state: AcFunLiveInitialState, action: PayloadAction<{ data: LiveItem }>): void {
      state.acfunLiveList = state.acfunLiveList.concat([action.payload.data]);
    },

    // 直播间列表内删除一个直播间
    setAcFunListDeleteRoom(state: AcFunLiveInitialState, action: PayloadAction<{ query: string }>): void {
      const index: number = state.acfunLiveList.findIndex((o: LiveItem): boolean => o.id === action.payload.query);

      if (index >= 0) {
        const newBilibiliLiveList: Array<LiveItem> = [...state.acfunLiveList];

        newBilibiliLiveList.splice(index, 1);
        state.acfunLiveList = newBilibiliLiveList;
      }
    },

    // 添加一个直播下载队列
    setAddLiveWorker(state: AcFunLiveInitialState, action: PayloadAction<WebWorkerChildItem>): void {
      state.liveWorkers = state.liveWorkers.concat([action.payload]);
    },

    // 删除一个直播下载队列
    setDeleteLiveWorker(state: AcFunLiveInitialState, action: PayloadAction<LiveItem>): void {
      const index: number = state.liveWorkers.findIndex((o: WebWorkerChildItem): boolean => o.id === action.payload.id);

      if (index >= 0) {
        state.liveWorkers.splice(index, 1);
        state.liveWorkers = [...state.liveWorkers];
      }
    }
  }
});

export const {
  setAcFunLiveList,
  setAcFunLiveListAddRoom,
  setAcFunListDeleteRoom,
  setAddLiveWorker,
  setDeleteLiveWorker
}: Record<string, Function> = actions;

// 保存数据
export const IDBSaveAcFunLiveList: DataDispatchFunc = IDBRedux.putAction({
  objectStoreName: acfunLiveObjectStoreName,
  successAction: setAcFunLiveListAddRoom as IDBActionFunc
});

// 请求所有列表
export const IDBCursorAcFunLiveList: CursorDispatchFunc = IDBRedux.cursorAction({
  objectStoreName: acfunLiveObjectStoreName,
  successAction: setAcFunLiveList as IDBActionFunc
});

// 删除
export const IDBDeleteAcFunLiveList: QueryDispatchFunc = IDBRedux.deleteAction({
  objectStoreName: acfunLiveObjectStoreName,
  successAction: setAcFunListDeleteRoom as IDBActionFunc
});

export default { acfunLive: reducer };