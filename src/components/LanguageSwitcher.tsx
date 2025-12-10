import { useState } from 'react';
import { useLanguage } from '@/lib/i18n';

/**
 * 语言切换组件
 * 允许用户在中文和英文之间切换
 */
export function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  // 切换语言
  const toggleLanguage = (lang: 'zh' | 'en') => {
    setLanguage(lang);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-gray-100 text-gray-700"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-sm">{language === 'zh' ? '中文' : 'English'}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 bg-white rounded-md shadow-lg border border-gray-200 z-10">
          <div className="py-1">
            <button
              className={`block w-full text-left px-4 py-2 text-sm ${
                language === 'zh' ? 'bg-[#F0F4F0] text-[#8E9D8A] font-medium' : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => toggleLanguage('zh')}
            >
              中文
            </button>
            <button
              className={`block w-full text-left px-4 py-2 text-sm ${
                language === 'en' ? 'bg-[#F0F4F0] text-[#8E9D8A] font-medium' : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => toggleLanguage('en')}
            >
              English
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * 简易语言切换按钮
 * 直接在中文和英文之间切换
 */
export function SimpleLanguageToggle() {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'zh' ? 'en' : 'zh');
  };

  return (
    <button
      className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-gray-100 text-gray-700"
      onClick={toggleLanguage}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
        />
      </svg>
      <span className="text-sm">{language === 'zh' ? 'EN' : '中'}</span>
    </button>
  );
}