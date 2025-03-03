import {
  createSlice,
  createEntityAdapter,
  type Slice,
  type SliceCaseReducers,
  type EntityAdapter,
  type EntityState,
  type EntitySelectors, PayloadAction
} from '@reduxjs/toolkit';
import type { DataDispatchFunc, CursorDispatchFunc, QueryDispatchFunc } from '@indexeddb-tools/indexeddb-redux';
import IDBRedux, { ffmpegTemplateObjectStore } from '../../../utils/IDB/IDBRedux';
import type { IDBActionFunc } from '../../../commonTypes';
import type { ProcessItem, dbTemplateItem } from '../types';

// 下载列表
export const ffmpegProcessListAdapter: EntityAdapter<ProcessItem> = createEntityAdapter({
  selectId: (item: ProcessItem): string => item.id
});
export const ffmpegProcessListSelectors: EntitySelectors<ProcessItem, EntityState<ProcessItem>>
  = ffmpegProcessListAdapter.getSelectors();

export interface FFmpegProcessInitialState extends EntityState<ProcessItem> {
  dbTemplateList: Array<dbTemplateItem>;
}

type CaseReducers = SliceCaseReducers<FFmpegProcessInitialState>;

const { actions, reducer }: Slice = createSlice<FFmpegProcessInitialState, CaseReducers, 'FFmpegProcess'>({
  name: 'FFmpegProcess',
  initialState: ffmpegProcessListAdapter.getInitialState({
    dbTemplateList: []
  }),
  reducers: {
    setAddProcess: ffmpegProcessListAdapter.addOne,
    setDeleteProcess: ffmpegProcessListAdapter.removeOne,
    setUpdateProcess: ffmpegProcessListAdapter.updateOne,

    // 获取template列表
    setTemplateList(state: FFmpegProcessInitialState, action: PayloadAction<{ result: Array<dbTemplateItem> }>): void {
      state.dbTemplateList = action.payload.result;
    },

    // 添加一个template
    setAddTemplate(state: FFmpegProcessInitialState, action: PayloadAction<{ data: dbTemplateItem }>): void {
      state.dbTemplateList = state.dbTemplateList.concat([action.payload.data]);
    },

    // 删除一个template
    setDeleteTemplate(state: FFmpegProcessInitialState, action: PayloadAction<{ query: string }>): void {
      const index: number = state.dbTemplateList.findIndex((o: dbTemplateItem): boolean => o.id === action.payload.query);

      if (index >= 0) {
        const newDBTemplateList: Array<dbTemplateItem> = [...state.dbTemplateList];

        newDBTemplateList.splice(index, 1);
        state.dbTemplateList = newDBTemplateList;
      }
    }
  }
});

export const {
  setAddProcess,
  setDeleteProcess,
  setUpdateProcess,
  setTemplateList,
  setAddTemplate,
  setDeleteTemplate
}: Record<string, Function> = actions;

// 保存数据
export const IDBSaveTemplateList: DataDispatchFunc = IDBRedux.putAction({
  objectStoreName: ffmpegTemplateObjectStore,
  successAction: setAddTemplate as IDBActionFunc
});

// 请求所有列表
export const IDBCursorTemplateList: CursorDispatchFunc = IDBRedux.cursorAction({
  objectStoreName: ffmpegTemplateObjectStore,
  successAction: setTemplateList as IDBActionFunc
});

// 删除数据
export const IDBDeleteTemplateList: QueryDispatchFunc = IDBRedux.deleteAction({
  objectStoreName: ffmpegTemplateObjectStore,
  successAction: setDeleteTemplate as IDBActionFunc
});

export default { FFmpegProcess: reducer };