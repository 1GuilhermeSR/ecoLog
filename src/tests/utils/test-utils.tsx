import React, { PropsWithChildren } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

type RouterOpts = { route?: string };

function RouterWrapper({ children, route = '/' }: PropsWithChildren<RouterOpts>) {
    return <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>;
}

export function renderWithRouter(ui: React.ReactElement, opts?: RouterOpts, options?: Omit<RenderOptions, 'wrapper'>) {
    return render(ui, { wrapper: (p) => <RouterWrapper route={opts?.route} {...p} />, ...options });
}
