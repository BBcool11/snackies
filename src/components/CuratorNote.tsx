import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export function CuratorNote() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // 处理打开弹窗 - 添加延迟展开效果
  const handleOpen = () => {
    setIsOpen(true);
    // 延迟0.5秒后开始展开动画
    setTimeout(() => {
      setShowModal(true);
    }, 500);
  };

  // 处理关闭弹窗
  const handleClose = () => {
    setShowModal(false);
    // 等待动画完成后关闭
    setTimeout(() => {
      setIsOpen(false);
    }, 400);
  };

  const exhibitCount = 380;

  // 内联版本 - 标题下方的小卡片
  return (
    <>
      <div 
        className={`transition-all duration-300 ease-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
        }`}
      >
        <button
          onClick={handleOpen}
          className="group relative"
        >
          <div 
            className="relative px-6 py-4 transition-all duration-300 hover:shadow-lg"
            style={{
              background: '#FAFAF8',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)',
              borderRadius: '2px',
              transform: 'rotate(-1deg)',
            }}
          >
            {/* 胶带效果 */}
            <div 
              className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 opacity-60"
              style={{
                background: 'rgba(255,255,255,0.4)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                transform: 'translateX(-50%) rotate(-2deg)',
              }}
            />
            
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <span className="text-lg">✉️</span>
              </div>
              <div className="text-left">
                <p 
                  className="text-sm font-medium text-amber-900/80"
                  style={{ fontFamily: '"Source Han Serif CN", serif' }}
                >
                  有一封信给你
                </p>
                <p className="text-xs text-amber-700/50 mt-0.5">点击展开阅读</p>
              </div>
              <span className="text-amber-400 group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </div>
        </button>
      </div>

      {/* 弹窗内容 */}
      {isOpen && (
        <>
          <div
            className={`fixed inset-0 z-[99] bg-white/40 backdrop-blur-sm transition-opacity duration-500 ${
              showModal ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={handleClose}
          />
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none">
            <div className="relative pointer-events-auto">
              {/* 关闭按钮 - 放在信纸外部 */}
              <button
                onClick={handleClose}
                className={`absolute -top-3 -right-3 w-8 h-8 flex items-center justify-center text-amber-800/60 hover:text-amber-800 transition-all duration-300 rounded-full bg-white/80 hover:bg-white shadow-sm z-10 ${
                  showModal ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
                }`}
                style={{ transitionDelay: showModal ? '300ms' : '0ms' }}
              >
                <X className="w-4 h-4" />
              </button>
              <NoteModal 
                exhibitCount={exhibitCount} 
                isVisible={showModal}
              />
            </div>
          </div>
        </>
      )}
    </>
  );
}

// 带有展开动画的弹窗组件
function NoteModal({ 
  exhibitCount, 
  isVisible 
}: { 
  exhibitCount: number; 
  isVisible: boolean;
}) {
  return (
    <div 
      className={`relative w-full max-w-xl max-h-[85vh] overflow-y-auto p-8 md:p-10 pointer-events-auto transition-all duration-700 ease-out ${
        isVisible 
          ? 'opacity-100 scale-100 translate-y-0' 
          : 'opacity-0 scale-95 translate-y-8'
      }`}
      style={{
        background: '#FAFAF8',
        backgroundImage: `
          repeating-linear-gradient(
            0deg,
            transparent,
            transparent 31px,
            rgba(200, 195, 180, 0.06) 31px,
            rgba(200, 195, 180, 0.06) 32px
          )
        `,
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.05)',
        borderRadius: '4px',
        transformOrigin: 'center bottom',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* 信笺抬头 */}
      <div 
        className={`mb-8 transition-all duration-500 delay-100 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <p className="text-xs text-amber-700/50 mb-2 tracking-widest">FROM THE CURATOR</p>
        <h2
          className="text-2xl text-amber-900"
          style={{ fontFamily: '"Source Han Serif CN", serif' }}
        >
          致正在看展的你：
        </h2>
      </div>

      {/* 信笺内容 */}
      <div
        className={`space-y-5 text-[15px] text-amber-900/80 leading-[2.2] text-left transition-all duration-500 delay-200 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
        style={{ fontFamily: '"Source Han Serif CN", "Noto Serif SC", serif' }}
      >
        <p>
          人类对味道的记忆，往往比视觉持久得多。一次偶然的搬家，我翻出了一张皱巴巴的小浣熊水浒卡。那一瞬间，干脆面的葱香、小学门口放学的夕阳、以及那个再也没联系过的同桌，全都扑面而来。
        </p>
        <p>
          后来我发现，很多味道已经绝版了，那些廉价的塑料包装正在被时间降解，货架上的配方悄悄换了一轮又一轮，而我们也再也回不到那个把零花钱掰成两半花的童年。
        </p>
        <p>
          可长大后的我依然在吃零食。没有了妈妈的叨唠，没有了"吃这个上火"的禁令，我终于可以光明正大地囤一整箱辣条。只是有时候撕开包装，会突然想起一些人、一些下午、一些再也回不去的夏天。
        </p>
        <p>
          有天我在想，既然没有人记录这些不值钱的东西，那就我来吧。
        </p>
        <p>
          我像个堂吉诃德一样，到处收集那些高糊的旧包装图，一张张地抠图，把它们洗得干干净净，放进这座透明的档案馆里。因为它们不仅仅是 5 毛钱的零食，它们是你我回不去的 2000 年。
        </p>
        <p>
          这座馆目前收录了 <strong className="text-amber-900">{exhibitCount}</strong> 件展品。如果有哪一件触动了你，请在它旁边留下一句记忆。
        </p>
      </div>

      {/* 落款 */}
      <div 
        className={`mt-10 pt-6 border-t border-amber-900/10 flex items-end justify-end transition-all duration-500 delay-300 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <div className="text-right">
          <p className="text-sm text-amber-900/70" style={{ fontFamily: '"Source Han Serif CN", serif' }}>
            —— 作者
          </p>
          <a
            href="https://x.com/Zoe_iibb"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-2 text-sm text-red-700/70 hover:text-red-600 transition-colors"
            style={{ fontFamily: '"Source Han Serif CN", serif' }}
          >
            𝕏 @Zoe_iibb
          </a>
        </div>
      </div>
    </div>
  );
}
