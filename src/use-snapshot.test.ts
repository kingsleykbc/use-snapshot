import { renderHook } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useSnapshot } from './index';
import * as htmlToImage from 'html-to-image';
import { act } from 'react';

describe('useSnapshot Hook', () => {
	let testElement: HTMLElement;

	beforeEach(() => {
		vi.clearAllMocks();
		testElement = document.createElement('div');
		testElement.id = 'test-div';
		Object.defineProperty(testElement, 'scrollWidth', { configurable: true, value: 150 });
		Object.defineProperty(testElement, 'scrollHeight', { configurable: true, value: 75 });
		document.body.appendChild(testElement);
	});

	afterEach(() => {
		if (testElement && document.body.contains(testElement)) {
			document.body.removeChild(testElement);
		}
		vi.restoreAllMocks();
	});

	it('should return ref, functions, and initial state', () => {
		const { result } = renderHook(() => useSnapshot());
		expect(result.current.isLoading).toBe(false);
		expect(result.current.ref.current).toBeNull();
		expect(typeof result.current.takeSnapshot).toBe('function');
		expect(typeof result.current.saveSnapshot).toBe('function');
		expect(typeof result.current.cleanup).toBe('function');
	});

	it('should save snapshot and cleanup when ref is valid', async () => {
		const { result } = renderHook(() => useSnapshot());

		act(() => {
			result.current.ref.current = testElement;
		});

		const mockLinkObject = {
			href: '',
			download: '',
			click: vi.fn(),
			setAttribute: vi.fn(),
			style: {} as CSSStyleDeclaration
		};

		const createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
			if (tagName.toLowerCase() === 'a') {
				mockLinkObject.href = '';
				mockLinkObject.download = '';
				mockLinkObject.click.mockClear();
				return mockLinkObject as unknown as HTMLAnchorElement;
			}
			return document.createElement!(tagName); // Use original behavior
		});
		const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(node => node as any);
		const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(node => node as any);

		await act(async () => {
			await result.current.saveSnapshot('test-image.png');
		});

		expect(result.current.isLoading).toBe(false); // Should be false after completion

		expect(createElementSpy).toHaveBeenCalledWith('a');
		expect(mockLinkObject.download).toBe('test-image.png');
		expect(mockLinkObject.href).toBe('mock://blob-url');
		expect(mockLinkObject.click).toHaveBeenCalledTimes(1);
		expect(appendChildSpy).toHaveBeenCalledWith(mockLinkObject);
		expect(removeChildSpy).toHaveBeenCalledWith(mockLinkObject);

		expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('mock://blob-url');
	});

	it('should capture using ref and pass options', async () => {
		const toPngSpy = vi.spyOn(htmlToImage, 'toPng');
		const config = { width: 300, height: 200 }; // Example config
		const { result } = renderHook(() => useSnapshot(config));

		act(() => {
			result.current.ref.current = testElement;
		});

		await act(async () => {
			await result.current.takeSnapshot();
		});

		const expectedWidth = config.width; // 300
		const expectedHeight = config.height; // 200
		const expectedWindowWidth = testElement.scrollWidth; // 150 (from beforeEach)
		const expectedWindowHeight = testElement.scrollHeight; // 75 (from beforeEach)

		expect(toPngSpy).toHaveBeenCalledTimes(1);
		expect(toPngSpy).toHaveBeenCalledWith(testElement, {
			width: expectedWidth, // outputWidth takes precedence
			height: expectedHeight, // outputHeight takes precedence
			style: {
				// Style uses windowWidth/Height OR scrollWidth/Height if not provided
				transform: 'scale(1)',
				transformOrigin: 'top left',
				width: `${expectedWindowWidth}px`, // Uses scrollWidth as fallback
				height: `${expectedWindowHeight}px` // Uses scrollHeight as fallback
			}
		});
		expect(result.current.isLoading).toBe(false);
	});
});
