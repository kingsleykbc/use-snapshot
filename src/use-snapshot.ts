import { useCallback, useRef, useState } from 'react';
import { toPng } from 'html-to-image';

export type TSnapshotConfig = {
	/** Define the width of the browser viewport 'window' during capture (defaults to element scrollWidth) */
	windowWidth?: number;
	/** Define the height of the browser viewport 'window' during capture (defaults to element scrollHeight) */
	windowHeight?: number;
	/** Define the final output image width (defaults to windowWidth or element scrollWidth) */
	width?: number;
	/** Define the final output image height (defaults to windowHeight or element scrollHeight) */
	height?: number;
	/** Target a specific element using a CSS selector instead of the ref */
	identifier?: string;
};

// The result returned by takeSnapshot, containing the image URL and Blob data.
type TSnapshotResult = { url: string; blob: Blob };

/**
 * A React hook to capture an HTML element (or specified region) as a PNG image.
 * @param config Optional configuration object (`TSnapshotConfig`) to customize capture options.
 * @returns An object containing a ref, capture functions, cleanup utility, and loading state.
 */
export function useSnapshot(config?: TSnapshotConfig) {
	// Ref to attach to the target DOM element for capture (unless using identifier).
	const ref = useRef<any>(null);
	const [isLoading, setIsLoading] = useState(false);

	/**
	 * Asynchronously captures a snapshot of the target element.
	 * @returns A Promise resolving to a TSnapshotResult object ({ url, blob }).
	 * @throws An error if the target element cannot be found.
	 */
	const takeSnapshot = useCallback(async (): Promise<TSnapshotResult> => {
		const targetElement = config?.identifier ? document.querySelector(config.identifier) : ref.current;

		if (!targetElement) {
			throw new Error('Element ref or identifier not found. Make sure to pass a valid ref or identifier.');
		}

		setIsLoading(true);

		// A small artificial delay to allow pending UI updates before capture.
		await new Promise(resolve => setTimeout(resolve, 100));

		// Get the full dimensions of the element's content.
		const fullWidth = targetElement.scrollWidth;
		const fullHeight = targetElement.scrollHeight;

		// Determine the dimensions for capture and output, using defaults based on element size if not specified.
		const {
			windowWidth = fullWidth,
			windowHeight = fullHeight,
			width: outputWidth = windowWidth || fullWidth,
			height: outputHeight = windowHeight || fullHeight
		} = config || {};

		// Prepare options for the html-to-image library.
		const options = {
			width: outputWidth,
			height: outputHeight,
			style: { transform: 'scale(1)', transformOrigin: 'top left', width: `${windowWidth}px`, height: `${windowHeight}px` }
		};

		// Generate the PNG image as a Base64 Data URL using html-to-image.
		const dataUrl = await toPng(targetElement, options);
		const response = await fetch(dataUrl);
		const blob = await response.blob();
		const url = URL.createObjectURL(blob);

		setIsLoading(false);

		return { url, blob };
	}, [config]);

	/**
	 * Revokes an Object URL to free up browser memory.
	 * Should be called when the URL is no longer needed (e.g., on component unmount).
	 * @param url The Object URL string to revoke.
	 */
	const cleanup = useCallback((url: string | null) => {
		if (url) {
			URL.revokeObjectURL(url);
		}
	}, []);

	/**
	 * Takes a snapshot and initiates a browser download of the image.
	 * @param filename Optional desired filename for the downloaded image (defaults to 'image.png').
	 */
	const saveSnapshot = useCallback(
		async (filename = 'image.png') => {
			const { url } = await takeSnapshot();
			const link = document.createElement('a');
			link.href = url;
			link.download = filename;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			cleanup(url);
		},
		[takeSnapshot, cleanup]
	);

	return { ref, takeSnapshot, saveSnapshot, cleanup, isLoading };
}
