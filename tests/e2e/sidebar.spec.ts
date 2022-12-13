import {expect, test} from '@playwright/test'

test('Add Timeline', async ({page}) => {
	await page.goto('/')

	await page.click('#sidebarButtons button[title = "Add new timeline"]')

	await expect(page.locator('.sidebarMenu label')).toHaveText('Username')
})