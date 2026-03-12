import { useState, useEffect } from 'react';
import { Upload, X, Check, AlertCircle, Image as ImageIcon, RefreshCw, Search } from 'lucide-react';
import { snacks } from '@/data/snacks';

interface ImageManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ImageStatus {
  id: string;
  name: string;
  hasTransparent: boolean;
  originalImage: string;
  transparentPath: string;
}

export function ImageManager({ isOpen, onClose }: ImageManagerProps) {
  const [images, setImages] = useState<ImageStatus[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [, setUploadingId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      checkImageStatus();
    }
  }, [isOpen]);

  const checkImageStatus = async () => {
    setIsLoading(true);
    const statusList: ImageStatus[] = snacks.map(snack => ({
      id: snack.id,
      name: snack.name,
      hasTransparent: false, // 将通过API检查
      originalImage: snack.image,
      transparentPath: `/snacks-transparent/snack-${snack.id}.png`,
    }));

    // 批量检查透明PNG是否存在
    const checkPromises = statusList.map(async (item) => {
      try {
        const response = await fetch(item.transparentPath, { method: 'HEAD' });
        return { ...item, hasTransparent: response.ok };
      } catch {
        return item;
      }
    });

    const results = await Promise.all(checkPromises);
    setImages(results);
    setIsLoading(false);
  };

  const handleFileUpload = async (snackId: string, file: File) => {
    setUploadingId(snackId);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('snackId', snackId);

    try {
      // 模拟上传API（需要后端支持）
      // const response = await fetch('/api/upload-transparent', {
      //   method: 'POST',
      //   body: formData,
      // });

      // 实际项目：保存到public/snacks-transparent/目录
      const reader = new FileReader();
      reader.onload = () => {
        // 在实际项目中，这里会发送到后端保存
        console.log('File ready for upload:', snackId, reader.result);
        
        // 更新状态
        setImages(prev => prev.map(img => 
          img.id === snackId ? { ...img, hasTransparent: true } : img
        ));
      };
      reader.readAsDataURL(file);

    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploadingId(null);
    }
  };

  const handleAIProcessing = async (snackId: string) => {
    // 打开AI抠图工具
    const snack = snacks.find(s => s.id === snackId);
    if (!snack) return;

    // 提供多个AI抠图工具选项
    const tools = [
      { name: 'Remove.bg', url: 'https://www.remove.bg/' },
      { name: 'ClipDrop', url: 'https://clipdrop.co/remove-background' },
      { name: 'Adobe Express', url: 'https://www.adobe.com/express/feature/image/remove-background' },
    ];

    const choice = window.confirm(
      `为 "${snack.name}" 进行AI抠图\n\n` +
      `步骤：\n` +
      `1. 在AI工具中打开原图\n` +
      `2. 自动去除背景\n` +
      `3. 下载透明PNG\n` +
      `4. 返回此页面上传\n\n` +
      `点击"确定"打开Remove.bg\n` +
      `点击"取消"查看其他工具`
    );

    if (choice) {
      window.open(tools[0].url, '_blank');
    } else {
      const toolList = tools.map((t, i) => `${i + 1}. ${t.name}: ${t.url}`).join('\n');
      alert(`可用AI抠图工具：\n\n${toolList}`);
    }
  };

  const filteredImages = images.filter(img => 
    img.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    img.id.includes(searchTerm)
  );

  const stats = {
    total: images.length,
    hasTransparent: images.filter(i => i.hasTransparent).length,
    missing: images.filter(i => !i.hasTransparent).length,
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-ink/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-rice-paper rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-stone-200">
          <div>
            <h2 className="text-xl font-bold text-ink-dark">透明PNG图片管理</h2>
            <p className="text-sm text-ink-light mt-1">
              已处理: {stats.hasTransparent} / {stats.total} 
              <span className="ml-2 text-amber-600">({Math.round(stats.hasTransparent/stats.total*100)}%)</span>
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-stone-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="搜索零食名称或ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
        </div>

        {/* Bulk Actions */}
        <div className="px-4 py-2 border-b border-stone-200 flex gap-2">
          <button
            onClick={() => checkImageStatus()}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            刷新状态
          </button>
          <button
            onClick={() => window.open('https://www.remove.bg/', '_blank')}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg transition-colors"
          >
            <ImageIcon className="w-4 h-4" />
            批量AI抠图 (Remove.bg)
          </button>
        </div>

        {/* Image List */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <RefreshCw className="w-6 h-6 animate-spin text-stone-400" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredImages.map((item) => (
                <div
                  key={item.id}
                  className={`border rounded-xl p-4 transition-all ${
                    item.hasTransparent 
                      ? 'border-green-200 bg-green-50/30' 
                      : 'border-stone-200 bg-white'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Preview */}
                    <div className="w-16 h-16 bg-stone-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.transparentPath}
                        alt={item.name}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = item.originalImage;
                        }}
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-stone-400 font-mono">#{item.id}</span>
                        {item.hasTransparent ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-amber-500" />
                        )}
                      </div>
                      <h3 className="font-medium text-ink-dark truncate">{item.name}</h3>
                      <p className="text-xs text-stone-500">
                        {item.hasTransparent ? '已上传透明PNG' : '需要透明PNG'}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleAIProcessing(item.id)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
                    >
                      <ImageIcon className="w-3 h-3" />
                      AI抠图
                    </button>
                    <label className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg transition-colors cursor-pointer">
                      <Upload className="w-3 h-3" />
                      上传PNG
                      <input
                        type="file"
                        accept="image/png"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(item.id, file);
                        }}
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 rounded-b-2xl">
          <div className="flex items-center justify-between text-sm text-stone-600">
            <div className="flex gap-4">
              <span className="flex items-center gap-1">
                <Check className="w-4 h-4 text-green-500" />
                已处理: {stats.hasTransparent}
              </span>
              <span className="flex items-center gap-1">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                待处理: {stats.missing}
              </span>
            </div>
            <button
              onClick={() => {
                const missing = images.filter(i => !i.hasTransparent);
                alert(`待处理零食列表（${missing.length}个）：\n\n${missing.slice(0, 10).map(i => `${i.id}: ${i.name}`).join('\n')}${missing.length > 10 ? '\n...' : ''}`);
              }}
              className="text-amber-600 hover:text-amber-700"
            >
              查看待处理列表
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
