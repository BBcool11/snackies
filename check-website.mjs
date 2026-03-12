import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  console.log('正在访问网页 https://snackies-delta.vercel.app ...');
  await page.goto('https://snackies-delta.vercel.app', { waitUntil: 'networkidle' });
  
  // 等待页面加载
  await page.waitForTimeout(5000);
  
  // 检查零食卡片
  const cards = await page.$$eval('.product-card', cards => cards.length);
  console.log(`找到 ${cards} 个零食卡片`);
  
  // 检查图片
  const images = await page.$$eval('img', imgs => 
    imgs.map(img => ({
      src: img.src,
      alt: img.alt,
      complete: img.complete,
      naturalWidth: img.naturalWidth
    }))
  );
  
  console.log(`总共 ${images.length} 张图片`);
  
  // 找出加载失败的图片
  const brokenImages = images.filter(img => 
    img.src.includes('snack-images') && img.naturalWidth === 0
  );
  
  if (brokenImages.length > 0) {
    console.log(`\n❌ ${brokenImages.length} 张图片加载失败:`);
    brokenImages.slice(0, 10).forEach(img => {
      const filename = img.src.split('/').pop();
      console.log(`   - ${filename}`);
    });
  } else {
    console.log('\n✅ 所有图片加载正常！');
  }
  
  // 截图
  await page.screenshot({ path: 'website-check.png', fullPage: false });
  console.log('已截图保存到 website-check.png');
  
  await browser.close();
})();
