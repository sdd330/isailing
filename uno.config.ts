import { defineConfig, presetUno, presetAttributify } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
  ],
  theme: {
    colors: {
      primary: {
        DEFAULT: '#6366f1',
        light: '#818cf8',
        dark: '#4f46e5',
      },
      secondary: '#64748b',
      success: '#16a34a',
      warning: '#ca8a04',
      danger: '#dc2626',
      info: '#06b6d4',
    },
    breakpoints: {
      xs: '375px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
    },
    animation: {
      blink: 'blink 1s infinite',
      'pulse-subtle': 'pulse-subtle 2s ease-in-out infinite',
      'tip-pulse': 'tip-pulse 2s ease-in-out infinite',
      'loading-dot': 'loading-dot 1.4s infinite ease-in-out',
    },
  },
  shortcuts: {
    'btn-option': 'w-full flex items-center justify-start gap-2.5 px-4 py-2.5 min-h-11 rounded-lg border border-primary/50 bg-primary/10 text-primary hover:bg-primary/15 hover:border-primary transition-all duration-200 hover:translate-x-1 active:bg-primary/20 cursor-pointer outline-none',
    'btn-option-mobile': 'w-full flex items-center justify-start gap-2 px-3 py-2 min-h-10 rounded-lg border border-primary/50 bg-primary/10 text-primary hover:bg-primary/15 hover:border-primary transition-all duration-200 hover:translate-x-1 active:bg-primary/20 cursor-pointer outline-none text-xs',
    'option-number': 'flex items-center justify-center rounded-md bg-primary/10 text-primary font-bold flex-shrink-0 min-w-6 w-6 h-6 text-sm',
    'option-number-mobile': 'flex items-center justify-center rounded-md bg-primary/10 text-primary font-bold flex-shrink-0 min-w-5 w-5 h-5 text-xs',
    
    'event-container': 'w-full bg-white/95 rounded-lg border border-black/10 p-1.5 shadow-sm',
    'event-title': 'text-xs font-semibold text-gray-700 mb-1.5',
    'event-list-mobile': 'flex flex-col gap-0.5 max-h-20 overflow-y-auto',
    'event-list-desktop': 'flex flex-wrap gap-1 justify-center max-h-24 overflow-y-auto',
    'event-item': 'flex items-center gap-1 rounded-md text-xs leading-tight border border-transparent transition-all duration-200',
    'event-item-price': 'bg-blue-100/50 border-blue-200/50 text-blue-700',
    'event-item-health': 'bg-red-100/50 border-red-200/50 text-red-700',
    'event-item-reward': 'bg-green-100/50 border-green-200/50 text-green-700',
    'event-item-loss': 'bg-orange-100/50 border-orange-200/50 text-orange-700',
    'event-item-other': 'bg-gray-100/50 border-gray-200/50 text-gray-700',
    'event-icon': 'text-sm flex-shrink-0',
    'event-text': 'flex-1 overflow-hidden text-ellipsis whitespace-nowrap font-medium',
    
    'mobile-header-content': 'w-full max-w-full box-border',
    'mobile-title-row': 'flex items-center justify-between mb-2 pb-2 border-b border-black/5',
    'mobile-time-badge': 'bg-warning/15 border border-warning/30 rounded-xl px-2.5 py-1 text-warning-800 font-semibold whitespace-nowrap',
    'mobile-stats-grid': 'grid grid-cols-3 gap-1.5 w-full max-w-full mb-2',
    
    'stat-card-mobile': 'bg-white/95 backdrop-blur-sm border border-black/10 rounded-lg px-1.5 py-2 flex flex-col items-center justify-center min-h-14 transition-all duration-200 touch-manipulation tap-transparent active:scale-98 active:bg-white/98',
    'stat-card-mobile-cash': 'stat-card-mobile border-success/30',
    'stat-card-mobile-debt': 'stat-card-mobile border-danger/30',
    'stat-card-mobile-health': 'stat-card-mobile border-blue-500/30',
    'stat-card-mobile-bank': 'stat-card-mobile border-blue-500/30',
    'stat-card-mobile-warehouse': 'stat-card-mobile border-purple-500/30',
    'stat-card-mobile-score': 'stat-card-mobile border-yellow-500/30',
    'stat-icon-mobile': 'text-base leading-none mb-0.5 flex-shrink-0',
    'stat-value-mobile': 'text-xs font-bold text-gray-900 leading-tight break-all text-center mb-0.5',
    'stat-label-mobile': 'text-[10px] text-gray-600 mt-0 font-semibold leading-none text-center',
    
    'mobile-actions-grid': 'grid grid-cols-2 gap-2 mb-2 w-full',
        'mobile-action-btn': 'w-full h-11 min-h-11 flex flex-col items-center justify-center gap-1 bg-gradient-to-br from-primary/90 to-primary-light/90 border-none rounded-xl text-white font-semibold shadow-md transition-all duration-200 touch-manipulation tap-transparent px-2 py-1.5 active:scale-98 active:from-primary active:to-primary-light active:shadow-lg disabled:opacity-50 disabled:transform-none',
        'mobile-action-icon': 'text-xl leading-none m-0 block flex-shrink-0',
        'mobile-action-text': 'text-xs leading-tight font-semibold text-white whitespace-nowrap overflow-hidden text-ellipsis max-w-full',
        
        'desktop-action-btn': 'h-10 min-h-10 min-w-35 px-4 py-0 text-sm font-medium whitespace-nowrap rounded-lg shadow-sm transition-all duration-200 hover:shadow-md active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0',
    
        'floating-footer': 'fixed bottom-0 left-0 right-0 z-1000 w-full pb-[env(safe-area-inset-bottom)] pointer-events-none bg-transparent',
        'footer-operations': 'pointer-events-auto bg-white/60 backdrop-blur-xl shadow-[0_-8px_32px_rgba(0,0,0,0.12),0_-4px_16px_rgba(0,0,0,0.08)] border-t border-white/20 rounded-t-2xl',
    
    'chat-content-area': 'flex-1 min-h-0 overflow-y-auto overflow-x-hidden relative pb-45 md:pb-45 touch-pan-y scroll-smooth',
    'game-chat': 'flex flex-col h-screen overflow-hidden relative',
    
    'message-bubble': 'transition-all duration-300 relative',
    'message-card': 'bg-white/98 backdrop-blur-sm shadow-sm border border-black/6',
    'user-message': 'bg-gradient-to-br from-primary/95 to-primary-light/95 shadow-md border border-white/30',
    
    'glass-effect': 'bg-white/95 backdrop-blur-sm',
    'header-gradient': 'bg-white/95 backdrop-blur-sm border-b border-black/10',
    
    'streaming-cursor': 'inline-block animate-blink ml-0.5 text-white/80',
    'streaming-message': 'animate-pulse-subtle',
    
    'loading-dots': 'flex gap-1',
    'loading-dot': 'w-2 h-2 rounded-full bg-white/60 animate-loading-dot',
    
    'tip-box': 'bg-gradient-to-br from-white/95 to-white/90 border-2 border-primary/30 rounded-xl p-4 flex gap-4 mt-4 shadow-md backdrop-blur-sm relative overflow-hidden before:content-[""] before:absolute before:top-0 before:left-0 before:right-0 before:h-0.5 before:bg-gradient-to-r before:from-primary before:via-primary-light before:to-pink-500',
    'tip-icon': 'text-3xl flex-shrink-0 drop-shadow-sm animate-tip-pulse',
    'tip-content': 'flex-1',
    'tip-title': 'font-bold text-gray-800 mb-2 text-base flex items-center gap-1.5',
    'tip-text': 'text-gray-700 text-sm leading-relaxed font-medium',
    
    'card-shadow': 'shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5',
  },
  rules: [
    ['touch-manipulation', { 'touch-action': 'manipulation' }],
    ['tap-transparent', { '-webkit-tap-highlight-color': 'transparent' }],
    ['touch-pan-y', { 'touch-action': 'pan-y' }],
  ],
  safelist: [
    'stat-card-mobile-cash',
    'stat-card-mobile-debt',
    'stat-card-mobile-health',
    'stat-card-mobile-bank',
    'stat-card-mobile-warehouse',
    'stat-card-mobile-score',
    'event-item-price',
    'event-item-health',
    'event-item-reward',
    'event-item-loss',
    'event-item-other',
  ],
})
