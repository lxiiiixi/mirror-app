# Reown 钱包弹窗与 LoginModal 相关 Bug 总结

本文档记录在集成 Reown AppKit 钱包连接与自有 LoginModal 时遇到的两个 iOS 相关问题，以及完整的原因分析与解决方案。

---

## Bug 1：点击钱包登录后页面卡死 + 原生 Modal 报错

### 问题描述

用户点击「钱包登录」按钮后：

- 控制台出现错误：
  ```text
  [UIKitCore] Attempt to present
  <RCTFabricModalHostViewController: 0x...> on
  <RCTFabricModalHostViewController: 0x...> (from
  <RCTFabricModalHostViewController: 0x...>) whose
  view is not in the window hierarchy.
  ```
- 页面卡死，无法继续操作。

### 原因分析

1. **流程**：用户点击「钱包登录」→ 先 `closeModal()` 关闭 LoginModal（React Native `<Modal>`）→ 用 `setTimeout(260ms)` 等待一段时间 → 再调用 `openWallet()` 打开 AppKit 的钱包连接弹窗（内部也是原生 Modal）。

2. **根本原因**：在 iOS 上，`<Modal>` 的关闭是异步的。调用 `closeModal()` 只是把 `visible` 设为 `false`，系统会执行一段 dismiss 动画，**只有在动画完全结束、视图从 window hierarchy 中移除之后**，才适合再 present 新的 Modal。

3. **为何 260ms 不够**：用固定 260ms 去「猜」动画结束时间不可靠。设备性能、系统负载不同，动画实际耗时可能更长。在视图尚未完全从 hierarchy 移除时就 present AppKit 的 Modal，iOS 会认为「在一个不在 window hierarchy 里的控制器上 present」，从而抛出上述错误并导致界面卡死。

### 解决方案

1. **使用 Modal 的 `onDismiss` 回调（iOS）**  
   React Native 的 `<Modal>` 在 **iOS** 上支持 `onDismiss`，它会在 **dismiss 动画完全结束后** 由系统调用。因此：
   - 在 LoginModal 上增加 `onDismiss={handleModalDismiss}`。
   - 在 `handleModalDismiss` 里判断：若当前是「等待打开钱包」状态（`pendingWalletOpen`），则再调用 `openWallet()`。这样保证只有在 LoginModal 的视图已完全离开 hierarchy 之后才 present AppKit 的 Modal，避免冲突。

2. **Android 兜底**  
   `onDismiss` 仅在 iOS 上有效，Android 上仍用 `useEffect` + `setTimeout`（例如 400ms）在 LoginModal 关闭后延迟调用 `openWallet()`。

3. **布局简化**  
   在 `_layout.tsx` 中移除对 `ReownModalPortal` 的多余外层 `View` 包裹，避免不必要的视图层级。

**涉及文件**：`apps/mobile/src/components/modals/LoginModal.tsx`、`apps/mobile/src/app/_layout.tsx`。

---

## Bug 2：关闭 Reown 弹窗后再次打开 LoginModal 时左上角圆角异常

### 问题描述

- **操作步骤**：先打开一次 Reown 的钱包连接弹窗并关闭，再打开项目自己的 LoginModal。
- **现象**：LoginModal 左上角圆角明显变大，视觉上像样式错乱。
- **补充**：若先进入其他页面再返回，再次打开 LoginModal 则恢复正常。

### 原因分析

1. **视图层级与「残留」**  
   - `ReownModalPortal` 里用一层**全屏、绝对定位的 View** 包裹 `<AppKit />`，该 View 一直在视图树中。
   - Reown 文档中说明：这层全屏绝对定位 **仅用于 Expo Router + Android** 的 workaround，**iOS 并不需要**。
   - 在 iOS 上保留这层全屏 View 会带来问题：AppKit 内部 Modal 关闭后，其内部可能仍有部分原生视图未完全销毁或样式未重置（例如带有 `cornerRadius` 的 layer），这些视图留在或影响着这层全屏 View 所在的层级。

2. **为何会「污染」LoginModal**  
   - 当用户再次打开 LoginModal 时，系统 present 的是新的 Modal，但底层可能复用了部分原生视图或受同一 window 上其他视图的 layer 属性影响。
   - 上述残留在全屏 View 层级中的 AppKit 相关视图或样式（如圆角），会叠加或干扰到后续 present 的 LoginModal，表现为**左上角圆角异常**。

3. **为何换页后恢复**  
   - 导航到其他页面再返回时，部分视图被重新创建，不再受之前残留的 layer/视图影响，所以 LoginModal 再次打开时圆角恢复正常。

### 解决方案

1. **iOS 上不再用全屏 View 包裹 `<AppKit />`**  
   - 仅在 **Android** 保留「全屏绝对定位的 View + `<AppKit />`」的结构。
   - 在 **iOS** 上直接渲染 `<AppKit />`，不包在这一层 View 里，从源头减少多余层级和残留视图对后续 Modal 的干扰。

2. **AppKit Modal 关闭后强制重新挂载 `<AppKit />`**  
   - 使用 Reown 的 `useAppKitState()` 获取 `isOpen`（AppKit 弹窗是否打开）。
   - 当 `isOpen` 从 `true` 变为 `false` 时，对渲染 `<AppKit />` 的节点做一次 **强制重新挂载**（例如通过 `key={remountKey}` 并在关闭时 `setRemountKey(k => k + 1)`）。
   - 重新挂载会销毁原有 `<AppKit />` 对应的原生视图树，避免内部残留的 Modal/视图继续影响后续界面。AppKit 的 connection 等状态由 `AppKitProvider` 管理，不受该 UI 组件重挂载影响。

3. **LoginModal 样式**  
   - 此前尝试过用「四角分别设置 borderRadius」等方式增强防御，但问题根源在 Reown 的挂载方式与残留视图，因此最终在修复上述两点后，LoginModal 恢复为简洁的 `borderRadius` 即可。

**涉及文件**：`apps/mobile/src/wallet/reown.tsx`（`ReownModalPortal` / `ReownModalPortalInner` 逻辑）、`apps/mobile/src/components/modals/LoginModal.tsx`（样式恢复为简单 `borderRadius`）。

---

## 小结

| 问题 | 现象 | 根本原因 | 解决思路 |
|------|------|----------|----------|
| Bug 1 | 点钱包登录后报错、卡死 | 在 LoginModal 尚未完全 dismiss 时就 present AppKit Modal，违反 iOS 的 present 规则 | 用 Modal 的 `onDismiss`（iOS）确保完全关闭后再打开钱包弹窗；Android 用延时兜底 |
| Bug 2 | 关 Reown 后再开 LoginModal 左上角圆角变大 | iOS 上多余的全屏包裹 View + AppKit 关闭后残留的原生视图/样式影响后续 Modal | iOS 不包全屏 View；AppKit 关闭后通过 key 强制重挂载 `<AppKit />` 清掉残留 |

以上修改后，钱包登录流程可正常使用，且再次打开 LoginModal 时圆角显示正常。若后续 Reown 或 React Native 升级，可优先检查 Modal 生命周期与 AppKit 的挂载方式是否仍符合当前最佳实践。
