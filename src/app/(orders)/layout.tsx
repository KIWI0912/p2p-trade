export default function OrdersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // 商品名称翻译映射
  const itemTranslations: Record<string, string> = {
    "mountainbike": "山地自行车",
    "mountain bike": "山地自行车",
    "laptop": "笔记本电脑",
    "smartphone": "智能手机",
    "phone": "手机",
    "headphones": "耳机",
    "camera": "相机",
    "watch": "手表",
    "tablet": "平板电脑",
    "monitor": "显示器",
    "keyboard": "键盘",
    "mouse": "鼠标",
    "speaker": "音箱",
    "printer": "打印机",
    "scanner": "扫描仪",
    "gaming console": "游戏机",
    "console": "游戏主机",
    "router": "路由器",
    "power bank": "充电宝",
    "hard drive": "硬盘",
    "ssd": "固态硬盘",
    "memory card": "内存卡",
    "usb flash drive": "U盘",
    "earbuds": "耳塞",
    "earphones": "耳机",
    "tv": "电视",
    "air conditioner": "空调",
    "refrigerator": "冰箱",
    "washing machine": "洗衣机",
    "microwave": "微波炉",
    "vacuum cleaner": "吸尘器",
    "water bottle": "水杯",
    "pen": "钢笔",
    "book": "书籍",
    "notebook": "笔记本",
    "backpack": "背包",
    "umbrella": "雨伞",
    "wallet": "钱包",
    "cap": "帽子",
    "hat": "帽子",
    "scarf": "围巾",
    "gloves": "手套",
    // 添加新的翻译
    "clean code": "代码整洁之道",
    "the pragmatic programmer": "程序员修炼之道",
    "ipad": "iPad平板电脑",
    "tablet computer": "平板电脑"
  };

  /**
   * 翻译商品名称
   * @param name 原始商品名称
   * @returns 翻译后的名称，如果没有对应翻译则返回原名
   */
  function translateItemName(name: string): string {
    if (!name) return '';
    
    // 转小写并移除额外空格，用于匹配
    const normalizedName = name.toLowerCase().trim().replace(/\s+/g, ' ');
    
    // 直接匹配
    if (itemTranslations[normalizedName]) {
      return itemTranslations[normalizedName];
    }
    
    // 部分匹配
    for (const key in itemTranslations) {
      if (normalizedName.includes(key) || key.includes(normalizedName)) {
        return itemTranslations[key];
      }
    }
    
    // 没找到就返回原名
    return name;
  }

  /**
   * 根据指定语言获取本地化的商品名称
   * 这个函数兼容旧代码
   * @param name 原始商品名称
   * @param language 语言代码 'zh' 或 'en'
   * @returns 翻译后的商品名称
   */
  function getLocalizedItemName(name: string, language: 'zh' | 'en'): string {
    if (language === 'zh') {
      return translateItemName(name);
    }
    return name; // 对于英文，返回原名
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {children}
    </div>
  )
}
