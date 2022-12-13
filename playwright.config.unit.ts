/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
	use: {
		trace: process.env.CI ? 'on' : 'retain-on-failure',
	},
	fullyParallel: true,
	reporter: process.env.CI ? 'github' : 'list',
	testDir: 'dist-test/',
};

export default config;
