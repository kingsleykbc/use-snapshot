// vite.config.ts
import { resolve } from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';

export default defineConfig({
	plugins: [react(), dts({ insertTypesEntry: true })],
	build: {
		lib: {
			entry: resolve(__dirname, 'src/index.ts'), // Entry point is src/index.ts
			name: 'ReactUseSnapshotPro', // Global name for UMD build
			formats: ['es', 'umd'],
			fileName: format => `index.${format}.js`
		},
		rollupOptions: {
			external: ['react', 'react-dom', 'html-to-image'], // Externalize dependencies
			output: {
				globals: { react: 'React', 'react-dom': 'ReactDOM', 'html-to-image': 'htmlToImage' }
			}
		},
		sourcemap: true,
		emptyOutDir: true
	},
	test: {
		globals: true,
		environment: 'jsdom',
		setupFiles: './vitest.setup.ts',
		include: ['src/**/*.test.ts']
	}
});
