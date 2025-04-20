import { vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';

vi.mock('html-to-image', () => ({
	toPng: vi.fn().mockResolvedValue('data:image/png;base64,mockimagedata')
}));

beforeEach(() => {
	vi.clearAllMocks();

	global.fetch = vi.fn(() =>
		Promise.resolve({
			blob: () => Promise.resolve(new Blob(['mock blob content']))
		} as Response)
	);

	global.URL.createObjectURL = vi.fn(() => 'mock://blob-url');
	global.URL.revokeObjectURL = vi.fn();
});
