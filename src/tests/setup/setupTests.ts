import '@testing-library/jest-dom';

Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),   
        removeListener: jest.fn(),      
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    }),
});

class ResizeObserver {
    observe = jest.fn();
    unobserve = jest.fn();
    disconnect = jest.fn();
}
Object.defineProperty(window, 'ResizeObserver', {
    writable: true,
    value: ResizeObserver,
});

class IntersectionObserver {
    root: Element | null = null;
    rootMargin = '';
    thresholds: number[] = [];
    observe = jest.fn();
    unobserve = jest.fn();
    disconnect = jest.fn();
    takeRecords = jest.fn(() => []);
}
Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    value: IntersectionObserver,
});

window.scrollTo = jest.fn();

const origWarn = console.warn;
beforeAll(() => {
    jest.spyOn(console, 'warn').mockImplementation((...args: any[]) => {
        const msg = args?.[0]?.toString?.() || '';
        if (msg.includes('React Router Future Flag Warning')) return;
        return origWarn(...args);
    });
});

import { TextEncoder, TextDecoder } from 'util';
if (!(global as any).TextEncoder) (global as any).TextEncoder = TextEncoder;
if (!(global as any).TextDecoder) (global as any).TextDecoder = TextDecoder as any;

if (!(global as any).setImmediate) {
    (global as any).setImmediate = (fn: (...args: any[]) => void, ...args: any[]) =>
        setTimeout(fn, 0, ...args);
}

import '../mocks/antd-lite';
