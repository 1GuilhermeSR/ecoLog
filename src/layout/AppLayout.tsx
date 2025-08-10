// src/layout/AppLayout.tsx
import { Button, Dropdown, Layout, Menu, MenuProps, message } from 'antd';
import { Outlet, useNavigate } from 'react-router-dom';
import styles from './styles.module.scss';
import { UserOutlined } from '@ant-design/icons';
import userService from '../services/usuario/usuarioService';
import { useEffect, useState } from 'react';

const { Header, Content } = Layout;

export default function AppLayout() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState<any>(null);

  useEffect(() => {
    // Carregar dados do usuário ao montar o componente
    const user = userService.getCurrentUser();
    if (user) {
      setUsuario(user);
    }
  }, []);

  const menuItems: MenuProps['items'] = [
    { key: '1', label: 'Meu perfil' },
    { key: '2', label: 'Sair' },
  ];

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    switch (key) {
      case '1':
        navigate('/usuario');
        break;
      case '2':
        // Fazer logout
        userService.logout();
        message.success('Logout realizado com sucesso!');
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
      <Header style={{ display: 'flex', backgroundColor: 'white', padding: '0px', height: '8vh' }}>
        <div className={styles.header}>
          <div className={styles.containerLogo}>
            <img onClick={() => navigate('/home')} src="/ecoLog_logo.png" alt="Logo" />
          </div>

          <div className={styles.containerPerfil}>
            <Dropdown
              overlay={perfilMenu}
              trigger={['click']}
              placement="bottomRight"
            >
              <Button type="text" onClick={e => e.preventDefault()}>
                <UserOutlined />
                {usuario?.nome || 'Usuário'}
              </Button>
            </Dropdown>
          </div>
        </div>
      </Header>

      <Content className={styles.main}>
        <Outlet />
      </Content>
    </Layout>
  );
}