import { useState, useEffect } from 'react';
import { Sparkles, X, RefreshCw, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface FlavorAIAnalysisProps {
  flavorStats: {
    spicy: number;
    sweet: number;
    salty: number;
    sour: number;
    puffed: number;
    drink: number;
  };
  collectedSnacks: any[];
  tastedSnacks: any[];
  onClose: () => void;
}

interface AnalysisResult {
  personality: string;
  eraPreference: string;
  flavorProfile: string;
  recommendation: string;
  emotionalConnection: string;
}

export function FlavorAIAnalysis({
  flavorStats,
  collectedSnacks,
  tastedSnacks,
  onClose,
}: FlavorAIAnalysisProps) {
  const { language } = useLanguage();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  // 模拟AI分析
  const performAnalysis = async () => {
    setIsAnalyzing(true);
    
    // 模拟AI分析延迟
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 基于用户数据生成分析结果
    const stats = flavorStats;
    const total = Object.values(stats).reduce((a, b) => a + b, 0);
    
    // 找出主要口味
    const sortedFlavors = Object.entries(stats)
      .sort(([,a], [,b]) => b - a)
      .filter(([,v]) => v > 0);
    
    const topFlavor = sortedFlavors[0]?.[0] || 'sweet';
    const secondFlavor = sortedFlavors[1]?.[0] || '';
    
    // 生成个性标签
    const personalityMap: Record<string, string> = {
      spicy: language === 'zh' ? '热辣冒险家' : 'Spicy Adventurer',
      sweet: language === 'zh' ? '甜蜜治愈系' : 'Sweet Healer',
      salty: language === 'zh' ? '咸香务实派' : 'Salty Pragmatist',
      sour: language === 'zh' ? '酸爽探索者' : 'Sour Explorer',
      puffed: language === 'zh' ? '膨化享乐派' : 'Puffed Hedonist',
      drink: language === 'zh' ? '饮品鉴赏家' : 'Beverage Connoisseur',
    };
    
    // 年代偏好分析
    const eraCounts: Record<string, number> = {};
    [...collectedSnacks, ...tastedSnacks].forEach(s => {
      eraCounts[s.era] = (eraCounts[s.era] || 0) + 1;
    });
    const topEra = Object.entries(eraCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || '90s';
    
    const eraMap: Record<string, string> = {
      '80s': language === 'zh' ? '八零复古派' : '80s Retro',
      '90s': language === 'zh' ? '九零怀旧党' : '90s Nostalgic',
      '00s': language === 'zh' ? '千禧弄潮儿' : '00s Trendsetter',
      '10s': language === 'zh' ? '新时代尝鲜者' : '10s Explorer',
    };
    
    // 生成分析结果
    const analysisResult: AnalysisResult = {
      personality: personalityMap[topFlavor] || personalityMap.sweet,
      eraPreference: eraMap[topEra] || eraMap['90s'],
      flavorProfile: generateFlavorProfile(topFlavor, secondFlavor, language),
      recommendation: generateRecommendation(topFlavor, language),
      emotionalConnection: generateEmotionalConnection(total, language),
    };
    
    setResult(analysisResult);
    setIsAnalyzing(false);
  };

  useEffect(() => {
    performAnalysis();
  }, []);

  return (
    <div className="fixed inset-0 z-[150] bg-ink/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="relative bg-rice-paper rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 31px,
              rgba(218, 165, 32, 0.05) 31px,
              rgba(218, 165, 32, 0.05) 32px
            )
          `,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h3 
              className="text-lg font-bold text-ink-dark"
              style={{ fontFamily: '"Source Han Serif CN", serif' }}
            >
              {language === 'zh' ? 'AI 风味解析' : 'AI Flavor Analysis'}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-stone-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-stone-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isAnalyzing ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-10 h-10 text-amber-500 animate-spin mb-4" />
              <p className="text-stone-600">
                {language === 'zh' ? '正在分析您的零食偏好...' : 'Analyzing your snack preferences...'}
              </p>
            </div>
          ) : result ? (
            <div className="space-y-6">
              {/* 个性标签 */}
              <div className="text-center">
                <div className="inline-flex flex-col items-center">
                  <span className="text-sm text-stone-500 mb-1">
                    {language === 'zh' ? '您的零食人格' : 'Your Snack Personality'}
                  </span>
                  <span 
                    className="text-3xl font-bold text-amber-700"
                    style={{ fontFamily: '"Source Han Serif CN", serif' }}
                  >
                    {result.personality}
                  </span>
                </div>
              </div>

              {/* 年代偏好 */}
              <div className="flex justify-center gap-4">
                <div className="px-4 py-2 bg-amber-50 rounded-full">
                  <span className="text-xs text-stone-500 block text-center">
                    {language === 'zh' ? '年代归属' : 'Era Preference'}
                  </span>
                  <span className="text-sm font-medium text-amber-800">
                    {result.eraPreference}
                  </span>
                </div>
                <div className="px-4 py-2 bg-stone-100 rounded-full">
                  <span className="text-xs text-stone-500 block text-center">
                    {language === 'zh' ? '收藏数量' : 'Collection'}
                  </span>
                  <span className="text-sm font-medium text-stone-700">
                    {collectedSnacks.length + tastedSnacks.length} {language === 'zh' ? '件' : 'items'}
                  </span>
                </div>
              </div>

              {/* 风味雷达 */}
              <div className="bg-white/50 rounded-xl p-4">
                <h4 className="text-sm font-medium text-stone-600 mb-3">
                  {language === 'zh' ? '风味画像' : 'Flavor Profile'}
                </h4>
                <p 
                  className="text-sm text-stone-700 leading-relaxed"
                  style={{ fontFamily: '"Source Han Serif CN", serif' }}
                >
                  {result.flavorProfile}
                </p>
              </div>

              {/* 推荐 */}
              <div className="bg-amber-50/50 rounded-xl p-4 border border-amber-100">
                <h4 className="text-sm font-medium text-amber-800 mb-2">
                  {language === 'zh' ? 'AI 推荐' : 'AI Recommendation'}
                </h4>
                <p className="text-sm text-amber-900/70">
                  {result.recommendation}
                </p>
              </div>

              {/* 情感连接 */}
              <div className="text-center pt-4 border-t border-stone-200">
                <p 
                  className="text-sm text-stone-600 italic"
                  style={{ fontFamily: '"Source Han Serif CN", serif' }}
                >
                  "{result.emotionalConnection}"
                </p>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        {!isAnalyzing && result && (
          <div className="flex justify-center gap-3 p-6 pt-0">
            <button
              onClick={performAnalysis}
              className="flex items-center gap-2 px-4 py-2 text-sm text-stone-600 hover:text-ink-dark transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              {language === 'zh' ? '重新分析' : 'Re-analyze'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// 生成风味画像描述
function generateFlavorProfile(top: string, second: string, lang: string): string {
  if (lang === 'zh') {
    const profiles: Record<string, string> = {
      'spicy-sweet': '您对味觉的追求热烈而丰富，既享受辣味的刺激，又钟情于甜食的慰藉。这种矛盾的组合恰恰反映了您性格中的多面性——既能勇敢面对挑战，又懂得适时犒赏自己。',
      'spicy-salty': '您是地道的重口味爱好者，无辣不欢、无咸不香。您的美食地图写满了火锅、辣条和腌制品，这种味觉偏好映射出您性格中的直爽与热情。',
      'sweet-sour': '酸酸甜甜是您的生活哲学。您钟爱那些层次丰富的味觉体验，就像您的人生——既有初恋般的甜蜜，也有成长中的酸涩回味。',
      'sweet-sweet': '纯粹的甜蜜派。您相信生活本该如此简单直接，一颗糖、一块巧克力就能让阴霾散去。您的天真与乐观是周围人的治愈良药。',
      'spicy-spicy': '极致的辣，极致的爽。您对刺激的追求近乎偏执，每一次味蕾的燃烧都是您生命力的证明。',
    };
    return profiles[`${top}-${second}`] || profiles[`${top}-${top}`] || '您的味觉偏好独特而个性化，这种独特的组合塑造了专属于您的零食记忆。';
  }
  return 'Your flavor profile is unique and personalized, creating snack memories that belong only to you.';
}

// 生成推荐
function generateRecommendation(top: string, lang: string): string {
  if (lang === 'zh') {
    const recs: Record<string, string> = {
      spicy: '推荐您尝试来自湖南的麻辣王子，它的辣度分级系统能让您找到最适合自己的刺激强度。',
      sweet: '不妨尝试一下大白兔奶糖的新口味系列，或者寻找一些手工牛轧糖，让甜蜜更纯粹。',
      salty: '建议您探索各地的海苔脆片和咸蛋黄系列，这些咸香小食会让您欲罢不能。',
      sour: '推荐您寻找一些老式的酸梅糖和陈皮梅，那种回甘的酸是工业糖果无法复制的。',
      puffed: '试试各地的手工锅巴和米饼，它们的口感层次远胜工业化生产的膨化食品。',
      drink: '建议您收藏一些 vintage 饮料包装，那些玻璃瓶装汽水正成为新的收藏热点。',
    };
    return recs[top] || '继续探索，下一包零食可能会给您带来意想不到的惊喜。';
  }
  return 'Continue exploring - your next snack might bring unexpected surprises.';
}

// 生成情感连接
function generateEmotionalConnection(total: number, lang: string): string {
  if (lang === 'zh') {
    if (total === 0) return '每一包零食都藏着一个故事，开始您的收藏之旅吧。';
    if (total < 10) return '刚刚开始的味道探索，每一件收藏都是一段珍贵的记忆起点。';
    if (total < 30) return '您正在构建属于自己的味觉博物馆，这些数字背后是您成长的轨迹。';
    if (total < 50) return '您已经是一位资深的零食鉴赏家了，这些味道串联起了您的人生故事。';
    return '您的收藏已臻化境，这些零食不仅是味道，更是您与时光对话的媒介。';
  }
  return 'Every snack tells a story. Keep building your collection.';
}
