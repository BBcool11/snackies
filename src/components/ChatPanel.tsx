import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Users } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  timestamp: number;
  isSystem?: boolean;
}

// Generate random user info
const generateUserId = () => 'user_' + Math.random().toString(36).substr(2, 9);
const generateUserName = () => {
  const names = ['零食控', '辣条战士', '糖果达人', '薯片爱好者', '巧克力迷', '果冻宝宝', '饼干骑士', '奶糖公主', '虾条王子', '泡面侠'];
  return names[Math.floor(Math.random() * names.length)] + Math.floor(Math.random() * 1000);
};
const generateAvatar = () => {
  const avatars = ['🍿', '🌶️', '🍬', '🍪', '🍫', '🍭', '🥨', '🍩', '🍦', '🧃', '🥤', '🍟'];
  return avatars[Math.floor(Math.random() * avatars.length)];
};

// Get or create user info
const getUserInfo = () => {
  const stored = localStorage.getItem('snackies_user');
  if (stored) return JSON.parse(stored);
  const newUser = { id: generateUserId(), name: generateUserName(), avatar: generateAvatar() };
  localStorage.setItem('snackies_user', JSON.stringify(newUser));
  return newUser;
};

// Initial welcome messages
const getWelcomeMessages = (): ChatMessage[] => [
  {
    id: '1',
    userId: 'u1',
    userName: 'pixel_eater',
    userAvatar: '🍿',
    content: '有人记得小浣熊的水浒卡吗？',
    timestamp: Date.now() - 3600000,
  },
  {
    id: '2',
    userId: 'u2',
    userName: 'latiao_lover',
    userAvatar: '🌶️',
    content: '记得！我集了整整一套',
    timestamp: Date.now() - 3000000,
  },
  {
    id: '3',
    userId: 'system',
    userName: 'System',
    userAvatar: '',
    content: '欢迎来到展馆茶室，和大家一起分享零食回忆吧！',
    timestamp: Date.now() - 1800000,
    isSystem: true,
  },
  {
    id: '4',
    userId: 'u3',
    userName: 'sugar_rush',
    userAvatar: '🍬',
    content: '大白兔奶糖yyds',
    timestamp: Date.now() - 1200000,
  },
  {
    id: '5',
    userId: 'u4',
    userName: 'retro_snacker',
    userAvatar: '🥨',
    content: '找到好多童年回忆，感谢馆长',
    timestamp: Date.now() - 600000,
  },
];

const STORAGE_KEY = 'snackies_chat_messages';
const ONLINE_KEY = 'snackies_online_users';

