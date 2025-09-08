import { Button, ConfigProviderProps } from 'antd';
import React from 'react';

type SizeType = ConfigProviderProps['componentSize'];

interface ButtonProps {
    label: string;
    onClick: React.MouseEventHandler<HTMLButtonElement>;
    size: SizeType;
    disabled?: boolean;
}

const BtnSecundario: React.FC<ButtonProps> = ({ label, onClick, size, disabled = false }) => (
    <Button size={size} onClick={onClick} disabled={disabled}>
        {label}
    </Button>
);

export default BtnSecundario;
