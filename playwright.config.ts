import type {PlaywrightTestConfig} from '@playwright/test';

const config: PlaywrightTestConfig = {
	webServer: {
		command: 'bun run build -- --entry ../tests/e2e/entry.ts && bun run serve -- --port 8089',
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
	forbidOnly: !!process.env.CI,
	timeout: 3000,
};

export default config;