import { Button, ConfigProviderProps } from 'antd';
import React from 'react';

type SizeType = ConfigProviderProps['componentSize'];

interface ButtonProps {
    label: string;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    size: SizeType;
    disabled?: boolean;
    htmlType?: 'button' | 'submit' | 'reset';
    width?: React.CSSProperties['width'];
}

const BtnPrincipal: React.FC<ButtonProps> = ({ label, onClick = (function(){}), size, disabled = false, htmlType = 'submit',  width = '100%' }) => (
    <Button style={{ backgroundColor: '#175E73', width }} type="primary" htmlType={htmlType} size={size} onClick={onClick} disabled={disabled}>
        {label}
    </Button>
);

export default BtnPrincipal;
