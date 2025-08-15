# Biome 配置说明

本项目使用 [Biome](https://biomejs.dev/) 作为代码格式化和 linting 工具，它完全替代了 ESLint 和 Prettier。

## 安装 VS Code 扩展

为了获得最佳的开发体验，请安装 Biome VS Code 扩展：
- 扩展 ID: `biomejs.biome`
- 或者直接在 VS Code 扩展市场中搜索 "Biome"

## 可用的脚本命令

```bash
# 检查代码质量（linting + 类型检查）
npm run check

# 仅进行 linting 检查
npm run lint

# 自动修复可修复的问题
npm run lint:fix

# 格式化代码
npm run format:write

# 检查代码格式
npm run format:check
```

## 编辑器集成

VS Code 已配置为：
- 在保存时自动格式化代码
- 在保存时自动修复可修复的问题
- 在保存时自动整理导入语句
- 使用 Biome 作为所有相关文件类型的默认格式化工具

## 配置文件

- `biome.json` - Biome 主配置文件
- `.biomeignore` - 忽略文件配置
- `.vscode/settings.json` - VS Code 集成配置

## 主要特性

- **代码格式化**: 统一的代码风格，支持 TypeScript、JavaScript、JSON 等
- **Linting**: 代码质量检查，发现潜在问题和代码异味
- **导入整理**: 自动整理和排序导入语句
- **快速修复**: 自动修复大部分常见问题
- **性能优化**: 比 ESLint + Prettier 组合更快

## 与 ESLint + Prettier 的区别

Biome 是一个统一的工具，提供了：
- 更快的执行速度
- 更简单的配置
- 更好的 TypeScript 支持
- 内置的导入整理功能
- 统一的规则集和配置
