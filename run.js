const { firefox } = require('playwright');

(async () => {
  let votes = 0;

  // Function to create a new browser context
  async function createContext(browser) {
    const context = await browser.newContext({
      permissions: ['geolocation'], // add other permissions if needed
    });

    // Block notifications
    await context.grantPermissions([], { origin: 'https://www.nola.com' });

    return context;
  }

  // Function to perform actions
  async function performActions(context) {
    const page = await context.newPage();
    try {
      await page.goto('https://www.nola.com/entertainment_life/eat-drink/new-orleans-fried-chicken-bracket/article_f48e7a82-6ebb-11ef-a454-cfbf790c9887.html');
      
      await page.waitForSelector('input[name="Enter response"]');
      const inputLocator = page.locator('input[name="Enter response"]');
      if (await inputLocator.isVisible()) {
        await inputLocator.fill('YES');
      } else {
        console.error('Input field not found.');
      }

      const submitButtonLocator = page.locator('text=Submit');
      if (await submitButtonLocator.isVisible()) {
        await submitButtonLocator.click();
      } else {
        console.error('Submit button not found.');
      }

      const textLocator = page.locator('text=Picnic Provisions & Whiskey, New Orleans');
      await textLocator.waitFor();
      await textLocator.click();
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log('Clicked on "Picnic Provisions & Whiskey, New Orleans".');
      votes++;
    } catch (error) {
      console.error('An error occurred:', error);
    } finally {
      await page.close();
    }
  }

  // Main function to run the loop
  async function main() {
    const browser = await firefox.launch({ headless: true });
    let context = await createContext(browser);

    let iteration = 0;
    const maxIterations = 100; // Restart context after 100 iterations (or adjust as needed)

    while (true) {
      try {
        await performActions(context);

        // Restart the context periodically to avoid memory leaks
        if (++iteration >= maxIterations) {
          console.log('Restarting context to free up memory.');
          await context.close();
          context = await createContext(browser);
          iteration = 0;
        }

        const delay = Math.floor(Math.random() * 10) + 300;
        console.log(`Waiting for ${delay / 1000} seconds before next iteration. Total votes: ${votes}`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } catch (error) {
        console.error('An error occurred in the main loop:', error);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  await main();
})();
