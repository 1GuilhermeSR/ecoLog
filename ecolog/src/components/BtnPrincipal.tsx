import { Button, ConfigProviderProps } from 'antd';
import React from 'react';

type SizeType = ConfigProviderProps['componentSize'];

interface ButtonProps {
    label: string;
    onClick: React.MouseEventHandler<HTMLButtonElement>;
    size: SizeType;
    disabled?: boolean;
}

const BtnPrincipal: React.FC<ButtonProps> = ({ label, onClick, size, disabled = false }) => (
    <Button style={{ backgroundColor: '#175E73' }} type="primary" size={size} onClick={onClick}>
        {label}
    </Button>
);

export default BtnPrincipal;
