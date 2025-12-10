import React from 'react';

interface AnimateProps {
  children: React.ReactNode;
  type?: 'fade' | 'slide' | 'scale' | 'bounce';
  delay?: number; // 延迟时间（毫秒）
  duration?: number; // 动画持续时间（毫秒）
  className?: string;
}

// 为 AnimateList 创建专门的接口，包含 initialDelay 属性
interface AnimateListProps extends AnimateProps {
  stagger?: number; // 子元素之间的延迟（毫秒）
  initialDelay?: number; // 初始延迟（毫秒）
}

/**
 * 动画组件
 * 为子元素添加进入动画效果
 */
export function Animate({
  children,
  type = 'fade',
  delay = 0,
  duration = 300,
  className = '',
}: AnimateProps) {
  // 根据类型选择动画类名
  const getAnimationClass = () => {
    switch (type) {
      case 'fade':
        return 'animate-fade-in';
      case 'slide':
        return 'animate-slide-in';
      case 'scale':
        return 'animate-scale-in';
      case 'bounce':
        return 'animate-bounce-in';
      default:
        return 'animate-fade-in';
    }
  };

  return (
    <div
      className={`${getAnimationClass()} ${className}`}
      style={{
        animationDelay: `${delay}ms`,
        animationDuration: `${duration}ms`,
      }}
    >
      {children}
    </div>
  );
}

/**
 * 列表动画组件
 * 为列表中的每个子元素添加依次进入的动画效果
 */
export function AnimateList({
  children,
  type = 'fade',
  stagger = 100, // 子元素之间的延迟（毫秒）
  initialDelay = 0, // 初始延迟（毫秒）
  duration = 300,
  className = '',
}: AnimateListProps) {
  // 确保 children 是数组
  const childrenArray = React.Children.toArray(children);

  return (
    <div className={className}>
      {childrenArray.map((child, index) => (
        <Animate
          key={index}
          type={type}
          delay={initialDelay + index * stagger}
          duration={duration}
        >
          {child}
        </Animate>
      ))}
    </div>
  );
}

/**
 * 淡入淡出组件
 * 控制元素的显示和隐藏，带有淡入淡出效果
 */
export function FadeTransition({
  children,
  show,
  duration = 300,
  className = '',
}: {
  children: React.ReactNode;
  show: boolean;
  duration?: number;
  className?: string;
}) {
  const [render, setRender] = React.useState(show);

  React.useEffect(() => {
    if (show) setRender(true);
    else {
      const timer = setTimeout(() => {
        setRender(false);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration]);

  if (!render) return null;

  return (
    <div
      className={`${show ? 'animate-fade-in' : 'animate-fade-out'} ${className}`}
      style={{ animationDuration: `${duration}ms` }}
    >
      {children}
    </div>
  );
}

/**
 * 滑动过渡组件
 * 控制元素的显示和隐藏，带有滑动效果
 */
export function SlideTransition({
  children,
  show,
  direction = 'down',
  duration = 300,
  className = '',
}: {
  children: React.ReactNode;
  show: boolean;
  direction?: 'up' | 'down' | 'left' | 'right';
  duration?: number;
  className?: string;
}) {
  const [render, setRender] = React.useState(show);

  React.useEffect(() => {
    if (show) setRender(true);
    else {
      const timer = setTimeout(() => {
        setRender(false);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration]);

  if (!render) return null;

  // 根据方向设置初始和结束位置
  const getTransformClass = () => {
    if (!show) {
      switch (direction) {
        case 'up':
          return 'translate-y-[-20px]';
        case 'down':
          return 'translate-y-[20px]';
        case 'left':
          return 'translate-x-[-20px]';
        case 'right':
          return 'translate-x-[20px]';
        default:
          return 'translate-y-[20px]';
      }
    }
    return 'translate-y-0 translate-x-0';
  };

  return (
    <div
      className={`transition-all transform ${getTransformClass()} ${
        show ? 'opacity-100' : 'opacity-0'
      } ${className}`}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  );
}

/**
 * 加载动画组件
 * 显示加载中的动画效果
 */
export function LoadingAnimation({
  type = 'pulse',
  size = 'md',
  color = 'morandiGray',
  className = '',
}: {
  type?: 'pulse' | 'ping' | 'spin';
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}) {
  // 根据尺寸设置大小
  const sizeClass = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  // 根据类型设置动画
  const animationClass = {
    pulse: 'animate-pulse-slow',
    ping: 'animate-ping-slow',
    spin: 'animate-spin',
  };

  // 根据颜色设置背景色
  const colorClass = `bg-${color}`;

  if (type === 'spin') {
    return (
      <div className={`${sizeClass[size]} ${className}`}>
        <svg
          className={`${animationClass.spin} text-${color}`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </div>
    );
  }

  return (
    <div className={`${sizeClass[size]} ${className} relative`}>
      <div
        className={`absolute inset-0 ${colorClass} ${animationClass[type]} rounded-full opacity-75`}
      ></div>
      <div className={`${colorClass} rounded-full`}></div>
    </div>
  );
}