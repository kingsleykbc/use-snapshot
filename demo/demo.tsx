import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { useSnapshot } from 'react-use-snapshot';

function DemoApp() {
	const { ref, takeSnapshot, saveSnapshot, cleanup, isLoading } = useSnapshot();
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	const handleTake = async () => {
		setError(null);
		if (previewUrl) cleanup(previewUrl);
		try {
			console.log('Taking snapshot...');
			const { url } = await takeSnapshot();
			console.log('Snapshot URL:', url);
			setPreviewUrl(url);
		} catch (err: any) {
			console.error('Snapshot error:', err);
			setError(err.message || 'Failed to take snapshot');
			setPreviewUrl(null);
		}
	};

	const handleSave = async () => {
		setError(null);
		try {
			console.log('Saving snapshot...');
			await saveSnapshot(`demo-snapshot-${Date.now()}.png`);
			console.log('Snapshot saved.');
		} catch (err: any) {
			console.error('Save error:', err);
			setError(err.message || 'Failed to save snapshot');
		}
	};

	useEffect(() => {
		return () => {
			if (previewUrl) {
				console.log('Cleaning up preview URL on unmount');
				cleanup(previewUrl);
			}
		};
	}, [previewUrl, cleanup]);

	return (
		<div
			style={{
				padding: '20px',
				fontFamily: 'sans-serif',
				maxWidth: '800px',
				margin: 'auto',
				textAlign: 'center',
				display: 'flex',
				flexDirection: 'column',
				gap: '20px'
			}}
		>
			<h1>useSnapshot Hook Demo</h1>
			<p>Test capturing the blue bordered element below.</p>

			<div
				ref={ref}
				style={{
					padding: '20px',
					background: 'linear-gradient(to right, #a3ceff, #3e339c)',
					borderRadius: '20px',
					minHeight: '100px',
					textAlign: 'center',
					display: 'flex',
					flexDirection: 'column',
					gap: '20px',
					alignItems: 'center',
					color: '#fff'
				}}
			>
				<h2>Element to Capture</h2>
				<p>This contains some text and a button.</p>
				<button style={{ color: 'black', background: 'white' }}>Button</button>
				<input
					type='text'
					defaultValue='Input field'
					style={{ border: '2px solid white', background: 'rgba(255,255,255,0.2)', padding: '10px', borderRadius: '10px', color: '#fff' }}
				/>
			</div>

			<div style={{ margin: '20px 0', display: 'flex', justifyContent: 'center', gap: '10px' }}>
				<button onClick={handleTake} disabled={isLoading}>
					{isLoading ? 'Taking...' : 'Take & Preview'}
				</button>
				<button onClick={handleSave} disabled={isLoading}>
					{isLoading ? 'Saving...' : 'Save as PNG'}
				</button>
			</div>

			{isLoading && (
				<p>
					<i>Processing...</i>
				</p>
			)}
			{error && <p style={{ color: 'red', fontWeight: 'bold' }}>Error: {error}</p>}

			{previewUrl && (
				<div style={{ marginTop: '20px', borderTop: '1px solid #ccc', paddingTop: '15px' }}>
					<h3>Snapshot Preview:</h3>
					<img
						src={previewUrl}
						alt='Snapshot Preview'
						style={{
							border: '1px solid #ccc',
							padding: '15px',
							borderRadius: '10px',
							maxWidth: '100%',
							marginTop: '10px',
							display: 'block'
						}}
					/>
					<button
						onClick={() => {
							cleanup(previewUrl);
							setPreviewUrl(null);
						}}
						style={{ marginTop: '10px' }}
					>
						Clear Preview
					</button>
				</div>
			)}
			<footer style={{ color: '#919191', fontSize: '0.9rem' }}>Kingsley C. Anyabuike &copy;{new Date().getFullYear()}</footer>
		</div>
	);
}

// Mount the demo app
const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
	<React.StrictMode>
		<DemoApp />
	</React.StrictMode>
);
