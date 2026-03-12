import { useRef, useState } from 'react';
import { X, Download, Share2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import html2canvas from 'html2canvas';

interface PosterGeneratorProps {
  snack: {
    id: string;
    name: string;
    nameEn?: string;
    image: string;
    description?: string;
    year?: string;
    brand?: string;
    nostalgic_quote?: string;
  };
  isOpen: boolean;
  onClose: () => void;
}

export function PosterGenerator({ snack, isOpen, onClose }: PosterGeneratorProps) {
  const { language } = useLanguage();
  const posterRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const generateImage = async () => {
    if (!posterRef.current) return null;
    
    setIsLoading(true);
    try {
      const canvas = await html2canvas(posterRef.current, {
        backgroundColor: '#FCFCFC',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
      });
      setIsLoading(false);
      return canvas;
    } catch (error) {
      console.error('Generate image failed:', error);
      setIsLoading(false);
      return null;
    }
  };

  const downloadPoster = async () => {
    const canvas = await generateImage();
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `snack-${snack.id}-${snack.name}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const sharePoster = async () => {
    const canvas = await generateImage();
    if (!canvas) return;

    try {
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/png');
      });

      const file = new File([blob], `snack-${snack.id}.png`, { type: 'image/png' });
      
      if (navigator.share) {
        await navigator.share({
          title: `${snack.name} - 中国零食档案馆`,
          text: `我在中国零食档案馆找到了 ${snack.name}，分享给你！`,
          files: [file],
        });
      } else {
        alert(language === 'zh' ? '分享功能需要在移动设备上使用' : 'Share requires mobile device');
      }
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-[420px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <h3 className="text-base font-medium text-gray-800">
            {language === 'zh' ? '分享海报' : 'Share Poster'}
          </h3>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Poster Canvas - 3:4 竖向比例 */}
          <div className="mb-5 flex justify-center">
            <div 
              ref={posterRef}
              id="poster-canvas"
              className="poster-canvas"
            >
              {/* 顶栏标识 */}
              <div className="poster-brand">
                SNACKIES.APP
              </div>

              {/* 图片区 */}
              <div className="poster-image-box">
                <img 
                  src={snack.image} 
                  alt={snack.name}
                  crossOrigin="anonymous"
                />
              </div>

              {/* 文本核心区 - 仅保留主标题 */}
              <h2 className="poster-snack-name">
                {snack.name}
              </h2>

              {/* 氛围语录 */}
              {snack.nostalgic_quote && (
                <p className="poster-quote">
                  "{snack.nostalgic_quote}"
                </p>
              )}

              {/* 底部编号与印章 */}
              <div className="poster-footer">
                <hr />
                <p className="poster-serial">
                  NO. {String(snack.id).padStart(5, '0')}
                </p>
                
                {/* 印章 - 右下角，默认显示 */}
                <div className="poster-stamp">
                  <span>我也吃过</span>
                </div>
              </div>
            </div>
          </div>

          {/* 操作按钮区 - 海报外部 */}
          <div className="flex gap-3">
            <button
              onClick={downloadPoster}
              disabled={isLoading}
              className="flex-1 h-11 bg-black text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-gray-800 transition-all disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {isLoading 
                ? (language === 'zh' ? '生成中...' : 'Generating...')
                : (language === 'zh' ? '下载海报' : 'Download')
              }
            </button>
            <button
              onClick={sharePoster}
              disabled={isLoading}
              className="flex-1 h-11 bg-white text-black border border-black rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-all disabled:opacity-50"
            >
              <Share2 className="w-4 h-4" />
              {language === 'zh' ? '分享' : 'Share'}
            </button>
          </div>
        </div>
      </div>

      {/* 强制CSS样式 */}
      <style>{`
        /* 海报容器 - 3:4 竖向比例 */
        .poster-canvas {
          width: 300px;
          aspect-ratio: 3/4;
          background-color: #FCFCFC;
          border: 1px solid #F0F0F0;
          padding: 32px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
        }

        /* 顶栏标识 */
        .poster-brand {
          font-size: 10px;
          color: #B3B3B3;
          letter-spacing: 4px;
          text-align: center;
          margin-bottom: 20px;
          font-family: "DM Sans", sans-serif;
        }

        /* 图片区 - 适配3:4比例 */
        .poster-image-box {
          width: 100%;
          height: 160px;
          background-color: #F5F5F7;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
          overflow: hidden;
        }

        .poster-image-box img {
          max-width: 85%;
          max-height: 85%;
          object-fit: contain;
        }

        /* 主标题 - 24px 衬线 */
        .poster-snack-name {
          font-size: 24px;
          font-weight: 600;
          font-family: "Noto Serif SC", "Songti SC", "SimSun", serif;
          color: #333;
          text-align: center;
          margin: 0 0 16px 0;
          line-height: 1.3;
        }

        /* 氛围语录 */
        .poster-quote {
          font-size: 14px;
          font-style: italic;
          font-family: "Noto Serif SC", "Songti SC", serif;
          color: #968571;
          line-height: 1.6;
          text-align: center;
          margin: 0 0 24px 0;
          padding: 0 8px;
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* 底部区域 */
        .poster-footer {
          position: relative;
          margin-top: auto;
          padding-bottom: 8px;
        }

        /* 分割线 */
        .poster-footer hr {
          border: none;
          border-top: 1px solid #E8E8E8;
          margin: 0 0 12px 0;
        }

        /* 编号 */
        .poster-serial {
          font-family: "Space Mono", monospace;
          font-size: 11px;
          color: #B3B3B3;
          letter-spacing: 2px;
          text-align: center;
          margin: 0;
        }

        /* 印章 - 右下角，正片叠底效果 */
        .poster-stamp {
          position: absolute;
          bottom: -8px;
          right: -8px;
          width: 72px;
          height: 72px;
          border: 3px solid #D32F2F;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transform: rotate(-20deg);
          opacity: 0.8;
          mix-blend-mode: multiply;
          background: rgba(255, 255, 255, 0.1);
        }

        .poster-stamp span {
          font-size: 13px;
          font-weight: 700;
          color: #D32F2F;
          font-family: "STKaiti", "KaiTi", "Noto Serif SC", serif;
          text-align: center;
          line-height: 1.2;
        }

        /* 印章内部细线 */
        .poster-stamp::before {
          content: '';
          position: absolute;
          top: 4px;
          left: 4px;
          right: 4px;
          bottom: 4px;
          border: 1px solid #D32F2F;
          border-radius: 50%;
          opacity: 0.6;
        }
      `}</style>
    </div>
  );
}
