const { chromium } = require('../.capture-runtime/browser/node_modules/playwright');
const fs = require('node:fs');
(async () => {
 const browser = await chromium.launch({channel:'chrome',headless:true});
 const page = await browser.newPage({viewport:{width:1440,height:1000}});
 const capture = async name => {await page.waitForTimeout(1500);await page.screenshot({path:`research/amazon-${name}.png`}); const text=await page.locator('body').innerText();fs.writeFileSync(`research/amazon-${name}.txt`,text);console.log(JSON.stringify({name,url:page.url(),text:text.slice(0,11500)}));};
 try {
 await page.goto('https://www.amazon.com/',{waitUntil:'domcontentloaded'});
 await page.locator('#twotabsearchtextbox').fill('wireless head');
 await capture('suggestions');
 await page.goto('https://www.amazon.com/s?k=wireless+headphones',{waitUntil:'domcontentloaded'});
 const href = await page.locator('[data-component-type="s-search-result"] a:has(h2)').first().getAttribute('href');
 await page.goto(new URL(href,'https://www.amazon.com').href,{waitUntil:'domcontentloaded'});
 await capture('product');
 if(await page.locator('#add-to-cart-button').count()) {await page.locator('#add-to-cart-button').click();await capture('added-to-cart');}
 await page.goto('https://www.amazon.com/gp/cart/view.html',{waitUntil:'domcontentloaded'});
 await capture('filled-cart');
 const proceed=page.locator('[name="proceedToRetailCheckout"]');
 if(await proceed.count()) {await proceed.click(); await capture('checkout-gate');}
 else {await page.locator('#nav-link-accountList').click();await capture('signin-form');}
 } catch(e){console.log(e.message);}finally{await browser.close();}
})();
