import { randomUUID } from 'node:crypto';
import { Fragment, useState, type ReactElement, type Dispatch as D, type SetStateAction as S, type MouseEvent } from 'react';
import { useDispatch } from 'react-redux';
import type { Dispatch } from '@reduxjs/toolkit';
import { Button, Form, Modal, Input, type FormInstance } from 'antd';
import type { Store } from 'antd/es/form/interface';
import { IDBSaveAcFunLiveList } from '../reducers/live';

/* 添加一个A站直播间 */
function AddForm(props: {}): ReactElement {
  const dispatch: Dispatch = useDispatch();
  const [form]: [FormInstance] = Form.useForm();
  const [visible, setVisible]: [boolean, D<S<boolean>>] = useState(false);

  // 添加一个直播间
  async function handleAddRoomIdClick(event: MouseEvent): Promise<void> {
    let formValue: Store;

    try {
      formValue = await form.validateFields();
    } catch (err) {
      return console.error(err);
    }

    dispatch(IDBSaveAcFunLiveList({
      data: {
        ...formValue,
        id: randomUUID()
      }
    }));
    setVisible(false);
  }

  // 关闭窗口后重置表单
  function handleAddModalClose(): void {
    form.resetFields();
  }

  // 打开弹出层
  function handleOpenAddModalClick(event: MouseEvent): void {
    setVisible(true);
  }

  // 关闭弹出层
  function handleCloseAddModalClick(event: MouseEvent): void {
    setVisible(false);
  }

  return (
    <Fragment>
      <Button type="primary" data-test-id="acfun-add-live-id-btn" onClick={ handleOpenAddModalClick }>添加直播间信息</Button>
      <Modal bodyStyle={{ height: '150px' }}
        title="添加B站直播间信息"
        open={ visible }
        width={ 500 }
        afterClose={ handleAddModalClose }
        onOk={ handleAddRoomIdClick }
        onCancel={ handleCloseAddModalClick }
      >
        <Form form={ form } labelCol={{ span: 5 }} wrapperCol={{ span: 19 }}>
          <Form.Item name="description"
            label="直播间说明"
            rules={ [{ required: true, message: '请填写直播间说明', whitespace: true }] }
          >
            <Input />
          </Form.Item>
          <Form.Item name="roomId"
            label="直播间ID"
            rules={ [{ required: true, message: '请填写直播间ID', whitespace: true }] }
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </Fragment>
  );
}

export default AddForm;