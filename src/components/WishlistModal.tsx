import { useState } from 'react';
import { X, Send } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface WishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WishlistModal({ isOpen, onClose }: WishlistModalProps) {
  const { t } = useLanguage();
  const [snackName, setSnackName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!snackName.trim()) return;
    
    // Simulate submission
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setSnackName('');
      setDescription('');
      onClose();
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink/20 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-[480px] bg-rice-paper rounded-2xl shadow-2xl animate-scale-in overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-divider">
          <h2 className="font-serif-cn text-[16px] text-ink">
            {t('wishlist.title')}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-card-bg transition-colors"
          >
            <X className="w-4 h-4 text-secondary-text" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isSubmitted ? (
            <div className="py-12 text-center">
              <div className="w-16 h-16 bg-golden/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-6 h-6 text-golden" />
              </div>
              <p className="font-serif-cn text-[15px] text-ink">
                {t('wishlist.success')}
              </p>
              <p className="font-serif-cn text-[12px] text-secondary-text mt-2">
                馆长会尽快寻找这款零食
              </p>
            </div>
          ) : (
            <>
              {/* Snack Name Input */}
              <div className="mb-4">
                <label className="block font-serif-cn text-[12px] text-secondary-text mb-2">
                  零食名称
                </label>
                <input
                  type="text"
                  value={snackName}
                  onChange={(e) => setSnackName(e.target.value)}
                  placeholder={t('wishlist.placeholder')}
                  className="w-full bg-card-bg rounded-xl px-4 py-3 text-[14px] font-serif-cn text-ink placeholder:text-tertiary-text focus:outline-none focus:ring-1 focus:ring-ink/20"
                />
              </div>

              {/* Description Input */}
              <div className="mb-6">
                <label className="block font-serif-cn text-[12px] text-secondary-text mb-2">
                  补充描述
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('wishlist.description')}
                  rows={4}
                  className="w-full bg-card-bg rounded-xl px-4 py-3 text-[14px] font-serif-cn text-ink placeholder:text-tertiary-text focus:outline-none focus:ring-1 focus:ring-ink/20 resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={!snackName.trim()}
                className="w-full h-11 bg-cinnabar text-rice-paper rounded-full font-serif-cn text-[14px] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-cinnabar/90 transition-colors"
              >
                {t('wishlist.submit')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
