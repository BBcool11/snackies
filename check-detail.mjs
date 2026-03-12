import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  console.log('访问网页...');
  await page.goto('https://snackies-delta.vercel.app', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  // 点击"进入陈列室"
  console.log('点击进入陈列室...');
  await page.click('button:has-text("进入陈列室")');
  await page.waitForTimeout(3000);
  
  // 现在检查零食卡片
  const cards = await page.$$eval('.product-card', cards => 
    cards.map(card => {
      const name = card.querySelector('h3')?.textContent || '';
      const img = card.querySelector('img');
      return {
        name: name,
        imgSrc: img?.src || '',
        imgLoaded: img?.complete && img?.naturalWidth > 0
      };
    })
  );
  
  console.log(`\n找到 ${cards.length} 个零食卡片`);
  
  // 显示前10个的状态
  console.log('\n前10个零食:');
  cards.slice(0, 10).forEach((card, i) => {
    const status = card.imgLoaded ? '✅' : '❌';
    const filename = card.imgSrc.split('/').pop();
    console.log(`${status} ${card.name} (${filename})`);
  });
  
  // 统计没有图片的
  const noImage = cards.filter(c => !c.imgLoaded);
  console.log(`\n❌ 共 ${noImage.length} 个零食没有图片`);
  
  if (noImage.length > 0) {
    console.log('\n没有图片的零食:');
    noImage.slice(0, 20).forEach(card => {
      console.log(`   - ${card.name}`);
    });
  }
  
  // 截图
  await page.screenshot({ path: 'detail-check.png' });
  console.log('\n已截图保存到 detail-check.png');
  
  await browser.close();
})();
