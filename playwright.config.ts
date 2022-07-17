/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
	webServer: {
		command: 'npm run serve -- --port 8089',
		port: 8089
	}
};

export default config;
