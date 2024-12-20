import type {PlaywrightTestConfig} from '@playwright/test';

const config: PlaywrightTestConfig = {
	webServer: {
		command: 'bun serve:test',
		port: 8089,
		//TODO Set to false on UI mode?
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