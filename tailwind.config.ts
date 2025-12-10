import type { Config } from "tailwindcss";
const config: Config = {
	content: ["./src/**/*.{ts,tsx}"],
	theme: {
		extend: {
			colors: {
				blue: {
					50: '#f3f6f6',
					100: '#e6ebea',
					200: '#cfd9d8',
					300: '#b8c7c6',
					400: '#92a9a6',
					500: '#6b8b88',
					600: '#52736f',
					700: '#415a57',
					800: '#2f4240',
					900: '#1b2a29',
				},
				green: {
					50: '#f4f6f4',
					100: '#e8efe8',
					200: '#d1dfd1',
					300: '#b9cfb9',
					400: '#93b793',
					500: '#6fa06f',
					600: '#577e57',
					700: '#425e42',
					800: '#2f412f',
					900: '#1a2519',
				},
				purple: {
					50: '#f5f3f5',
					100: '#efe7ef',
					200: '#e0d0e0',
					300: '#d1b9d1',
					400: '#b493b4',
					500: '#957495',
					600: '#7a5e7a',
					700: '#5f475f',
					800: '#423242',
					900: '#271827',
				},
				gray: {
					50: '#f7f6f6',
					100: '#efeeed',
					200: '#dfdddc',
					300: '#cfcfcf',
					400: '#b0b0af',
					500: '#949591',
					600: '#7b7c78',
					700: '#63635f',
					800: '#4b4b49',
					900: '#2f2f2e',
				},
				red: {
					50: '#f8efef',
					100: '#f1dfdf',
					200: '#e3bfbf',
					300: '#d59f9f',
					400: '#bf7f7f',
					500: '#a85f5f',
					600: '#7f5252',
					700: '#5e3f3f',
					800: '#3f2b2b',
					900: '#231616',
				},
				// 添加莫兰迪色系
				morandiGray: '#A0A8B1',
				morandiBeige: '#D8C3A5',
				morandiGreen: '#8E9D8A',
				morandiRed: '#E98980',
				morandiBlue: '#A2B5BB',
				morandiCream: '#E8DCD5',
				morandiBg: '#F8F5F2',
			},
			// 添加动画
			animation: {
				'fade-in': 'fadeIn 0.3s ease-in-out',
				'fade-out': 'fadeOut 0.3s ease-in-out',
				'slide-in': 'slideIn 0.3s ease-out',
				'slide-out': 'slideOut 0.3s ease-in',
				'scale-in': 'scaleIn 0.3s ease-out',
				'scale-out': 'scaleOut 0.3s ease-in',
				'bounce-in': 'bounceIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
				'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
				'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
			},
			// 添加关键帧
			keyframes: {
				fadeIn: {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' },
				},
				fadeOut: {
					'0%': { opacity: '1' },
					'100%': { opacity: '0' },
				},
				slideIn: {
					'0%': { transform: 'translateY(20px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' },
				},
				slideOut: {
					'0%': { transform: 'translateY(0)', opacity: '1' },
					'100%': { transform: 'translateY(20px)', opacity: '0' },
				},
				scaleIn: {
					'0%': { transform: 'scale(0.9)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' },
				},
				scaleOut: {
					'0%': { transform: 'scale(1)', opacity: '1' },
					'100%': { transform: 'scale(0.9)', opacity: '0' },
				},
				bounceIn: {
					'0%': { transform: 'scale(0.3)', opacity: '0' },
					'50%': { transform: 'scale(1.05)', opacity: '0.8' },
					'70%': { transform: 'scale(0.9)', opacity: '0.9' },
					'100%': { transform: 'scale(1)', opacity: '1' },
				},
			},
			// 添加过渡效果
			transitionProperty: {
				'height': 'height',
				'spacing': 'margin, padding',
				'width': 'width',
				'max-height': 'max-height',
			},
		},
	},
	plugins: [],
};
export default config;