import { useState } from 'react';
import { Wand2, ExternalLink, Download, Code, HelpCircle, CheckCircle2 } from 'lucide-react';
import { 
  getAIRemovalTools, 
  getPngResourceSites,
  generateBatchScript,
} from '@/utils/imageManager';
import { snacks } from '@/data/snacks';

interface ImageQuickActionsProps {
  onClose: () => void;
}

export function ImageQuickActions({ onClose }: ImageQuickActionsProps) {
  const [activeTab, setActiveTab] = useState<'ai' | 'download' | 'batch'>('ai');
  const [copied, setCopied] = useState(false);

  const handleCopyScript = () => {
    const snackList = snacks.slice(0, 50).map(s => ({ id: s.id, name: s.name }));
    const script = generateBatchScript(snackList);
    navigator.clipboard.writeText(script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-rice-paper rounded-2xl p-6 max-w-2xl w-full shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-ink-dark">透明PNG图片快速处理工具</h2>
        <button onClick={onClose} className="text-stone-400 hover:text-ink-dark">
          ✕
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('ai')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'ai' ? 'bg-amber-100 text-amber-800' : 'bg-stone-100 text-stone-600'
          }`}
        >
          <Wand2 className="w-4 h-4" />
          AI抠图工具
        </button>
        <button
          onClick={() => setActiveTab('download')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'download' ? 'bg-amber-100 text-amber-800' : 'bg-stone-100 text-stone-600'
          }`}
        >
          <Download className="w-4 h-4" />
          素材下载
        </button>
        <button
          onClick={() => setActiveTab('batch')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'batch' ? 'bg-amber-100 text-amber-800' : 'bg-stone-100 text-stone-600'
          }`}
        >
          <Code className="w-4 h-4" />
          批量脚本
        </button>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {activeTab === 'ai' && (
          <div>
            <p className="text-sm text-stone-600 mb-4">
              推荐使用这些AI工具进行自动抠图。上传零食照片，自动去除背景，下载透明PNG。
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {getAIRemovalTools().map((tool) => (
                <a
                  key={tool.name}
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 border border-stone-200 rounded-xl hover:border-amber-300 hover:bg-amber-50/30 transition-all group"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center text-white">
                    <Wand2 className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-ink-dark">{tool.name}</span>
                      <ExternalLink className="w-3 h-3 text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-xs text-stone-500">{tool.description}</p>
                  </div>
                </a>
              ))}
            </div>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg text-sm text-blue-700">
              <strong>💡 小贴士：</strong>
              建议先用Remove.bg处理10-20个热门零食作为样本，测试首页视觉效果。
            </div>
          </div>
        )}

        {activeTab === 'download' && (
          <div>
            <p className="text-sm text-stone-600 mb-4">
              这些网站提供大量免费的透明PNG素材。搜索零食名称，下载后直接放入项目。
            </p>
            <div className="grid grid-cols-2 gap-3">
              {getPngResourceSites().map((site) => (
                <a
                  key={site.name}
                  href={site.searchUrl || site.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 border border-stone-200 rounded-lg hover:border-amber-300 hover:bg-amber-50/30 transition-all"
                >
                  <Download className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-medium">{site.name}</span>
                </a>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <input
                type="text"
                placeholder="搜索零食名称..."
                className="flex-1 px-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const term = encodeURIComponent((e.target as HTMLInputElement).value + ' transparent png');
                    window.open(`https://www.google.com/search?q=${term}&tbm=isch`, '_blank');
                  }
                }}
              />
              <button
                onClick={() => window.open('https://www.google.com/search?q=snack+transparent+png&tbm=isch', '_blank')}
                className="px-4 py-2 bg-amber-100 text-amber-800 rounded-lg hover:bg-amber-200 transition-colors"
              >
                搜索
              </button>
            </div>
          </div>
        )}

        {activeTab === 'batch' && (
          <div>
            <p className="text-sm text-stone-600 mb-4">
              使用Python + rembg库进行本地批量AI抠图。适合处理大量图片。
            </p>
            <div className="bg-stone-900 rounded-lg p-4 overflow-x-auto">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-stone-400">batch_remove_bg.py</span>
                <button
                  onClick={handleCopyScript}
                  className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1"
                >
                  {copied ? <CheckCircle2 className="w-3 h-3" /> : null}
                  {copied ? '已复制!' : '复制脚本'}
                </button>
              </div>
              <pre className="text-xs text-stone-300 font-mono">
                {`# 安装依赖
pip install rembg Pillow

# 批量处理命令
remgb p -m u2net -o ./output ./input/*

# 或使用Python脚本（点击"复制脚本"获取完整代码）`}
              </pre>
            </div>
            <div className="mt-4 space-y-2">
              <details className="text-sm">
                <summary className="cursor-pointer text-amber-700 hover:text-amber-800">
                  Docker方案（无需安装Python）
                </summary>
                <div className="mt-2 p-3 bg-stone-50 rounded-lg text-stone-600">
                  <code className="text-xs">
                    docker run -v $(pwd):/images danielgatis/rembg i /images/input.jpg /images/output.png
                  </code>
                </div>
              </details>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-stone-200 flex justify-between items-center">
        <a
          href="https://github.com/danielgatis/rembg"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-stone-500 hover:text-stone-700 flex items-center gap-1"
        >
          <HelpCircle className="w-3 h-3" />
          rembg 文档
        </a>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-ink-dark text-rice-paper rounded-lg hover:bg-ink-dark/90 transition-colors text-sm"
        >
          知道了
        </button>
      </div>
    </div>
  );
}
