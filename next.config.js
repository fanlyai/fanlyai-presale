/** @type {import('next').NextConfig} */
const { i18n } = require('./next-i18next.config')



module.exports = {
  i18n: {
    
    locales: ['en', 'zh', 'ja', 'es', 'hi', 'tr'],
    defaultLocale: 'en',
    localeDetection: false,
  },
  trailingSlash: true,
  reactStrictMode:true,
}