/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions} */
export default {
  plugins: ["prettier-plugin-tailwindcss"],
  // 缩进使用2个空格
  tabWidth: 2,
  useTabs: false,
  // 行长度限制
  printWidth: 100,
  // 分号
  semi: true,
  // 单引号
  singleQuote: false,
  // 对象属性引号
  quoteProps: "as-needed",
  // JSX中使用双引号
  jsxSingleQuote: false,
  // 尾随逗号
  trailingComma: "es5",
  // 括号间距
  bracketSpacing: true,
  // JSX标签的>放在最后一行
  bracketSameLine: false,
  // 箭头函数参数括号
  arrowParens: "avoid",
  // 行尾换行符
  endOfLine: "lf",
};
