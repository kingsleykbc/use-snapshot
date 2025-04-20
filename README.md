# react-use-snapshot

A React hook to capture HTML elements as PNG images using [html-to-image](https://github.com/bubkoo/html-to-image). Capture via ref or CSS selector, configure dimensions, download directly, and manage loading states.

## Installation

```bash
npm install react-use-snapshot html-to-image react react-dom
# or
yarn add react-use-snapshot html-to-image react react-dom
```

## Quick Usage

```
import React, { useState, useEffect } from 'react';
import { useSnapshot } from 'react-use-snapshot';

function MyComponent() {
  // Get ref and functions from the hook
  const { ref, takeSnapshot, saveSnapshot, cleanup, isLoading } = useSnapshot();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleCapture = async () => {
    if (previewUrl) cleanup(previewUrl); // Clean previous URL
    try {
      const { url } = await takeSnapshot();
      setPreviewUrl(url); // Use URL for preview <img>
    } catch (error) { console.error(error); }
  };

  // Clean up Object URL on unmount
  useEffect(() => () => { if (previewUrl) cleanup(previewUrl); }, [previewUrl, cleanup]);

  return (
    <div>
      {/* Attach ref to element */}
      <div ref={ref} style={{ padding: 10, border: '1px solid black' }}>
        Content to capture
      </div>

      <button onClick={handleCapture} disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Capture'}
      </button>
      {/* Or use saveSnapshot('filename.png') to download directly */}

      {previewUrl && <img src={previewUrl} alt="Preview" />}
    </div>
  );
}
```

## API

### useSnapshot(config?)

**Parameters:**

- config?: TSnapshotConfig (Optional): Configures snapshot options.

  - identifier?: string: CSS selector to target element (overrides ref).
  - windowWidth?: number: Simulated viewport width during capture.
  - windowHeight?: number: Simulated viewport height during capture.
  - width?: number: Final output image width.
  - height?: number: Final output image height.
  - (Other html-to-image options can be passed too)

**Returns:** { ref, isLoading, takeSnapshot, saveSnapshot, cleanup }

- ref: React.RefObject<any>: Attach to the target element.
- isLoading: boolean: True during snapshot processing.
- takeSnapshot: () => Promise<TSnapshotResult>: Captures snapshot, returns { url: string, blob: Blob }.

  - url: Object URL for image preview (use cleanup when done).
  - blob: Raw image data.

- saveSnapshot: (filename?: string) => Promise<void>: Captures and triggers download (calls cleanup internally).
- cleanup: (url: string | null) => void: Revokes Object URL to free memory. **Important to call.**

## Development

1.  npm install
2.  npm run build (Build library)
3.  npm test (Run tests)
4.  npm run dev:demo (Run demo app)
