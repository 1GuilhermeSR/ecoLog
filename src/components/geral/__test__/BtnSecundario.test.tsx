import { render, screen, fireEvent } from '@testing-library/react';


jest.mock('antd', () => {
    const actual = jest.requireActual('antd');
    return {
        ...actual,
        Button: ({ children, onClick, disabled, style, htmlType = 'button' }: any) => (
            <button type={htmlType} onClick={onClick} disabled={disabled} style={style}>
                {children}
            </button>
        ),
    };
});

import BtnSecundario from '../BtnSecundario';

describe('BtnSecundario', () => {
    it('renderiza com o label', () => {
        render(<BtnSecundario label="Cancelar" size="middle" onClick={jest.fn()} />);
        expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
    });

    it('dispara onClick ao ser clicado', () => {
        const handleClick = jest.fn();
        render(<BtnSecundario label="Voltar" size="small" onClick={handleClick} />);
        fireEvent.click(screen.getByRole('button', { name: 'Voltar' }));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('respeita a prop disabled (não dispara clique)', () => {
        const handleClick = jest.fn();
        render(<BtnSecundario label="Desabilitado" size="large" onClick={handleClick} disabled />);
        const btn = screen.getByRole('button', { name: 'Desabilitado' });

        expect(btn).toBeDisabled();
        fireEvent.click(btn);
        expect(handleClick).not.toHaveBeenCalled();
    });

    it('renderiza com o label', () => {
        render(<BtnSecundario label="Cancelar" size="middle" onClick={() => { }} />);
        expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
    });

    it('dispara onClick quando clicado', () => {
        const handle = jest.fn();
        render(<BtnSecundario label="Ação" size="small" onClick={handle} />);
        fireEvent.click(screen.getByRole('button', { name: 'Ação' }));
        expect(handle).toHaveBeenCalledTimes(1);
    });

    it('aceita variações de size sem quebrar', () => {
        const { rerender } = render(<BtnSecundario label="Var 1" size="small" onClick={() => { }} />);
        expect(screen.getByRole('button', { name: 'Var 1' })).toBeInTheDocument();

        rerender(<BtnSecundario label="Var 2" size="middle" onClick={() => { }} />);
        expect(screen.getByRole('button', { name: 'Var 2' })).toBeInTheDocument();

        rerender(<BtnSecundario label="Var 3" size="large" onClick={() => { }} />);
        expect(screen.getByRole('button', { name: 'Var 3' })).toBeInTheDocument();
    });

    it('respeita a prop disabled', () => {
        render(<BtnSecundario label="Indisponível" size="middle" disabled onClick={() => { }} />);
        const btn = screen.getByRole('button', { name: 'Indisponível' });
        expect(btn).toBeDisabled();
    });
});
