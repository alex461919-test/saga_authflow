import React, { useCallback, useEffect, useState } from 'react';
import { Form, Input, Button, Checkbox, Row, Col, Space, Typography } from 'antd';
import { useAuthState, useProfile } from './store';
import { AuthStatus, Credential } from './store/auth';
import { useDispatch } from 'react-redux';
import { onGetProfile, onLogin, onLogout } from './store/reducers';
import jwt_decode from 'jwt-decode';

const { Title } = Typography;

const Auth: React.FC = () => {
  return (
    <Row gutter={[8, 8]}>
      <Col xs={{ span: 6 }}>
        <div style={{ padding: '1rem', margin: '1rem', border: '1px solid #e0e0e0', borderRadius: '.25rem' }}>
          <AuthForm />
        </div>
      </Col>
      <Col span={6}>
        <div style={{ padding: '1rem', margin: '1rem', border: '1px solid #e0e0e0', borderRadius: '.25rem' }}>
          <Title level={4} style={{ textAlign: 'center' }}>
            Auth state
          </Title>
          <Profile />
        </div>
      </Col>
      <Col span={6}>
        <div style={{ padding: '1rem', margin: '1rem', border: '1px solid #e0e0e0', borderRadius: '.25rem' }}>
          <Title level={4} style={{ textAlign: 'center' }}>
            Profile request
          </Title>
          <Whoami />
        </div>
      </Col>
    </Row>
  );
};

const Whoami: React.FC = () => {
  const dispatch = useDispatch();

  const onClick: React.MouseEventHandler<HTMLElement> = useCallback(
    (event) => {
      dispatch(onGetProfile());
    },
    [dispatch]
  );

  return (
    <Button type="primary" htmlType="button" onClick={onClick}>
      Get profile
    </Button>
  );
};

const Profile: React.FC = () => {
  const auth = useAuthState();
  const [, forceRender] = useState({});

  useEffect(() => {
    const timer = setInterval(() => forceRender({}), 1000);
    return () => clearInterval(timer);
  }, []);

  const token = auth.token?.split(' ')[1];
  const decodedToken: any = token ? jwt_decode(token) : null;
  const exp = decodedToken?.exp ? Math.floor(decodedToken.exp - Date.now() / 1000) + ' сек.' : null;

  return (
    <>
      {Object.entries(auth.profile ?? {}).map((item) => (
        <Row gutter={[16, 0]} key={item[0] + '_key'}>
          <Col span={8} style={{ textAlign: 'right' }}>
            {item[0] + ':'}
          </Col>
          <Col span={16}>{item[1]}</Col>
        </Row>
      ))}
      <Row gutter={[16, 0]}>
        <Col span={8} style={{ textAlign: 'right' }}>
          status:
        </Col>
        <Col span={16}>{auth.status}</Col>
      </Row>
      <Row gutter={[16, 0]}>
        <Col span={8} style={{ textAlign: 'right' }}>
          error:
        </Col>
        <Col span={16}>{auth.error}</Col>
      </Row>
      <Row gutter={[16, 0]}>
        <Col span={8} style={{ textAlign: 'right' }}>
          token:
        </Col>
        <Col span={16}>{auth.token ? '✅' : '❌'}</Col>
      </Row>
      <Row gutter={[16, 0]}>
        <Col span={8} style={{ textAlign: 'right' }}>
          token expire:
        </Col>
        <Col span={16}>{exp}</Col>
      </Row>
    </>
  );
};

const AuthForm = () => {
  const dispatch = useDispatch();
  const auth = useAuthState();
  const onFinish = (values: Credential) => {
    dispatch(onLogin(values));
  };
  const onLogoutClick: React.MouseEventHandler<HTMLElement> = useCallback(
    (event) => {
      dispatch(onLogout());
    },
    [dispatch]
  );

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };

  return (
    <Form
      name="basic"
      labelCol={{
        flex: '8rem',
      }}
      wrapperCol={{
        flex: 1,
      }}
      initialValues={{
        remember: true,
      }}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      autoComplete="off"
    >
      <Title level={4} style={{ textAlign: 'center', marginBottom: '1rem' }}>
        Authorization
      </Title>
      <Form.Item
        label="Username"
        name="username"
        rules={[
          {
            required: true,
            message: 'Please input your username!',
          },
        ]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label="Password"
        name="password"
        style={{ flexWrap: 'nowrap' }}
        rules={[
          {
            required: true,
            message: 'Please input your password!',
          },
        ]}
      >
        <Input.Password />
      </Form.Item>
      {auth.status === AuthStatus.Error ? (
        <div style={{ marginTop: '-.5rem', marginBottom: '1rem', color: 'red', textAlign: 'center' }}>
          <span>{auth.error}</span>
        </div>
      ) : (
        <></>
      )}

      <Form.Item>
        <Space direction="horizontal" style={{ width: '100%', justifyContent: 'flex-start', paddingLeft: '8rem' }}>
          <Button type="primary" htmlType="submit">
            Sign In
          </Button>
          <Button type="primary" htmlType="button" onClick={onLogoutClick}>
            Sign Out
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};
/*
  <Form.Item name="remember" valuePropName="checked">
        <Space direction="horizontal" style={{ width: '100%', justifyContent: 'flex-start', paddingLeft: '8rem' }}>
          <Checkbox>Remember me</Checkbox>
        </Space>
      </Form.Item>

*/

export default Auth;
