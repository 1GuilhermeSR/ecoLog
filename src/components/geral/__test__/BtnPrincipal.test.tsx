import { render, screen, fireEvent } from '@testing-library/react';

jest.mock('antd', () => {
    const actual = jest.requireActual('antd');
    return {
        ...actual,
        Button: ({ children, onClick, disabled, ...rest }: any) => (
            <button type="button" onClick={onClick} disabled={disabled} {...rest}>
                {children}
            </button>
        ),
    };
});

import BtnPrincipal from '../BtnPrincipal';

describe('BtnPrincipal', () => {
    it('renderiza com o label', () => {
        render(<BtnPrincipal label="Salvar" size="middle" />);
        expect(screen.getByRole('button', { name: 'Salvar' })).toBeInTheDocument();
    });

    it('dispara onClick ao ser clicado', () => {
        const handleClick = jest.fn();
        render(<BtnPrincipal label="Clique aqui" size="middle" onClick={handleClick} />);
        fireEvent.click(screen.getByRole('button', { name: 'Clique aqui' }));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('aceita htmlType/size sem quebrar (sem assumir reflexão no DOM)', () => {
        // htmlType="submit" e size="large"
        render(<BtnPrincipal label="Enviar" size="large" htmlType="submit" />);
        expect(screen.getByRole('button', { name: 'Enviar' })).toBeInTheDocument();

        // htmlType="button" e size="small"
        render(<BtnPrincipal label="Ação" size="small" htmlType="button" />);
        expect(screen.getByRole('button', { name: 'Ação' })).toBeInTheDocument();
    });

    it('aplica o estilo de largura customizado e mantém o fundo #175E73', () => {
        render(<BtnPrincipal label="Salvar" size="middle" width="26%" />);
        const btn = screen.getByRole('button', { name: 'Salvar' });
        expect(btn).toHaveStyle({
            backgroundColor: '#175E73',
            width: '26%',
        });
    });

    it('usa width padrão 100% quando não informado', () => {
        render(<BtnPrincipal label="Padrão" size="large" />);
        const btn = screen.getByRole('button', { name: 'Padrão' });

        expect(btn).toHaveStyle({ width: '100%' });
    });

    it('não quebra quando onClick não é passado (usa noop interno)', () => {
        render(<BtnPrincipal label="Sem onClick" size="small" />);
        const btn = screen.getByRole('button', { name: 'Sem onClick' });

        expect(() => fireEvent.click(btn)).not.toThrow();
    });

    it('respeita a prop disabled quando fornecida', () => {
        render(<BtnPrincipal label="Desabilitado" size="middle" disabled />);
        const btn = screen.getByRole('button', { name: 'Desabilitado' });

        expect(btn).toBeDisabled();
    });

});
