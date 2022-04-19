import { Modal } from 'antd';

export function showModalConfirm(title: string, content: string | JSX.Element) {
  return new Promise<boolean>((resolve) => {
    Modal.confirm({
      title,
      content,
      onOk() {
        resolve(true);
      },
      onCancel() {
        resolve(false);
      },
    });
  });
}
export function showModalRetry(title: string, content: string | JSX.Element) {
  return new Promise<boolean>((resolve) => {
    Modal.confirm({
      title,
      content,
      okText: 'Retry',
      onOk() {
        resolve(true);
      },
      onCancel() {
        resolve(false);
      },
    });
  });
}
