import type { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
	webServer: {
		command: 'npm run build -- --entry ../tests/e2e/entry.ts && npm run serve:static -- --port 8089',
		port: 8089,
		reuseExistingServer: !process.env.CI,
	},
	use: {
		trace: process.env.CI ? 'on' : 'retain-on-failure',
	},
	fullyParallel: true,
	reporter: process.env.CI ? 'github' : 'list',
	//Unit tests are built separately, and ran from /dist-test
	testDir: 'tests/e2e/',
};

export default config;
