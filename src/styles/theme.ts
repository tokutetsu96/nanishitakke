import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  // スタイルの基本値を設定
  styles: {
    global: {
      body: {
        fontFamily: "'M PLUS Rounded 1c', sans-serif",
        backgroundColor: 'gray.50',
      },
    },
  },

  // 「かわいい」テーマ設定
  colors: {
    brand: {
      // 基調とするパステルカラー
      base: 'gray.50',
      primary: 'pink.100',
      secondary: 'blue.50',
      accent: 'orange.100',
    },
    pink: {
      300: '#FBB6CE', // For focus color
    }
  },

  // フォント設定
  fonts: {
    heading: "'M PLUS Rounded 1c', sans-serif",
    body: "'M PLUS Rounded 1c', sans-serif",
  },

  // 角丸の設定
  radii: {
    none: '0',
    sm: '0.125rem', // 2px
    base: '0.25rem', // 4px
    md: '0.375rem', // 6px
    lg: '0.5rem',  // 8px
    xl: '0.75rem',  // 12px
    '2xl': '1.25rem', // 20px  <- 要件定義に基づき大きめに設定
    '3xl': '1.875rem', // 30px
    full: '9999px',
  },

  // コンポーネントごとのデフォルトスタイル
  components: {
    Button: {
      baseStyle: {
        borderRadius: '2xl', // ボタンの角を丸くする
      },
    },
    Box: {
      baseStyle: {
        borderRadius: '2xl',
      },
    },
    Modal: {
      baseStyle: {
        dialog: {
          borderRadius: '2xl',
        }
      }
    },
    Input: {
      defaultProps: {
        focusBorderColor: 'pink.300', // フォーカス時の色
      },
    },
  },
});

export default theme;