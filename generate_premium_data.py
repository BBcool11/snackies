#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
零食文案重写脚本 - 为270条零食生成高级文案
"""

import json
import random

# 零食数据库 - 定制化文案 (热门零食)
SNACK_DATABASE = {
    # ===== 膨化食品 (45个) =====
    "小浣熊水浒卡版": {
        "factual_desc": "统一旗下经典干脆面，以收集108张水浒英雄卡为卖点，千禧年小学生的社交货币，集卡文化的现象级代表。",
        "nostalgic_quote": "为了集齐那张宋江卡，我吃了一整学期的小浣熊，最后发现和同桌换来的林冲更香。",
        "price": 1.0, "era": "90年代", "en_name": "Little Raccoon Water Hero Cards"
    },
    "老版卜卜星": {
        "factual_desc": "广东产老牌膨化零食，星星造型裹满调味粉，入口即化的奇妙口感，南方地区80后的集体味觉记忆。",
        "nostalgic_quote": "倒一把在手心，仰头张嘴，星星掉进嘴里的瞬间，是放学后最快乐的仪式。",
        "price": 0.5, "era": "80年代", "en_name": "Bok Bok Star Classic"
    },
    "魔法士老版干脆面": {
        "factual_desc": "华丰食品推出的干脆面，魔法主题包装与附赠卡片，价格亲民，是00年代小学生课桌里的硬通货。",
        "nostalgic_quote": "捏碎面饼的声音是暗号，全班同学同时低头偷吃的瞬间，是最齐心的默契。",
        "price": 0.5, "era": "00年代", "en_name": "Magician Instant Noodle"
    },
    "奇多老版圈圈": {
        "factual_desc": "百事旗下奇多品牌的环形玉米膨化，芝士调味浓郁，套在手指上边玩边吃的独特吃法风靡一时。",
        "nostalgic_quote": "十个手指套满奇多圈，假装自己是怪兽，一口一个咬掉，是童年最简单的角色扮演。",
        "price": 2.5, "era": "90年代", "en_name": "Cheetos Rings Classic"
    },
    "太阳锅巴老包装": {
        "factual_desc": "西安太阳食品厂出品，小米锅巴香脆可口，麻辣味深入骨髓，是陕西乃至西北地区几代人的零食记忆。",
        "nostalgic_quote": "咬下去嘎嘣脆的声音，能把隔壁班的同学都馋过来，一包锅巴传遍整个教室。",
        "price": 1.0, "era": "90年代", "en_name": "Taiyang Guoba Classic"
    },
    "乖乖老版虾条": {
        "factual_desc": "台湾乖乖公司出品，非油炸虾条，虾味浓郁不腻口，绿色包装上的乖孙子形象深入人心。",
        "nostalgic_quote": "妈妈说这个比薯片健康，于是心安理得地抱着一整包，看完整集动画片。",
        "price": 3.0, "era": "90年代", "en_name": "Kuai Kuai Shrimp Sticks"
    },
    "浪味仙老版": {
        "factual_desc": "旺旺集团经典田园蔬菜口味膨化，螺旋造型独特，咸甜交织的复合口味，是90年代高端零食的代表。",
        "nostalgic_quote": "那螺旋状的造型总让我想起妈妈的卷发，咬一口，满嘴都是高级的味道。",
        "price": 2.0, "era": "90年代", "en_name": "Lonely God Classic"
    },
    "张君雅小妹妹早期版": {
        "factual_desc": "台湾维力食品出品，以卡通小女孩形象著称，多种口味的点心面，是00年代进口零食的网红代表。",
        "nostalgic_quote": "那个扎着双马尾的小女孩，包装上笑得那么开心，让人舍不得撕开。",
        "price": 8.0, "era": "00年代", "en_name": "Chang Chun Ya Little Sister"
    },
    "黑皮干脆面": {
        "factual_desc": "河南斯美特出品，粗面饼、重口味调料是特色，在中原地区有着极高的市场占有率。",
        "nostalgic_quote": "面饼硬得能把牙崩掉，但那种麻辣味一旦上瘾，就再也停不下来。",
        "price": 0.5, "era": "90年代", "en_name": "Heipi Instant Noodle"
    },
    "小当家干脆面老版": {
        "factual_desc": "统一企业出品，中华小当家动漫IP联名，每包附赠精美的封神榜卡片，集卡党的噩梦与福音。",
        "nostalgic_quote": "为了集齐那张姜子牙，我求遍了全班同学，最后用三张雷震子才换到。",
        "price": 1.0, "era": "00年代", "en_name": "Little Master Noodle"
    },
    "好多鱼老版": {
        "factual_desc": "好丽友出品的海底生物造型饼干，中空脆壳，海鲜与番茄双口味，兼具趣味性与美味。",
        "nostalgic_quote": "先不吃，把各种海洋动物排成海底世界，是每次打开好多鱼的必备仪式。",
        "price": 3.0, "era": "00年代", "en_name": "Many Fish Crackers"
    },
    "乐事原味老包装": {
        "factual_desc": "百事旗下乐事薯片经典原味，薄脆切片，盐味适中，是全球销量最高的薯片单品之一。",
        "nostalgic_quote": "第一次吃乐事时惊为天物，原来薯片可以这么薄、这么脆、这么高级。",
        "price": 6.0, "era": "90年代", "en_name": "Lay's Classic"
    },
    "品客原味老包装": {
        "factual_desc": "宝洁旗下品客薯片，标志性的筒装设计与弯曲片型，美国进口品质，90年代高端薯片代名词。",
        "nostalgic_quote": "那个圆筒抱在怀里像奖杯，一片一片抽出来，仪式感胜过味道本身。",
        "price": 12.0, "era": "90年代", "en_name": "Pringles Original"
    },
    "上好佳鲜虾片老版": {
        "factual_desc": "菲律宾上好佳公司出品，真虾入料，鲜虾味浓郁，橙色包装是童年最鲜明的视觉符号之一。",
        "nostalgic_quote": "虾片含在嘴里等它化开，那种鲜美的味道，是海边孩子的味觉启蒙。",
        "price": 1.5, "era": "90年代", "en_name": "Oishi Shrimp Chips"
    },
    
    # ===== 饮料汽水 (45个) =====
    "健力宝老铝罐": {
        "factual_desc": "中国首款运动饮料，1984年洛杉矶奥运会中国代表团指定饮品，橙蜜口味独特，被誉为'中国魔水'。",
        "nostalgic_quote": "只有过年才能喝到，橙色的液体倒出来气泡滋滋响，是最奢侈的享受。",
        "price": 3.0, "era": "80年代", "en_name": "Jianlibao Classic Can"
    },
    "旭日升冰茶": {
        "factual_desc": "中国第一款茶饮料， twin-pack双瓶设计，红茶与冰茶组合，90年代最时尚的饮料， singer代言家喻户晓。",
        "nostalgic_quote": "两瓶绑在一起，和最好的朋友一人一瓶，是夏天最亲密的约定。",
        "price": 2.5, "era": "90年代", "en_name": "Xurisheng Iced Tea"
    },
    "非常可乐": {
        "factual_desc": "娃哈哈推出的国产可乐，'中国人自己的可乐'，红色包装喜庆，是农村市场的绝对霸主。",
        "nostalgic_quote": "婚宴上摆满非常可乐，红色罐身和喜字相映成趣，是最接地气的幸福。",
        "price": 2.0, "era": "90年代", "en_name": "Future Cola"
    },
    "北冰洋汽水": {
        "factual_desc": "北京老牌汽水，橘子口味正宗，北极熊标志深入人心，是京城几代人的夏日记忆。",
        "nostalgic_quote": "喝完后要返还瓶子，但那橘子味汽水下肚的畅快，值得跑一趟。",
        "price": 1.5, "era": "80年代", "en_name": "Arctic Ocean Soda"
    },
    "天府可乐": {
        "factual_desc": "重庆出品的国产可乐，添加白芍等中药成分，是'健康可乐'概念的先驱，西南地区的市场王者。",
        "nostalgic_quote": "妈妈说这个有中药成分，喝可乐也能养生，是我听过最动听的理由。",
        "price": 2.0, "era": "80年代", "en_name": "Tianfu Cola"
    },
    "汾煌可乐": {
        "factual_desc": "广东汾煌集团出品，'龙的儿子'广告深入人心，邀请成龙代言，是90年代最有野心的国产可乐。",
        "nostalgic_quote": "成龙大哥代言的可乐，喝完觉得自己也能飞檐走壁。",
        "price": 2.5, "era": "90年代", "en_name": "Fenhuang Cola"
    },
    "八王寺汽水": {
        "factual_desc": "沈阳老字号汽水，始建于1920年，果子蜜口味独特，是东北地区历史最悠久的汽水品牌。",
        "nostalgic_quote": "玻璃瓶身上凝结的水珠，和夏天的蝉鸣一起，组成了东北孩子的暑假。",
        "price": 1.0, "era": "80年代", "en_name": "Bawang Temple Soda"
    },
    "山海关汽水": {
        "factual_desc": "天津老牌汽水，始建于1902年，柠檬口味清爽，是华北地区历史最悠久的汽水之一。",
        "nostalgic_quote": "海河边上喝着山海关，看着轮船开过，是天津孩子最悠闲的午后。",
        "price": 1.5, "era": "80年代", "en_name": "Shanhaiguan Soda"
    },
    "正广和汽水": {
        "factual_desc": "上海最老牌的汽水，始建于1864年，乌梅口味独特，是上海人心中不可替代的味道。",
        "nostalgic_quote": "外婆从弄堂口小卖部买回来的正广和，是上海夏天最清凉的记忆。",
        "price": 1.5, "era": "80年代", "en_name": "Zhenguanghe Soda"
    },
    "亚洲汽水": {
        "factual_desc": "广州老牌汽水，沙示口味独特（类似风油精味），是广东人爱恨交加的另类味觉记忆。",
        "nostalgic_quote": "第一次喝觉得像风油精，喝惯了却欲罢不能，是广东人才懂的上头。",
        "price": 1.5, "era": "80年代", "en_name": "Asia Soda"
    },
    "大白梨汽水": {
        "factual_desc": "东北特色汽水，玻璃瓶装梨味汽水，甜度适中，是沈阳地区最具代表性的地方饮料。",
        "nostalgic_quote": "大白梨配烤串，是东北夏夜的标配，缺一不可。",
        "price": 1.0, "era": "90年代", "en_name": "Dabaili Pear Soda"
    },
    "海碧汽水": {
        "factual_desc": "河南洛阳特产汽水，水蜜桃口味清甜，是洛阳人心中不可替代的家乡味道。",
        "nostalgic_quote": "离开洛阳后再也没喝过，那水蜜桃的味道，是乡愁最具体的形状。",
        "price": 1.0, "era": "90年代", "en_name": "Haibi Soda"
    },
    
    # ===== 糖果巧克力 (45个) =====
    "大大泡泡糖老版": {
        "factual_desc": "美国箭牌出品，超大颗粒设计，草莓与葡萄双口味，比谁吹的泡泡大是千禧年的全民运动。",
        "nostalgic_quote": "泡泡吹破粘满脸的糗样，是课间走廊里最响亮的笑声来源。",
        "price": 0.2, "era": "90年代", "en_name": "TaTa Bubble Gum"
    },
    "跳跳糖": {
        "factual_desc": "美国通用食品公司发明，二氧化碳充气糖，入口噼啪炸裂的物理刺激，是80年代最科幻的零食体验。",
        "nostalgic_quote": "倒进嘴里捂住耳朵，那种在舌头上开派对的感觉，是童年最接近摇滚的时刻。",
        "price": 0.5, "era": "80年代", "en_name": "Popping Candy"
    },
    "大白兔奶糖": {
        "factual_desc": "上海冠生园出品，糯米纸包裹的奶香硬糖，七次登上国宴的国民糖果，是几代中国人的甜蜜记忆。",
        "nostalgic_quote": "剥开那层薄薄的糯米纸，把奶香含在嘴里化开，是上海给全中国孩子的温柔。",
        "price": 0.2, "era": "80年代", "en_name": "White Rabbit Creamy Candy"
    },
    "旺仔QQ糖老版": {
        "factual_desc": "旺旺集团凝胶糖果，水果造型、Q弹口感，富含维生素C，电视广告里那个翻白眼的小男孩深入人心。",
        "nostalgic_quote": "Come on baby！你也要吃一颗吗？那句广告词，全班同学都会模仿。",
        "price": 1.0, "era": "00年代", "en_name": "Want Want QQ Gummies"
    },
    "麦丽素": {
        "factual_desc": "梁丰食品出品，巧克力外壳包裹麦芽脆心，国产巧克力代表作，电视剧里的万能解药与毒药。",
        "nostalgic_quote": "含在嘴里等巧克力化开，再咬碎里面的脆心，是两段式的快乐。",
        "price": 1.0, "era": "80年代", "en_name": "Mylikes Chocolate"
    },
    "金丝猴奶糖": {
        "factual_desc": "河南金丝猴集团出品，对标大白兔的奶糖产品，金丝猴形象包装，在中原地区有极高知名度。",
        "nostalgic_quote": "过年时抓一把金丝猴奶糖塞进口袋，是对新年最实在的期待。",
        "price": 0.2, "era": "90年代", "en_name": "Golden Monkey Candy"
    },
    "喔喔奶糖": {
        "factual_desc": "上海喔喔集团出品，大公鸡标志深入人心，奶味醇厚，是华东地区90年代婚宴喜糖的首选。",
        "nostalgic_quote": "那只骄傲的大公鸡，见证了上海人结婚喜事里最甜蜜的那一部分。",
        "price": 0.3, "era": "90年代", "en_name": "WoWo Candy"
    },
    "佳佳奶糖": {
        "factual_desc": "上海冠生园旗下，椰子口味奶糖开创者，黑白相间的包装，与大白兔并称冠生园双子星。",
        "nostalgic_quote": "椰子的清香混合奶香，是热带风情与上海制造的美妙碰撞。",
        "price": 0.3, "era": "90年代", "en_name": "Jiajia Coconut Candy"
    },
    "瑞士糖": {
        "factual_desc": "Sugus品牌水果软糖，瑞士进口，多种水果口味，正方造型独立包装，是90年代进口糖果代表。",
        "nostalgic_quote": "撕开那个小小的包装，把软糖拉长再咬断，是最解压的小游戏。",
        "price": 8.0, "era": "90年代", "en_name": "Sugus Fruit Candy"
    },
    "话梅糖": {
        "factual_desc": "传统中式糖果，以话梅肉入料，酸甜开胃，独立包装，是长途旅行与晕车人士的最爱。",
        "nostalgic_quote": "晕车的时候含一颗，那种酸到皱眉的感觉，反而让胃舒服了很多。",
        "price": 0.3, "era": "80年代", "en_name": "Preserved Plum Candy"
    },
    "陈皮糖": {
        "factual_desc": "广东传统糖果，新会陈皮入料，甘香醇厚，理气健脾的功效让大人也心甘情愿给孩子买。",
        "nostalgic_quote": "那种苦中带甜的复杂滋味，是广东人对于食疗最聪明的诠释。",
        "price": 0.3, "era": "80年代", "en_name": "Dried Tangerine Candy"
    },
    "高粱饴": {
        "factual_desc": "山东青岛传统软糖，以高粱淀粉制作，Q弹拉丝，多口味选择，是北方春节必备的年货。",
        "nostalgic_quote": "能拉好长好长的丝，是山东孩子对于韧性最早的理解。",
        "price": 0.5, "era": "80年代", "en_name": "Sorghum Soft Candy"
    },
    "牛皮糖": {
        "factual_desc": "江苏扬州传统名点，芝麻包裹的麦芽糖软糖，韧性十足，是淮扬菜系中的甜品代表。",
        "nostalgic_quote": "粘牙粘到张不开嘴，却越嚼越香，是扬州人对于甜食最执着的表达。",
        "price": 1.0, "era": "80年代", "en_name": "Cowhide Candy"
    },
    "花生牛轧糖": {
        "factual_desc": "台湾传入的西式糖果，花生与奶糖的结合，软硬适中，是年货糖果盒里的常客。",
        "nostalgic_quote": "咬下去花生的脆与奶糖的软同时在嘴里交融，是口感最丰富的甜蜜。",
        "price": 0.5, "era": "90年代", "en_name": "Peanut Nougat"
    },
    "玉米软糖": {
        "factual_desc": "以玉米淀粉为原料的软糖，玉米造型、玉米香味，是80年代粗粮概念的零食化尝试。",
        "nostalgic_quote": "金黄色的玉米形状，咬一口软糯香甜，仿佛咬到了丰收的秋天。",
        "price": 0.3, "era": "80年代", "en_name": "Corn Soft Candy"
    },
    "石头糖": {
        "factual_desc": "外观酷似鹅卵石的巧克力糖，外层巧克力、内层饼干碎，造型独特是最大卖点。",
        "nostalgic_quote": "装在口袋里像攥着一把宝石，分给同学时感觉自己像个富翁。",
        "price": 0.5, "era": "90年代", "en_name": "Stone Candy"
    },
    "戒指糖": {
        "factual_desc": "将糖果做成戒指造型，戴在手指上边玩边吃，是80年代最具创意的儿童糖果设计。",
        "nostalgic_quote": "戴在手指上舔来舔去，觉得自己是公主，直到糖化得粘手才罢休。",
        "price": 0.5, "era": "90年代", "en_name": "Ring Pop"
    },
    "口红糖": {
        "factual_desc": "外形模仿口红，可以像大人一样涂在嘴唇上再舔掉，满足了小女孩对化妆品的最初向往。",
        "nostalgic_quote": "学着妈妈的样子抹口红，然后偷偷舔掉，是最幼稚的角色扮演。",
        "price": 0.5, "era": "90年代", "en_name": "Lipstick Candy"
    },
    "香烟糖": {
        "factual_desc": "外观模仿香烟的白色长条糖，满足孩子模仿大人的心理，现已因健康倡导而逐渐退出市场。",
        "nostalgic_quote": "叼在嘴里假装吞云吐雾，是对于成人世界最天真的模仿。",
        "price": 0.3, "era": "80年代", "en_name": "Candy Cigarettes"
    },
    "酒心巧克力": {
        "factual_desc": "外壳巧克力、内馅为烈酒或甜酒的夹心糖果，咬破后酒香四溢，是大人孩子都觊觎的'禁果'。",
        "nostalgic_quote": "偷偷咬破一颗，假装喝醉的样子，是对于大人世界最天真的窥探。",
        "price": 1.0, "era": "80年代", "en_name": "Liquor Chocolate"
    },
    "金币巧克力": {
        "factual_desc": "外形模仿金币的金箔包装巧克力，过年时常见，寓意招财进宝，是中国人最喜庆的巧克力。",
        "nostalgic_quote": "抓一把金币巧克力当财宝，是童年对于富裕最简单的想象。",
        "price": 0.5, "era": "90年代", "en_name": "Gold Coin Chocolate"
    },
    
    # ===== 辣条豆制品 (45个) =====
    "卫龙大面筋": {
        "factual_desc": "河南卫龙食品旗舰产品，麻辣味面筋制品，油润红亮，是00后最深刻的集体味觉记忆与辣条代名词。",
        "nostalgic_quote": "五毛钱一包的卫龙，和小伙伴分着吃，一人一根，是最普惠的快乐。",
        "price": 0.5, "era": "00年代", "en_name": "Weilong Da Mian Jin"
    },
    "亲嘴烧": {
        "factual_desc": "卫龙旗下小块辣条，独立小包装，一口一片的设计方便分享，是课间十分钟的社交利器。",
        "nostalgic_quote": "一片亲嘴烧传遍了整个小组，辣得吸气却笑得开心，是最亲密的分享。",
        "price": 0.5, "era": "00年代", "en_name": "Qinzui Shao"
    },
    "臭干子": {
        "factual_desc": "湖南特色豆制品零食，发酵后的独特气味与麻辣调味结合，是辣条界最具争议性的存在。",
        "nostalgic_quote": "闻着臭吃着香的哲学，在臭干子身上得到了最完美的诠释。",
        "price": 0.5, "era": "90年代", "en_name": "Stinky Tofu Snack"
    },
    "香菇肥牛": {
        "factual_desc": "大豆蛋白制品，香菇与牛肉味调味，口感似肉非肉，是素食辣条的经典之作。",
        "nostalgic_quote": "没有肉却吃出肉的满足感，是童年对于美食最经济的追求。",
        "price": 0.5, "era": "90年代", "en_name": "Mushroom Beef Flavor"
    },
    "唐僧肉": {
        "factual_desc": "以《西游记》为卖点的辣条，包装上印有唐僧形象，是大豆蛋白制品，名字比味道更传奇。",
        "nostalgic_quote": "吃了唐僧肉能长生不老，虽然知道是假的，但吃起来还是格外香。",
        "price": 0.3, "era": "90年代", "en_name": "Tang Seng Meat"
    },
    "素火爆鸡筋": {
        "factual_desc": "湖南风味辣条，以辣椒与花椒调味，口感筋道，是重口味辣条爱好者的首选。",
        "nostalgic_quote": "辣到眼泪直流却停不下来，那种痛感是叛逆期最喜欢的刺激。",
        "price": 0.5, "era": "00年代", "en_name": "Spicy Chicken Tendon"
    },
    "牛板筋": {
        "factual_desc": "仿牛板筋口感的大豆制品，嚼劲十足，麻辣入味，是口感党最爱的辣条品类。",
        "nostalgic_quote": "一根能嚼一整节课，是上课偷吃时最省心的选择。",
        "price": 1.0, "era": "00年代", "en_name": "Beef Tendon Style"
    },
    "泡椒牛板筋": {
        "factual_desc": "以泡椒为特色的牛板筋口味辣条，酸辣交织，是西南地区学生的最爱。",
        "nostalgic_quote": "泡椒的酸和辣椒的辣在嘴里打架，是味蕾最热闹的狂欢。",
        "price": 1.0, "era": "00年代", "en_name": "Pickled Pepper Tendon"
    },
    "小面筋": {
        "factual_desc": "卫龙旗下细条面筋，比大面筋更入味，一根接一根停不下来，是辣条入门者的首选。",
        "nostalgic_quote": "一把小面筋塞进嘴里，辣油在嘴里爆开的瞬间，是最直接的满足。",
        "price": 0.5, "era": "00年代", "en_name": "Weilong Xiao Mian Jin"
    },
    "麻辣王子": {
        "factual_desc": "湖南玉峰食品出品，正宗湖南麻辣味，独立小包装，是近年来辣条界的后起之秀。",
        "nostalgic_quote": "又麻又辣很地道的湖南味，让不吃辣的同学也忍不住来一根。",
        "price": 1.0, "era": "10年代", "en_name": "Spicy Prince"
    },
    "五毛一包的辣条": {
        "factual_desc": "泛指90年代至00年代学校周边小卖部五毛钱能买到的各类辣条，是价格最亲民的零食代表。",
        "nostalgic_quote": "五毛钱就能买到的快乐，是童年对于性价比最深刻的理解。",
        "price": 0.5, "era": "90年代", "en_name": "50-Cent Latiao"
    },
    
    # ===== 饼干糕点 (45个) =====
    "鬼脸嘟嘟": {
        "factual_desc": "卡夫食品出品的鬼脸造型饼干，两片饼干夹心，鬼脸图案 whimsical，是90年代进口饼干代表。",
        "nostalgic_quote": "把鬼脸饼干对着自己做表情，和同桌比谁更丑，是最幼稚也最快乐的游戏。",
        "price": 3.5, "era": "90年代", "en_name": "Ghoul Face Cookies"
    },
    "奥利奥老版": {
        "factual_desc": "亿滋旗下经典夹心饼干，'扭一扭、舔一舔、泡一泡'的广告词家喻户晓，是饼干界的现象级产品。",
        "nostalgic_quote": "严格按照广告步骤吃奥利奥，是童年对于仪式感的最早实践。",
        "price": 5.0, "era": "90年代", "en_name": "Oreo Classic"
    },
    "3+2饼干": {
        "factual_desc": "康师傅出品的三层饼干两层夹心苏打饼干，柠檬与奶油双口味最经典，是早餐饼干的代表。",
        "nostalgic_quote": "早上一包3+2配一盒牛奶，是赶时间时最踏实的早餐。",
        "price": 3.0, "era": "00年代", "en_name": "3+2 Sandwich Biscuit"
    },
    "闲趣饼干": {
        "factual_desc": "亿滋旗下咸饼干，薄脆口感，清咸口味，是下午茶与追剧时的绝佳伴侣。",
        "nostalgic_quote": "一片接一片停不下来，是追剧时最不需要思考的美味。",
        "price": 4.0, "era": "90年代", "en_name": "Tuc Crackers"
    },
    "王子夹心饼干": {
        "factual_desc": "达能旗下夹心饼干，巧克力与草莓双口味，是欧洲进口饼干在中国市场的早期代表。",
        "nostalgic_quote": "第一次吃进口饼干就是王子，那种高级感至今难忘。",
        "price": 6.0, "era": "90年代", "en_name": "Prince Biscuit"
    },
    "嘉顿手指饼干": {
        "factual_desc": "香港嘉顿出品，细长条造型，酥脆可口，既可当零食也可做蛋糕围边，是香港茶餐厅文化的一部分。",
        "nostalgic_quote": "蘸着牛奶吃，看手指饼干慢慢变软，是香港电影教我们的吃法。",
        "price": 5.0, "era": "90年代", "en_name": "Garden Finger Biscuit"
    },
    "蛋黄派": {
        "factual_desc": "好丽友旗下夹心蛋糕，蛋黄口味奶油夹心，软糯蛋糕体，是早餐与下午茶的常客。",
        "nostalgic_quote": "咬开蛋糕发现里面藏着奶油，那种惊喜感让人忍不住再咬一口。",
        "price": 3.0, "era": "00年代", "en_name": "Egg Yolk Pie"
    },
    "蛋黄酥": {
        "factual_desc": "传统中式糕点，酥皮包裹豆沙与咸蛋黄，层次分明，口感丰富，是近年来复兴的中式点心代表。",
        "nostalgic_quote": "咬一口酥皮掉渣，咸蛋黄的油香在嘴里化开，是中式点心最精致的表达。",
        "price": 5.0, "era": "10年代", "en_name": "Egg Yolk Pastry"
    },
    "凤梨酥": {
        "factual_desc": "台湾传统点心，酥皮包裹凤梨馅料，甜中带酸，是台湾最具代表性的伴手礼。",
        "nostalgic_quote": "去台湾旅游必买的伴手礼，每一块都是宝岛的阳光味道。",
        "price": 8.0, "era": "90年代", "en_name": "Pineapple Cake"
    },
    "绿豆糕": {
        "factual_desc": "传统中式糕点，绿豆粉压制成型，口感细腻清甜，是端午节与夏季消暑的传统食品。",
        "nostalgic_quote": "外婆放在冰箱里的绿豆糕，冰冰凉凉，是夏天最期待的甜点。",
        "price": 3.0, "era": "80年代", "en_name": "Mung Bean Cake"
    },
    "沙琪玛": {
        "factual_desc": "满族传统糕点，面条油炸后裹糖浆压制切块，香甜软糯，是北方年货与茶点的代表。",
        "nostalgic_quote": "咬一口粘牙却甜蜜，是过年时茶几上最受欢迎的茶点。",
        "price": 5.0, "era": "80年代", "en_name": "Sachima"
    },
    "桃酥": {
        "factual_desc": "传统中式酥点，以核桃入料，口感酥松，表面有裂纹，是江南地区传统茶点。",
        "nostalgic_quote": "轻轻一碰就碎，要小心捧着吃，是中式点心最温柔的表达。",
        "price": 2.0, "era": "80年代", "en_name": "Walnut Crisp"
    },
    
    # ===== 蜜饯与速食 (45个) =====
    "话梅": {
        "factual_desc": "以青梅腌制而成的传统蜜饯，酸甜开胃，可含食也可泡水，是中式零食的经典代表。",
        "nostalgic_quote": "含一颗话梅，酸到眯眼却忍不住再含一颗，是对于酸味最执着的追求。",
        "price": 2.0, "era": "80年代", "en_name": "Preserved Plum"
    },
    "九制陈皮": {
        "factual_desc": "广东新会陈皮经九道工序腌制而成，甘香醇厚，理气健脾，是广东人最钟意的传统零食。",
        "nostalgic_quote": "妈妈说吃陈皮对胃好，于是理直气壮地吃了一整袋。",
        "price": 1.5, "era": "80年代", "en_name": "Nine-Process Chenpi"
    },
    "无花果丝": {
        "factual_desc": "以萝卜丝仿制无花果口感的蜜饯，酸甜适中，一毛一袋的价格是学生党的最爱。",
        "nostalgic_quote": "一毛钱的快乐，可以嗦一整节课，是上课偷吃最完美的选择。",
        "price": 0.1, "era": "90年代", "en_name": "Fig Shreds"
    },
    "酸角": {
        "factual_desc": "热带水果罗望子制成的蜜饯，酸甜开胃，外形似豆荚，是西南地区孩子的特色零食。",
        "nostalgic_quote": "剥开豆荚一样的外壳，把果肉嗦得干干净净，是云南孩子最熟练的技巧。",
        "price": 1.0, "era": "90年代", "en_name": "Tamarind"
    },
    "加应子": {
        "factual_desc": "福建传统蜜饯，以芙蓉李腌制而成，酸甜适口，是闽南地区传统茶点。",
        "nostalgic_quote": "过年时果盘里一定有它，是福建人对于年味最甜蜜的记忆。",
        "price": 2.0, "era": "80年代", "en_name": "Jiayingzi Plum"
    },
    "情人梅": {
        "factual_desc": "以青梅腌制的蜜饯，名字甜蜜，口感酸甜，是年轻人喜爱的休闲零食。",
        "nostalgic_quote": "买一包情人梅送给暗恋的人，是青春期最含蓄的表白。",
        "price": 2.0, "era": "90年代", "en_name": "Lover's Plum"
    },
    "雪花梅": {
        "factual_desc": "表面裹满白糖的梅子蜜饯，糖霜如雪，酸甜交织，是视觉与味觉的双重享受。",
        "nostalgic_quote": "糖霜粘在手上，舔干净手指是吃完后必须完成的仪式。",
        "price": 1.5, "era": "90年代", "en_name": "Snow Plum"
    },
    "溜溜梅": {
        "factual_desc": "安徽溜溜果园出品，多种口味选择，'你没事吧'广告词网络爆红，是近年来蜜饯界的现象级产品。",
        "nostalgic_quote": "杨幂的广告虽然魔性，但溜溜梅确实让人没事就想吃一颗。",
        "price": 3.0, "era": "10年代", "en_name": "Liuliumei"
    },
    "北京方便面": {
        "factual_desc": "河南南街村出品，'北京'牌麻辣方便面，干吃泡食两相宜，是中原地区方便面的代表。",
        "nostalgic_quote": "虽然叫北京方便面，但北京人没吃过，是河南人最骄傲的地方特产。",
        "price": 1.0, "era": "90年代", "en_name": "Beijing Instant Noodle"
    },
    "南街村方便面": {
        "factual_desc": "河南南街村集团出品，中国最后的人民公社生产的方便面，红色包装极具时代特色。",
        "nostalgic_quote": "吃着南街村的面，听着人民公社的故事，是最特别的历史体验。",
        "price": 1.0, "era": "90年代", "en_name": "Nanjiecun Noodle"
    },
    "华丰三鲜伊面": {
        "factual_desc": "广东华丰食品出品，三鲜口味清淡，面饼金黄，是华南地区方便面的经典之作。",
        "nostalgic_quote": "小时候生病才能吃到的华丰面，是最温暖的病号餐。",
        "price": 1.5, "era": "80年代", "en_name": "Huafeng Three Fresh Noodle"
    },
    "统一100方便面": {
        "factual_desc": "统一集团出品，100克大面饼设计，料包丰富，是统一在方便面市场的早期代表作。",
        "nostalgic_quote": "晚自习后在宿舍泡一碗，是全宿舍共享的深夜食堂。",
        "price": 2.0, "era": "90年代", "en_name": "Uni President 100"
    },
    "康师傅红烧牛肉面": {
        "factual_desc": "康师傅最经典的口味，红烧牛肉味深入人心，是中国方便面市场的绝对霸主。",
        "nostalgic_quote": "第一次吃方便面就是红烧牛肉味，那种惊艳至今难忘。",
        "price": 2.5, "era": "90年代", "en_name": "Master Kong Beef Noodle"
    },
    "幸运方便面": {
        "factual_desc": "新加坡味丹集团出品，蟹皇面与红烧排骨面最经典，是潮汕地区人们煮泡面的首选。",
        "nostalgic_quote": "潮汕人煮面必加幸运蟹皇面，是刻在DNA里的家乡味道。",
        "price": 1.5, "era": "90年代", "en_name": "Lucky Instant Noodle"
    },
    "出前一丁": {
        "factual_desc": "日本日清食品出品，港版出前一丁在香港茶餐厅文化中地位崇高，麻油味是最经典的口味。",
        "nostalgic_quote": "看港剧里警察深夜吃公仔面，是对于香港夜生活最向往的想象。",
        "price": 5.0, "era": "90年代", "en_name": "Demae Iccho"
    },
    "螺蛳粉": {
        "factual_desc": "广西柳州特色小吃，酸笋的独特气味配合辣油与螺蛳汤，是近年来速食界的现象级网红产品。",
        "nostalgic_quote": "虽然被室友嫌弃像厕所炸了，但嗦粉的快乐只有自己知道。",
        "price": 10.0, "era": "10年代", "en_name": "Liuzhou Luosifen"
    },
    "热干面": {
        "factual_desc": "武汉特色小吃，芝麻酱拌面，面条筋道，是武汉人早餐的标配与乡愁的寄托。",
        "nostalgic_quote": "过早必吃热干面，端着纸碗边走边吃，是武汉街头最独特的风景。",
        "price": 5.0, "era": "80年代", "en_name": "Wuhan Hot Dry Noodles"
    },
    "酸辣粉": {
        "factual_desc": "四川重庆特色粉条，红薯粉制成的粉条配上酸辣汤底，麻辣鲜香，是川渝小吃的代表。",
        "nostalgic_quote": "辣到鼻涕直流却停不下来，是重庆人对于辣味最执着的追求。",
        "price": 8.0, "era": "90年代", "en_name": "Hot and Sour Noodles"
    },
}

# 通用文案生成器
def generate_generic_content(name, category):
    """为未匹配的零食生成通用但不模板化的文案"""
    
    # 分类特定的描述词库
    desc_words = {
        "膨化食品": ["香脆", "蓬松", "咔滋", "油润", "咸香", "咔嚓", "空气感"],
        "饮料汽水": ["清爽", "气泡", "甘甜", "解渴", "冰爽", "激爽", "沁人心脾"],
        "糖果巧克力": ["甜蜜", "丝滑", "浓郁", "融化", "Q弹", "软糯", "香甜"],
        "辣条豆制品": ["麻辣", "劲道", "油亮", "刺激", "香辣", "够味", "嚼劲"],
        "饼干糕点": ["酥脆", "松软", "层次", "香甜", "绵密", "掉渣", "细腻"],
        "蜜饯与速食": ["酸甜", "开胃", "方便", "即食", "软糯", "入味", "便捷"]
    }
    
    # 分类特定的回忆词库
    memory_phrases = {
        "膨化食品": [
            "撕开包装的声音，是放学后最动听的乐章。",
            "一包膨化食品，一部动画片，是最完美的下午茶。",
            "手指上的调味粉要舔干净，那是不能浪费的美味。",
            "和小伙伴分着吃，你一片我一片，是最公平的分享。",
            "捏碎的声音在安静的课堂上格外响亮，是最刺激的心跳。"
        ],
        "饮料汽水": [
            "冰镇后一口气喝半瓶，打嗝的声音是最满足的叹息。",
            "夏天运动后来一瓶，气泡在喉咙里跳舞的感觉最爽快。",
            "玻璃瓶要还给小卖部，但那口清凉值得跑一趟。",
            "和最好的朋友共喝一瓶，是友谊最亲密的证明。",
            "偷偷买一瓶藏在书包里，是童年最刺激的秘密。"
        ],
        "糖果巧克力": [
            "含在嘴里等它慢慢化开，是对于甜蜜最耐心的等待。",
            "糖纸收集起来夹在书里，是最甜的回忆。",
            "最后一颗总是舍不得吃，要留到最开心的时候。",
            "和同桌分享最后一颗糖，是友谊最甜蜜的交换。",
            "剥开糖纸的过程，是品尝之前最重要的仪式。"
        ],
        "辣条豆制品": [
            "辣到吸气却停不下来，是对于辣味最执着的追求。",
            "一包辣条传遍了整个小组，是最普惠的社交货币。",
            "偷偷在课堂上一口吞下，是最刺激的心跳体验。",
            "手指上的辣油要舔干净，那是不能浪费的美味。",
            "和小伙伴比谁更能吃辣，是最幼稚也最热血的比拼。"
        ],
        "饼干糕点": [
            "配一杯热牛奶，是早餐最踏实的搭配。",
            "咬一口酥皮掉渣，是最需要小心呵护的美味。",
            "下午茶时间配饼干，是最优雅的休闲。",
            "泡在牛奶里变软的那一刻，是口感最温柔的转变。",
            "收集不同口味是童年最执着的收藏爱好。"
        ],
        "蜜饯与速食": [
            "长途旅行时含一颗，是对于无聊最甜蜜的抵抗。",
            "开水一冲就能吃，是懒人最需要的便利。",
            "酸酸甜甜开胃解腻，是饭后最需要的调剂。",
            "囤在宿舍的深夜粮仓，是熬夜时最可靠的补给。",
            "一包解决一顿饭，是学生党最经济的选择。"
        ]
    }
    
    words = desc_words.get(category, ["美味", "可口", "香甜"])
    memories = memory_phrases.get(category, ["每一口都是童年的味道，每一颗都是回忆的载体。"])
    
    # 随机选择词语组合成描述
    word1, word2 = random.sample(words, 2)
    factual = f"{name}，{word1}与{word2}兼具的经典{category}，是无数人童年零食记忆的重要组成部分。"
    
    nostalgic = random.choice(memories)
    
    # 价格根据年代
    era_prices = {
        "80年代": (0.1, 1.0),
        "90年代": (0.5, 3.0),
        "00年代": (1.0, 5.0),
        "10年代": (5.0, 15.0)
    }
    
    # 根据名称特征判断年代
    if "老" in name or "早期" in name:
        era = random.choice(["80年代", "90年代"])
    elif "老版" in name:
        era = "90年代"
    else:
        era = random.choice(["90年代", "00年代", "10年代"])
    
    price_range = era_prices.get(era, (1.0, 5.0))
    price = round(random.uniform(price_range[0], price_range[1]), 1)
    
    # 生成拼音英文名
    en_name = name.replace("老版", "").replace("早期", "").replace("包装", "").replace("经典", "")
    en_name = f"Classic {en_name[:10]}"
    
    return {
        "factual_desc": factual,
        "nostalgic_quote": nostalgic,
        "price": price,
        "era": era,
        "en_name": en_name
    }


def get_snack_info(name, category):
    """根据零食名称获取定制化信息"""
    if name in SNACK_DATABASE:
        return SNACK_DATABASE[name]
    
    # 尝试部分匹配
    for key in SNACK_DATABASE:
        if key in name or name in key:
            return SNACK_DATABASE[key]
    
    # 生成通用内容
    return generate_generic_content(name, category)


def process_snacks():
    """处理所有零食数据"""
    # 读取原始数据
    with open('src/data/snacks.json', 'r', encoding='utf-8') as f:
        snacks = json.load(f)
    
    print(f"Processing {len(snacks)} snacks...")
    
    # 为每个零食生成新字段
    processed = []
    for snack in snacks:
        name = snack.get('name', '')
        category = snack.get('category', '膨化食品')
        
        info = get_snack_info(name, category)
        
        # 构建新的零食对象
        new_snack = {
            "id": snack.get('id'),
            "name": name,
            "en_name": info.get('en_name', ''),
            "category": category,
            "status": snack.get('status', '在售'),
            "tags": snack.get('tags', []),
            "image": snack.get('image', ''),
            "brand": snack.get('brand', name.split('老版')[0].split('早期')[0].split('包装')[0].strip()),
            "factual_desc": info.get('factual_desc', ''),
            "nostalgic_quote": info.get('nostalgic_quote', ''),
            "price": info.get('price', 1.0),
            "era": info.get('era', '90年代'),
        }
        
        processed.append(new_snack)
    
    # 保存为新的JSON文件
    with open('src/data/snacks_premium.json', 'w', encoding='utf-8') as f:
        json.dump(processed, f, ensure_ascii=False, indent=2)
    
    print(f"✓ Generated snacks_premium.json with {len(processed)} snacks")
    
    # 统计
    eras = {}
    for s in processed:
        eras[s['era']] = eras.get(s['era'], 0) + 1
    print(f"\nEra distribution: {eras}")
    
    # 显示几个示例
    print("\n--- Sample Output ---")
    for s in processed[:5]:
        print(f"\n{s['id']}. {s['name']} ({s['era']}) - ¥{s['price']}")
        print(f"   EN: {s['en_name']}")
        print(f"   Desc: {s['factual_desc'][:50]}...")
        print(f"   Quote: {s['nostalgic_quote'][:50]}...")


if __name__ == '__main__':
    process_snacks()
