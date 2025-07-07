# FuClaude Pool Manager UI (前端界面)

<div align="center">

[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](./LICENSE)
[![Version](https://img.shields.io/badge/Version-0.1.1-blue?style=for-the-badge)](https://github.com/f14XuanLv/fuclaude-pool-manager-ui)

</div>

这是一个前端 Web 应用程序，旨在与 [FuClaude Pool Manager](https://github.com/f14XuanLv/fuclaude-pool-manager) Cloudflare Worker 后端进行交互。

它为最终用户登录 Claude 实例以及管理员管理账户池提供了一个用户友好的界面。

- **后端项目**: [https://github.com/f14XuanLv/fuclaude-pool-manager](https://github.com/f14XuanLv/fuclaude-pool-manager)

本项目使用 React 和 TypeScript 构建，结构适用于 [Vite](https://vitejs.dev/)作为构建工具。

## 一键部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Ff14XuanLv%2Ffuclaude-pool-manager-ui&env=VITE_WORKER_URL&envDescription=Enter%20your%20FuClaude%20Pool%20Manager%20Worker%20URL%20(e.g.,%20https%3A%2F%2Fname.account.workers.dev)&project-name=fuclaude-pool-ui&repository-name=fuclaude-pool-manager-ui)

**重要提示:** 使用 Vercel 部署时，在设置过程中系统会提示您输入 `VITE_WORKER_URL` 环境变量。

请使用以下模板作为 `VITE_WORKER_URL` 的值： `https://<your-worker-name>.<your-account-id>.workers.dev`

## 功能特性

*   **用户界面:**
    *   **随机登录:** 允许用户使用池中随机选择的账户快速获取登录 URL。
    *   **特定账户登录:** 列出可用的电子邮件账户。用户可以选择一个账户并提供唯一的会话标识符进行登录。
    *   **令牌有效期:** 用户在登录时可以指定期望的令牌有效时间（秒）。
    *   如果会话标识符留空，会自动生成随机标识符。
*   **管理员界面 (`/admin` 路径):**
    *   密码保护。
    *   **账户列表:** 查看所有已配置的电子邮件账户及其会话密钥 (SK) 的预览。在添加/更新/删除/批量操作后，列表会自动刷新。
    *   **添加账户:** 将新的 Email-SK 对添加到池中。
    *   **更新账户:** 修改现有的电子邮件地址或更新其 SK。
    *   **删除账户:** 从池中删除账户。
    *   **批量操作:** 使用 JSON 输入执行账户的批量添加或删除。
*   **可配置的 Worker URL:**
    *   应用程序需要您部署的 FuClaude Pool Manager Worker 的 URL。可以通过多种方式进行配置（详见下方的“配置 Worker URL”部分）。
    *   通过页眉中的齿轮图标 (⚙️) 访问配置界面。
*   **响应式设计:** 适应各种屏幕尺寸。
*   **用户反馈:** 为 API 交互提供加载指示器和即时通知 (Toast)。
*   **主题:** 浅色、奶白调主题，带有橙色点缀。

## 先决条件

*   一个现代的网页浏览器。
*   Node.js 和 npm/yarn (用于开发/构建)。
*   一个已部署的 [FuClaude Pool Manager](https://github.com/f14XuanLv/fuclaude-pool-manager) Cloudflare Worker 实例。

## 开始使用 (使用 Vite 开发)

1.  **克隆仓库:**
    ```bash
    git clone <repository-url> # 将 <repository-url> 替换为本项目地址
    cd <repository-directory>
    ```
2.  **安装依赖:**
    ```bash
    npm install
    # 或
    yarn install
    ```
    确保 `vite` 已作为开发依赖安装。
3.  **配置 Worker URL (开发环境):**
    *   本地开发最简单的方式是在项目根目录创建一个 `.env.local` 文件：
        ```env
        VITE_WORKER_URL=http://localhost:8787
        ```
        将 URL 替换为您的实际开发 Worker URL。Vite 会自动加载此文件。
    *   或者，您可以在启动应用程序后通过 UI 进行配置。

4.  **运行开发服务器:**
    ```bash
    npm run dev
    # 或
    yarn dev
    ```
    这将启动 Vite 开发服务器，通常地址为 `http://localhost:5173`。

5.  **TypeScript 与 Vite 类型提示:**
    *   本项目在 `src/vite-env.d.ts` 中使用 `/// <reference types="vite/client" />` 来支持 Vite 特有的类型定义，例如 `import.meta.env`。
    *   如果您遇到相关的 TypeScript 错误（例如 “Cannot find type definition file for 'vite/client'”），请确保：
        1.  `vite` 已正确作为开发依赖安装在您的 `package.json` 中。
        2.  您项目根目录的 `tsconfig.json` 文件配置正确。通常，`compilerOptions.types` 数组可能包含 `"vite/client"`，或者如果 `typeRoots` 是标准配置，它可能会被自动识别。如果您在 `tsconfig.json` 中自定义了 `types` 或 `typeRoots`，请确保它们没有排除 Vite 的类型。

## 构建生产版本 (使用 Vite)

1.  **确保设置了 `VITE_WORKER_URL`**：如果您希望将其嵌入构建产物中，请在您的环境中（例如 CI/CD 流程或部署平台的构建设置中）设置此变量。
2.  **运行构建命令:**
    ```bash
    npm run build
    # 或
    yarn build
    ```
    这将在 `dist` 文件夹中生成优化后的静态资源。

## 部署

将 `dist` 文件夹的内容（在运行 `npm run build` 后生成）部署到任何可以托管单页应用 (SPA) 的静态网站服务，例如 Cloudflare Pages, Vercel, Netlify, 或 Azure Static Web Apps。

**请在您的托管平台上为已部署的应用程序配置 `VITE_WORKER_URL` 环境变量（请参考上文“一键部署”部分或平台特定文档）。**

## 配置 Worker URL (详细说明)

应用程序按以下优先顺序确定 `WORKER_URL`:

1.  **用户配置 (通过 UI):** 如果您通过 UI 中的齿轮图标 (⚙️) 设置了 URL，该值将保存在浏览器的 `localStorage` 中，并在后续使用。
2.  **Vite 环境变量 (推荐的部署与开发方式):**
    *   在您的开发环境（例如，在 `.env.local` 文件中）或部署平台的设置中，设置一个名为 `VITE_WORKER_URL` 的环境变量。
    *   示例: `VITE_WORKER_URL=https://your-actual-worker.workers.dev`。
    *   Vite 会在构建过程中（对于生产构建）将此值嵌入到应用程序中，或在开发模式下通过 `import.meta.env`使其可用。
3.  **部署时配置 (通过 `index.html` - 备选回退方案):**
    *   `index.html` 文件包含一个脚本片段：
        ```html
        <script>
          window.__PRECONFIGURED_WORKER_URL__ = "%%PLACEHOLDER_WORKER_URL%%";
        </script>
        ```
    *   自定义的部署过程（如果不使用 Vite 的环境变量）可以替换 `"%%PLACEHOLDER_WORKER_URL%%"` 为您的实际 Worker URL 字符串。这在 Vite项目中不太常见。
4.  **示例 URL (最终回退方案):** 如果以上方法均未提供 URL，应用程序将使用一个无效的示例 URL：`https://<your-worker-name>.<your-account-id>.workers.dev`。届时您需要通过 UI 进行配置。

## 如何使用

*   **用户视图 (默认):**
    *   通过访问其根 URL 来访问应用程序。
    *   使用“随机登录”按钮或从卡片中选择特定的电子邮件账户。
*   **管理员视图:**
    *   导航到前端 URL 的 `/admin` 路径。
    *   输入您的管理员密码。用于 API 调用的管理员密码现在由各个管理员操作组件直接包含在请求负载中。

## 项目结构 (关键文件)

*   `index.html`: 主 HTML 入口文件。
*   `src/main.tsx`: 主要的 React/TypeScript 应用程序入口点 (渲染 App 组件)。
*   `src/App.tsx`: 根应用程序组件 (布局、路由、上下文提供者)。
*   `src/components/`: 可复用的 UI 组件。
*   `src/views/`: 页面级视图组件。
*   `src/hooks/`: 自定义 React 钩子。
*   `src/contexts/`: 用于全局状态的 React Context。
*   `src/types/`: TypeScript 类型定义。
*   `vite.config.ts` (如果您自定义 Vite): Vite 配置文件。
*   `index.css`: 全局样式。

## 许可证

本项目采用 MIT 许可证。详情请参阅 [LICENSE](LICENSE) 文件。

---
作者：f14xuanlv