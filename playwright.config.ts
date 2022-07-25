/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
	webServer: {
		command: 'npm run build -- --entry ./tests/entry.ts && npm run serve:static -- --port 8089',
		port: 8089,
		reuseExistingServer: !process.env.CI,
	},
	use: {
		trace: process.env.CI ? 'on' : 'retain-on-failure',
	},
	fullyParallel: true,
	reporter: process.env.CI ? 'github' : 'list',
};

export default config;
