# 测试报告

## 测试结果

| 项目     | 结果                                                     |
| :------- | :------------------------------------------------------- |
| 测试框架 | Vitest v4.1.7                                            |
| 测试文件 | `tests/api-routes.test.ts` + `tests/auth-routes.test.ts` |
| 测试用例 | **15 个（全部通过 ✅）**                                 |
| 失败     | ❌ 0                                                     |
| 总用时   | 2.01s                                                    |

### 测试详情

| 文件                        | 用例数 | 覆盖内容                                        |
| :-------------------------- | :----- | :---------------------------------------------- |
| `tests/api-routes.test.ts`  | 1      | 生成 → 轮询状态 → 上传 → 保存素材 → 列表 → 删除 |
| `tests/auth-routes.test.ts` | 14     | 注册(5)、登录(4)、登出(2)、用户信息(3)          |

### Auth 测试明细

**注册：**

- ✅ 应成功注册新用户 → 201 + session
- ✅ 重复邮箱应返回 409
- ✅ 邮箱格式错误应返回 400
- ✅ 密码太短应返回 400
- ✅ 缺少 name 应返回 400

**登录：**

- ✅ 应成功登录 → 200 + session
- ✅ 错误密码应返回 401
- ✅ 不存在的邮箱应返回 401
- ✅ 邮箱格式错误应返回 400

**登出：**

- ✅ 未登录时登出应成功
- ✅ 已登录时登出应销毁 session

**用户信息：**

- ✅ 应返回已存在的用户
- ✅ 不存在时自动创建（hackathon demo 模式）
- ✅ 缺少 userid 应返回 400

## 代码层面的非阻塞问题

以下为 TailwindCSS v4 的弃用类名警告（**不影响运行**，但建议在 TailwindCSS v4 中修复）：

### TailwindCSS v4 类名兼容问题

| 文件                                         | 旧类名                 | 建议新类名                    |
| :------------------------------------------- | :--------------------- | :---------------------------- |
| `src/app/generate/page.tsx`                  | `max-w-[1600px]`       | `max-w-400`                   |
| `src/app/generate/page.tsx`                  | `min-h-[640px]`        | `min-h-160`                   |
| `src/app/showcase/page.tsx`                  | `rounded-[2rem]`       | `rounded-4xl`                 |
| `src/app/showcase/page.tsx`                  | `bg-gradient-to-br`    | `bg-linear-to-br`             |
| `src/app/showcase/page.tsx`                  | `h-[440px]`            | `h-110`                       |
| `src/app/showcase/page.tsx`                  | `h-[280px]`            | `h-70`                        |
| `src/components/workspace/prompt-editor.tsx` | `rounded-[2rem]`       | `rounded-4xl`                 |
| `src/components/workspace/prompt-editor.tsx` | `bg-gradient-to-r`     | `bg-linear-to-r`              |
| `src/components/workspace/preview-card.tsx`  | `min-h-[640px]`        | `min-h-160`                   |
| `src/components/workspace/preview-card.tsx`  | `bg-gradient-to-r`     | `bg-linear-to-r`              |
| `src/components/workspace/preview-card.tsx`  | `bg-gradient-to-br`    | `bg-linear-to-br`             |
| `src/components/workspace/history-bar.tsx`   | `h-32` + `h-full` 冲突 | 移除重复的 `h-32` 或 `h-full` |
| `src/components/workspace/history-bar.tsx`   | `rounded-[2rem]`       | `rounded-4xl`                 |
| `src/components/workspace/history-bar.tsx`   | `bg-gradient-to-br`    | `bg-linear-to-br`             |
| `src/components/workspace/history-bar.tsx`   | `max-w-[80px]`         | `max-w-20`                    |
| `src/components/auth/login-modal.tsx`        | `z-[100]`              | `z-100`                       |

### 未使用变量

| 文件                            | 变量   | 说明               |
| :------------------------------ | :----- | :----------------- |
| `src/app/api/polish/route.ts:7` | `mode` | 解构赋值后从未使用 |

## 总结

- ✅ **所有测试通过**，核心生成链路正常
- ⚠️ **建议补充** auth / polish / vision 等路由的测试用例
- ⚠️ **推荐修复** TailwindCSS v4 兼容性警告（非阻塞，但长期维护建议更新）
