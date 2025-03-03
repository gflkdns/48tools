import { shell } from 'electron';
import {
  Fragment,
  useState,
  useEffect,
  type ReactElement,
  type ReactNode,
  type Dispatch as D,
  type SetStateAction as S,
  type MouseEvent
} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { Dispatch } from '@reduxjs/toolkit';
import { createStructuredSelector, type Selector } from 'reselect';
import { Select, Button, Space, List, Alert, Avatar, Tag, message } from 'antd';
import type { UseMessageReturnType } from '@48tools-types/antd';
import style from './index.sass';
import Content from '../../components/Content/Content';
import Header from '../../components/Header/Header';
import WeiboLogin from '../../functionalComponents/WeiboLogin/WeiboLogin';
import { IDBCursorAccountList } from '../../functionalComponents/WeiboLogin/reducers/weiboLogin';
import dbConfig from '../../utils/IDB/IDBConfig';
import weiboCheckIn from './weiboCheckIn';
import { setCheckIn, type WeiboSuperInitialState } from './reducers/weiboSuper';
import type { WeiboLoginInitialState } from '../../functionalComponents/WeiboLogin/reducers/weiboLogin';
import type { WeiboAccount } from '../../commonTypes';
import type { WeiboCheckinResult, Quantity } from './types';

/* redux selector */
type RSelector = WeiboLoginInitialState & WeiboSuperInitialState;
type RState = {
  weiboLogin: WeiboLoginInitialState;
  weiboSuper: WeiboSuperInitialState;
};

const selector: Selector<RState, RSelector> = createStructuredSelector({
  // 微博已登陆账号
  accountList: ({ weiboLogin }: RState): Array<WeiboAccount> => weiboLogin.accountList,

  // 登陆列表
  weiboCheckinList: ({ weiboSuper }: RState): Array<WeiboCheckinResult> => weiboSuper.weiboCheckinList,

  // 签到状态
  checkIn: ({ weiboSuper }: RState): boolean => weiboSuper.checkIn,

  // 已签到
  quantity: ({ weiboSuper }: RState): Quantity => weiboSuper.quantity
});

/* 微博超话签到 */
function Index(props: {}): ReactElement {
  const { accountList, weiboCheckinList, checkIn, quantity }: RSelector = useSelector(selector);
  const dispatch: Dispatch = useDispatch();
  const [messageApi, messageContextHolder]: UseMessageReturnType = message.useMessage();
  const [accountValue, setAccountValue]: [string | undefined, D<S<string | undefined>>] = useState(undefined);

  // 打开超话
  function handleOpenTopicLinkClick(link: string, event: MouseEvent<HTMLAnchorElement>): void {
    shell.openExternal(`https:${ link }`);
  }

  // 开始签到
  function handleWeiboCheckinStartClick(event: MouseEvent): void {
    const index: number = accountList.findIndex((o: WeiboAccount): boolean => o.id === accountValue);

    if (index >= 0) {
      dispatch(setCheckIn(true));
      weiboCheckIn(messageApi, accountList[index].cookie);
    }
  }

  // 停止签到
  function handleWeiboCheckinStopClick(event: MouseEvent): void {
    dispatch(setCheckIn(false));
  }

  // 渲染select
  function accountSelectRender(): Array<ReactNode> {
    return accountList.map((item: WeiboAccount, index: number): ReactElement => {
      return <Select.Option key={ item.id } value={ item.id }>{ item.username }</Select.Option>;
    });
  }

  // 渲染已签到列表
  function weiboCheckinListRender(item: WeiboCheckinResult): ReactElement {
    return (
      <List.Item key={ item.superId }>
        <List.Item.Meta avatar={ <Avatar src={ item.pic } /> }
          title={
            <a role="button"
              aria-label="打开超话"
              onClick={ (event: MouseEvent<HTMLAnchorElement>): void => handleOpenTopicLinkClick(item.link, event) }
            >
              { item.title }
            </a>
          }
          description={ <div className="pr-[16px] text-[12px]">{ item.content1 }</div> }
        />
        <Tag color={ item.code === 100000 ? '#87d068' : '#f50' }>{ item.result }</Tag>
      </List.Item>
    );
  }

  useEffect(function(): void {
    dispatch(IDBCursorAccountList({
      query: {
        indexName: dbConfig.objectStore[3].data[0]
      }
    }));
  }, []);

  return (
    <Fragment>
      <Content>
        <Header>
          <Space>
            <Select className={ style.accountSelect }
              value={ accountValue }
              disabled={ checkIn }
              onSelect={ (value: string): void => setAccountValue(value) }
            >
              { accountSelectRender() }
            </Select>
            {
              checkIn ? <Button type="primary" danger={ true } onClick={ handleWeiboCheckinStopClick }>停止签到</Button> : (
                <Button type="primary" disabled={ accountValue === undefined } onClick={ handleWeiboCheckinStartClick }>
                  超话签到
                </Button>
              )
            }
            <WeiboLogin />
          </Space>
        </Header>
        <Alert type="warning" message={ `已签到超话：${ quantity.checkedInLen }` } />
        <List size="small" dataSource={ weiboCheckinList } renderItem={ weiboCheckinListRender } />
      </Content>
      { messageContextHolder }
    </Fragment>
  );
}

export default Index;