export function ChatPanel() {
  const { t, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [onlineCount, setOnlineCount] = useState(1);
  const [userInfo] = useState(() => getUserInfo());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load messages from localStorage
  const loadMessages = useCallback(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      setMessages(parsed);
    } else {
      const welcome = getWelcomeMessages();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(welcome));
      setMessages(welcome);
    }
  }, []);

  // Update online count
  const updateOnlineCount = useCallback(() => {
    const now = Date.now();
    const stored = localStorage.getItem(ONLINE_KEY);
    let onlineUsers: Record<string, number> = stored ? JSON.parse(stored) : {};
    
    // Update current user's last seen
    onlineUsers[userInfo.id] = now;
    
    // Remove users inactive for more than 30 seconds
    Object.keys(onlineUsers).forEach(id => {
      if (now - onlineUsers[id] > 30000) {
        delete onlineUsers[id];
      }
    });
    
    localStorage.setItem(ONLINE_KEY, JSON.stringify(onlineUsers));
    setOnlineCount(Object.keys(onlineUsers).length);
  }, [userInfo.id]);

  // Send message
  const handleSend = useCallback(() => {
    if (!inputValue.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString() + '_' + userInfo.id,
      userId: userInfo.id,
      userName: userInfo.name,
      userAvatar: userInfo.avatar,
      content: inputValue.trim(),
      timestamp: Date.now(),
    };

    const stored = localStorage.getItem(STORAGE_KEY);
    const currentMessages = stored ? JSON.parse(stored) : [];
    const updatedMessages = [...currentMessages, newMessage];
    
    // Keep only last 100 messages
    if (updatedMessages.length > 100) {
      updatedMessages.splice(0, updatedMessages.length - 100);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedMessages));
    setMessages(updatedMessages);
    setInputValue('');
  }, [inputValue, userInfo]);

  // Listen for storage changes (real-time sync across tabs)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        loadMessages();
      }
      if (e.key === ONLINE_KEY) {
        updateOnlineCount();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [loadMessages, updateOnlineCount]);

  // Initial load and polling
  useEffect(() => {
    loadMessages();
    updateOnlineCount();
    
    // Poll for updates every 2 seconds
    intervalRef.current = setInterval(() => {
      loadMessages();
      updateOnlineCount();
    }, 2000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [loadMessages, updateOnlineCount]);

  // Auto scroll to bottom when opening or new messages
  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-12 h-12 bg-ink text-rice-paper rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
        >
          <MessageCircle className="w-5 h-5" />
          {/* Online Count Badge */}
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-golden text-rice-paper rounded-full text-[10px] font-mono-num flex items-center justify-center">
            {onlineCount}
          </span>
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className="chat-panel fixed bottom-6 right-6 z-50 w-[380px] bg-rice-paper border border-divider rounded-2xl flex flex-col shadow-xl animate-slide-up">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-divider">
            <div className="flex items-center gap-2">
              <span className="font-serif-cn text-[13px] text-ink">
                {language === 'zh' ? t('chat.title') : t('chat.title_en')}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-golden">
                <Users className="w-3.5 h-3.5" />
                <span className="font-mono-num text-[10px]">
                  {t('chat.online_count').replace('{count}', onlineCount.toString())}
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-card-bg transition-colors"
              >
                <X className="w-4 h-4 text-secondary-text" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className="animate-fade-in">
                {msg.isSystem ? (
                  <div className="text-center">
                    <span className="font-serif-cn text-[10px] text-tertiary-text">
                      {msg.content}
                    </span>
                  </div>
                ) : (
                  <div className={`flex items-start gap-2 ${msg.userId === userInfo.id ? 'flex-row-reverse' : ''}`}>
                    <span className="text-lg leading-none flex-shrink-0">{msg.userAvatar}</span>
                    <div className={`flex-1 min-w-0 ${msg.userId === userInfo.id ? 'text-right' : ''}`}>
                      <div className={`flex items-baseline gap-1.5 ${msg.userId === userInfo.id ? 'flex-row-reverse' : ''}`}>
                        <span className={`font-serif-cn text-[11px] ${msg.userId === userInfo.id ? 'text-vermilion' : 'text-secondary-text'}`}>
                          {msg.userId === userInfo.id ? '我' : msg.userName}
                        </span>
                        <span className="font-mono-num text-[9px] text-tertiary-text">
                          {formatTime(msg.timestamp)}
                        </span>
                      </div>
                      <p className={`font-serif-cn text-[13px] leading-relaxed mt-0.5 inline-block px-3 py-1.5 rounded-2xl ${
                        msg.userId === userInfo.id 
                          ? 'bg-vermilion/10 text-vermilion' 
                          : 'bg-card-bg text-ink'
                      }`}>
                        {msg.content}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-3 border-t border-divider">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('chat.placeholder')}
                className="flex-1 bg-card-bg rounded-full px-4 py-2 text-[12px] font-serif-cn text-ink placeholder:text-tertiary-text focus:outline-none focus:ring-1 focus:ring-ink/20"
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim()}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-ink text-rice-paper disabled:opacity-40 disabled:cursor-not-allowed hover:bg-ink/90 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Panel Styles */}
      <style>{`
        .chat-panel {
          height: 70vh;
          min-height: 520px;
          max-height: 80vh;
        }
        
        @media (max-width: 640px) {
          .chat-panel {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            width: 100vw;
            height: 100vh;
            min-height: 100vh;
            max-height: 100vh;
            border-radius: 0;
            z-index: 999;
          }
        }
      `}</style>
    </>
  );
}
