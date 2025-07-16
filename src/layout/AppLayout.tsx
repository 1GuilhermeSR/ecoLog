import { Button, Dropdown, Layout, Menu, MenuProps } from 'antd';
import { Outlet, useNavigate } from 'react-router-dom';
import styles from './styles.module.scss';
import { UserOutlined } from '@ant-design/icons';

const { Header, Content} = Layout;

export default function AppLayout() {
  const navigate = useNavigate();

  const menuItems: MenuProps['items'] = [
    { key: '1', label: 'Meu perfil' },
    { key: '2', label: 'Sair' },
  ];

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    switch (key) {
      case '1':
        navigate('/profile');
        break;
      case '2':
        navigate('/login');
        break;
    }
  };

  const perfilMenu = (
    <Menu
      onClick={handleMenuClick}
      items={menuItems}
      style={{ backgroundColor: '#ffffff' }}
      selectable={false}
    />
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>

      <Header style={{ display: 'flex', backgroundColor: 'white', padding: '0px' }}>
        <div className={styles.header}>

          <div className={styles.containerLogo}>
            <img onClick={() => { navigate('/home') }} src="/ecoLog_logo.png" alt="Logo" />
          </div>

          <div className={styles.containerPerfil}>
            <Dropdown
              overlay={perfilMenu}
              trigger={['click']}
              placement="bottomRight"
            >
              <Button type="text" onClick={e => e.preventDefault()}>
                <UserOutlined />
                Guilherme Saldanha Ribeiro
              </Button>
            </Dropdown>
          </div>

        </div>
      </Header>

      <Content className={styles.main} >
        <Outlet />
      </Content>

    </Layout>
  );
}
