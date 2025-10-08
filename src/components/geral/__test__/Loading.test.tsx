import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.unmock('../Loading');

jest.mock('antd', () => ({
    Spin: ({ indicator, ...props }: any) => (
        <div data-testid="loading-spinner" className="ant-spin" {...props}>
            {indicator}
        </div>
    ),
}));

jest.mock('@ant-design/icons', () => ({
    LoadingOutlined: (props: any) => (
        <span
            data-testid="loading-icon"
            role="img"
            aria-label="loading"
            style={props.style}
            {...props}
        >
            ⏳
        </span>
    ),
}));

// Força o Jest a recarregar os módulos com os novos mocks
jest.resetModules();

import Loading from '../Loading';

describe('Loading Component', () => {
    beforeEach(() => {
        document.body.innerHTML = '<div></div>';
        jest.clearAllMocks();
    });

    it('renderiza o componente sem erros', () => {
        expect(() => render(<Loading />)).not.toThrow();
    });

    it('renderiza a estrutura básica do loading', () => {
        const { container } = render(<Loading />);

        expect(container.children.length).toBeGreaterThan(0);

        const firstElement = container.firstElementChild;
        expect(firstElement).toBeTruthy();
        expect(firstElement?.tagName).toBe('DIV');
    });

    it('aplica os estilos de overlay corretamente', () => {
        const { container } = render(<Loading />);

        const overlay = container.firstElementChild as HTMLElement;

        expect(overlay).toBeTruthy();
        expect(overlay).toHaveStyle({
            position: 'absolute',
            top: '0px',
            left: '0px',
            width: '100%',
            height: '100%',
            zIndex: '9999',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(138, 138, 138, 0.2)'
        });
    });

    it('renderiza o spinner dentro do overlay', () => {
        render(<Loading />);

        const spinner = screen.getByTestId('loading-spinner');
        expect(spinner).toBeInTheDocument();
        expect(spinner).toHaveClass('ant-spin');
    });

    it('renderiza o ícone de loading', () => {
        render(<Loading />);

        const icon = screen.getByTestId('loading-icon');
        expect(icon).toBeInTheDocument();
        expect(icon).toHaveAttribute('role', 'img');
        expect(icon).toHaveAttribute('aria-label', 'loading');
        expect(icon).toHaveStyle({ fontSize: '48px' });
        expect(icon).toHaveTextContent('⏳');
    });

    it('mantém a hierarquia correta dos elementos', () => {
        const { container } = render(<Loading />);

        const overlay = container.firstElementChild as HTMLElement;
        const spinner = screen.getByTestId('loading-spinner');
        const icon = screen.getByTestId('loading-icon');

        // Verifica hierarquia: overlay > spinner > icon
        expect(overlay).toContainElement(spinner);
        expect(spinner).toContainElement(icon);
    });

    it('funciona como overlay de tela cheia', () => {
        const { container } = render(<Loading />);

        const overlay = container.firstElementChild as HTMLElement;

        expect(overlay).toHaveStyle({
            position: 'absolute',
            top: '0px',
            left: '0px',
            width: '100%',
            height: '100%',
            zIndex: '9999'
        });
    });

    it('centraliza o conteúdo com flexbox', () => {
        const { container } = render(<Loading />);

        const overlay = container.firstElementChild as HTMLElement;

        expect(overlay).toHaveStyle({
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
        });
    });
});