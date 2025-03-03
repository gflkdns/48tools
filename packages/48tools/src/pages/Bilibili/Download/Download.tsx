import * as path from 'node:path';
import type { ParsedPath } from 'node:path';
import * as url from 'node:url';
import type { SaveDialogReturnValue } from 'electron';
import { Fragment, type ReactElement, type ReactNode, type MouseEvent } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { Dispatch } from '@reduxjs/toolkit';
import { createStructuredSelector, type Selector } from 'reselect';
import { Button, Table, Progress, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { UseMessageReturnType } from '@48tools-types/antd';
import { showSaveDialog } from '../../../utils/remote/dialog';
import getDownloadBilibiliVideoWorker from './downloadBilibiliVideo.worker/getDownloadBilibiliVideoWorker';
import type { MessageEventData } from './downloadBilibiliVideo.worker/downloadBilibiliVideo.worker';
import Header from '../../../components/Header/Header';
import BilibiliLogin from '../../../functionalComponents/BilibiliLogin/BilibiliLogin';
import AddForm, { bilibiliVideoTypesMap } from './AddForm/AddForm';
import AddBySearch from './AddBySearch/AddBySearch';
import {
  bilibiliDownloadListSelectors,
  setDeleteDownloadList,
  setDownloadProgress,
  type BilibiliDownloadInitialState
} from '../reducers/download';
import { requestDownloadFileByStream } from '../../48/services/pocket48';
import type { DownloadItem } from '../types';

/* redux selector */
type RSelector = Pick<BilibiliDownloadInitialState, 'downloadProgress'> & {
  downloadList: Array<DownloadItem>;
};
type RState = { bilibiliDownload: BilibiliDownloadInitialState };

const selector: Selector<RState, RSelector> = createStructuredSelector({
  // 下载任务列表
  downloadList: ({ bilibiliDownload }: RState): Array<DownloadItem> => bilibiliDownloadListSelectors.selectAll(bilibiliDownload),

  // 进度条列表
  downloadProgress: ({ bilibiliDownload }: RState): { [key: string]: number } => bilibiliDownload.downloadProgress
});

/* 视频下载 */
function Download(props: {}): ReactElement {
  const { downloadList, downloadProgress }: RSelector = useSelector(selector);
  const dispatch: Dispatch = useDispatch();
  const [messageApi, messageContextHolder]: UseMessageReturnType = message.useMessage();

  // 下载封面
  async function handleDownloadPicClick(item: DownloadItem, event: MouseEvent): Promise<void> {
    if (item.pic === undefined || item.pic === '') {
      return;
    }

    try {
      const urlResult: url.URL = new url.URL(item.pic);
      const parseResult: ParsedPath = path.parse(urlResult.pathname);
      const result: SaveDialogReturnValue = await showSaveDialog({
        defaultPath: `[B站封面下载]${ item.type }${ item.id }${ parseResult.ext }`
      });

      if (result.canceled || !result.filePath) return;

      await requestDownloadFileByStream(item.pic, result.filePath);
      messageApi.success('图片下载完成！');
    } catch (err) {
      console.error(err);
    }
  }

  // 下载
  async function handleDownloadClick(item: DownloadItem, event: MouseEvent): Promise<void> {
    try {
      const urlResult: url.URL = new url.URL(item.durl);
      const parseResult: ParsedPath = path.parse(urlResult.pathname);
      const result: SaveDialogReturnValue = await showSaveDialog({
        defaultPath: `[B站下载]${ item.type }${ item.id }_${ item.page }${ parseResult.ext }`
      });

      if (result.canceled || !result.filePath) return;

      const worker: Worker = getDownloadBilibiliVideoWorker();

      worker.addEventListener('message', function(event1: MessageEvent<MessageEventData>): void {
        const { type }: MessageEventData = event1.data;

        requestIdleCallback((): void => {
          dispatch(setDownloadProgress(event1.data));

          if (type === 'success') {
            messageApi.success('下载完成！');
            worker.terminate();
          }
        });
      });

      worker.postMessage({
        type: 'start',
        filePath: result.filePath,
        durl: item.durl,
        qid: item.qid
      });
    } catch (err) {
      console.error(err);
      messageApi.error('视频下载失败！');
    }
  }

  // 删除一个任务
  function handleDeleteTaskClick(item: DownloadItem, event: MouseEvent): void {
    dispatch(setDeleteDownloadList(item.qid));
  }

  const columns: ColumnsType<DownloadItem> = [
    { title: 'ID', dataIndex: 'id' },
    {
      title: '下载类型',
      dataIndex: 'type',
      render: (value: string, record: DownloadItem, index: number): string => bilibiliVideoTypesMap[value]
    },
    { title: '分页', dataIndex: 'page' },
    {
      title: '下载进度',
      dataIndex: 'qid',
      render: (value: string, record: DownloadItem, index: number): ReactNode => {
        const inDownload: boolean = value in downloadProgress;

        if (inDownload) {
          return <Progress type="circle" width={ 30 } percent={ downloadProgress[value] } />;
        } else {
          return '等待下载';
        }
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 220,
      render: (value: undefined, record: DownloadItem, index: number): ReactElement => {
        const inDownload: boolean = record.qid in downloadProgress;

        return (
          <Button.Group>
            <Button disabled={ inDownload }
              onClick={ (event: MouseEvent): Promise<void> => handleDownloadClick(record, event) }
            >
              下载
            </Button>
            <Button disabled={ record.pic === undefined || record.pic === '' }
              onClick={ (event: MouseEvent): Promise<void> => handleDownloadPicClick(record, event) }
            >
              封面
            </Button>
            <Button type="primary"
              danger={ true }
              disabled={ inDownload }
              onClick={ (event: MouseEvent): void => handleDeleteTaskClick(record, event) }
            >
              删除
            </Button>
          </Button.Group>
        );
      }
    }
  ];

  return (
    <Fragment>
      <Header>
        <Button.Group>
          <BilibiliLogin />
          <AddBySearch />
          <AddForm />
        </Button.Group>
      </Header>
      <Table size="middle"
        columns={ columns }
        dataSource={ downloadList }
        bordered={ true }
        rowKey="qid"
        pagination={{
          showQuickJumper: true
        }}
      />
      { messageContextHolder }
    </Fragment>
  );
}

export default Download;