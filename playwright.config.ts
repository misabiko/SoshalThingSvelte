/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
	webServer: {
		command: 'npm run serve',
		port: 8081
	}
};

export default config;
