# Arts Server API 接口文档

> **版本**: v2.0  
> **基础路径**: `/arts`  
> **更新日期**: 2026-01-26  
> **部署状态**: ✅ 已部署到生产环境 (47.86.163.202)

---

## 📑 目录索引

### 快速导航
- [1. 用户模块 (User)](#1-用户模块-user)
- [2. 作品模块 (Work)](#2-作品模块-work)
- [3. 文件模块 (File)](#4-文件模块-file)
- [4. 节点模块 (Node)](#5-节点模块-node)
- [5. 入金模块 (Deposit)](#6-入金模块-deposit)
- [6. 票券模块 (Ticket)](#7-票券模块-ticket)
- [7. 寄售模块 (Consignment)](#8-寄售模块-consignment)
- [8. 渠道商模块 (Channel)](#9-渠道商模块-channel)
- [9. 健康检查模块 (Health)](#10-健康检查模块-health)
- [10. 管理员模块 (Admin)](#11-管理员模块-admin)

### 接口分类索引

#### 🔐 认证相关
- [Solana 钱包登录](#111-solana-钱包登录)
- [邮箱登录](#112-邮箱登录)
- [发送邮箱验证码](#113-发送邮箱验证码)
- [绑定邮箱](#114-绑定邮箱)
- [绑定钱包](#115-绑定钱包)

#### 📦 作品相关
- [作品列表](#21-作品列表)
- [作品详情](#22-作品详情)
- [上传作品](#23-上传作品)
- [购买章节](#24-购买章节)
- [作品邀请码](#25-作品邀请码相关)

#### 💰 支付相关
- [入金 USDT](#61-入金-usdt)
- [入金 ENT](#62-入金-ent)
- [提币 USDT](#63-提币-usdt)
- [获取余额](#64-获取用户余额)

#### 🎫 票券相关
- [购买票券](#71-购买票券)
- [票券列表](#72-获取可购买票券列表)
- [票券详情](#73-获取票券详情)
- [寄售票券](#81-创建寄售订单)

#### ⛏️ 挖矿相关
- [获取挖矿奖励](#54-获取挖矿奖励)
- [领取挖矿奖励](#55-领取挖矿奖励)
- [挖矿历史](#56-获取挖矿历史)

---

## 🌐 通用说明

### 基础信息
- **API 基础路径**: `/arts`
- **请求格式**: JSON
- **响应格式**: JSON
- **字符编码**: UTF-8

### 认证方式
- **Token 认证**: 在请求头中添加 `Token: <your_token>`
- **部分接口**: 无需 Token（标记为"公开"）
- **可选 Token**: 标记为"可选登录"，有 Token 时返回更多信息

### 响应格式

#### 成功响应
```json
{
  "code": 0,
  "data": { ... },
  "msg": "success"
}
```

#### 错误响应
```json
{
  "code": 10001,
  "data": null,
  "msg": "错误信息"
}
```

### 错误码说明
- `0`: 成功
- `10001`: 参数错误
- `10002`: 未授权
- `10003`: 服务器错误
- 更多错误码请参考 `internal/errno/apierrno.go`

### 多语言支持
- 支持语言: `en` (英文), `zh-Hant` (繁体中文)
- 请求头: `Accept-Language: en` 或 `Accept-Language: zh-Hant`
- 默认: 英文

---

## 1. 用户模块 (User)

**基础路径**: `/arts/user`

### 1.1 Solana 钱包登录

使用 Solana 钱包地址和签名登录，支持新用户自动注册。

**接口地址**
```
POST /arts/user/solanaWalletLogin
```

**请求头**
| Header | 类型 | 必填 | 说明 |
|--------|------|------|------|
| Content-Type | string | 是 | `application/json` |
| Accept-Language | string | 否 | 语言偏好，支持 `zh-CN`、`zh-TW`、`en`，默认英文 |

**请求参数**
```json
{
  "wallet_address": "EbJkepGmnwKDDMbVCjWxzEDDFWrG2w74CGg3jjuYC48p",
  "chain_id": 333,
  "message": "Welcome to Mirror.Fan! Click to sign in and accept the Terms of Service. This request will not trigger a blockchain transaction or cost any gas fees. Wallet address: EbJkepGmnwKDDMbVCjWxzEDDFWrG2w74CGg3jjuYC48p Nonce: 1737175200000",
  "sign": "YJ2RoiXMdgcDe3rhU7XFXWDvMl8l9Q7DQ6Yy1672LmP7IKIyw+YwtjM6KoJYyZ3vhEGmY+vPBXcCIyev/lagBg==",
  "work_invite_code": "000004",
  "invite_uid_code": "ABC123"
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| wallet_address | string | 是 | Solana钱包地址 |
| chain_id | int | 是 | 链ID，Solana固定为 **333** |
| message | string | 是 | 签名的原始消息（包含钱包地址和时间戳） |
| sign | string | 是 | Base64编码的签名数据 |
| work_invite_code | string | 否 | 作品邀请码（6位，如：000004） |
| invite_uid_code | string | 否 | 用户邀请码（用于用户间邀请） |

**响应示例（成功）**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "token": "eyJrIjoic2Vzc2lvbl80NjMyODM3NDU1ODIxNDRfMzg3OTkwZGI1NjYxODNjMWY4NDk0ZTBkYzdkM2JlZmYiLCJ1Ijo0NjMyODM3NDU1ODIxNDQsIm4iOiJFYkprZXBHbW53S0RETWJWQ2pXeHpFRERGV3JHMnc3NENHZzNqanVZQzQ4cCIsImMiOjAsInciOiIiLCJsIjoxNzY4NzEyNTY3LCJ2IjoiMS4wIiwicyI6IjlhNDE5ZDJjZDgwYmJmNWU1MGU4MzkzZTYxYzY2MGI0IiwicmwiOjB9"
  }
}
```

**错误响应示例**
```json
{
  "code": 30011,
  "msg": "Unsupported chain ID"
}
```

```json
{
  "code": 30004,
  "msg": "Signature verification failed"
}
```

**签名消息格式**
```
Welcome to Mirror.Fan! Click to sign in and accept the Terms of Service. 
This request will not trigger a blockchain transaction or cost any gas fees. 
Wallet address: {wallet_address} 
Nonce: {timestamp_in_milliseconds}
```

**业务逻辑**
1. **验证签名**：使用 Solana 的 Ed25519 签名验证
2. **新用户注册**：
   - 自动创建用户账号
   - 建立邀请关系（如果提供了邀请码）
   - 发放作品邀请奖励（如果提供了作品邀请码）
   - 创建用户等级记录
   - 创建用户ENT余额记录
3. **老用户登录**：
   - 更新登录IP和时间
   - 作品邀请码对老用户无效
4. **IP地址记录**：正确获取客户端真实IP（支持Nginx代理）

**注意事项**
- ⚠️ `chain_id` 必须为 **333**（Solana链ID），其他值会返回错误
- ⚠️ 签名必须使用钱包的私钥对 `message` 进行签名
- ⚠️ `message` 中必须包含钱包地址和时间戳，防止重放攻击
- ✅ 作品邀请码只对新用户生效
- ✅ 新用户通过作品邀请码注册，邀请人获得5个作品代币
- ✅ 支持同时使用作品邀请码和用户邀请码

---

### 1.2 邮箱登录

使用邮箱和验证码登录，支持新用户自动注册。

**接口地址**
```
POST /arts/user/emailLogin
```

**请求头**
| Header | 类型 | 必填 | 说明 |
|--------|------|------|------|
| Content-Type | string | 是 | `application/json` |
| Accept-Language | string | 否 | 语言偏好，支持 `zh-CN`、`zh-TW`、`en`，默认英文 |

**请求参数**
```json
{
  "email": "user@example.com",
  "code": "123456",
  "work_invite_code": "000004",
  "invite_uid_code": "ABC123"
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| email | string | 是 | 邮箱地址 |
| code | string | 是 | 6位验证码 |
| work_invite_code | string | 否 | **作品邀请码**（6位，如：000004） |
| invite_uid_code | string | 否 | 用户邀请码（用于用户间邀请） |
| work_id | int | 否 | 作品ID（兼容旧版，优先级低于work_invite_code） |
| invite_uid | int64 | 否 | 邀请人UID（兼容旧版，优先级低于work_invite_code） |

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**说明**
- 新用户自动注册并分配HD钱包
- 支持作品邀请码和用户邀请码同时使用
- 邀请人自动获得奖励（作品邀请：5代币）

---

### 1.3 发送邮箱验证码

向指定邮箱发送6位数字验证码，验证码有效期为 **5分钟**。

**接口地址**
```
POST /arts/user/sendEmailCode
```

**请求头**
| Header | 类型 | 必填 | 说明 |
|--------|------|------|------|
| Content-Type | string | 是 | `application/json` |
| Accept-Language | string | 否 | 语言偏好，支持 `zh-CN`、`zh-TW`、`en`，默认英文 |

**请求参数**
```json
{
  "email": "user@example.com",
  "type": 1
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| email | string | 是 | 邮箱地址 |
| type | int | 否 | 验证码类型：1=登录，2=绑定（默认1） |

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "message": "验证码已发送"
  }
}
```

---

### 1.4 绑定邮箱

已登录的钱包用户绑定邮箱地址。

**接口地址**
```
POST /arts/user/bindEmail
```

**请求头**
```
Content-Type: application/json
token: {用户token}
```

**请求参数**
```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| email | string | 是 | 邮箱地址 |
| code | string | 是 | 邮箱验证码 |

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "message": "邮箱绑定成功"
  }
}
```

---

### 1.5 绑定钱包

已登录的邮箱用户绑定Solana钱包地址。

**接口地址**
```
POST /arts/user/bindWallet
```

**请求头**
```
Content-Type: application/json
token: {用户token}
```

**请求参数**
```json
{
  "wallet_address": "CMB4kMPthZqF28M21kEPhr3qUELYjdT6DMviTRzXP78",
  "signature": "signature_string"
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| wallet_address | string | 是 | Solana钱包地址 |
| signature | string | 是 | 签名字符串 |

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "message": "钱包绑定成功"
  }
}
```

---

### 1.6 获取用户资产

**接口**: `GET /arts/user/asset`

**说明**: 查询用户资产（TOKEN、ENT、USDT等）

**认证**: 需要 Token

**请求参数**: 无

**响应示例**:
```json
{
  "code": 0,
  "data": {
    "token_balance": "0.00",         // 作品代币余额
    "ent_balance": "0.00",           // ENT余额
    "usdt_balance": "0.00",          // USDT余额
    "nft_count": 0                   // NFT数量
  },
  "msg": "success"
}
```

---

### 1.7 获取用户VIP等级

**接口**: `GET /arts/user/vipLevel`

**说明**: 获取用户VIP等级信息

**认证**: 需要 Token

**响应示例**:
```json
{
  "code": 0,
  "data": {
    "vip_level": 1,                 // VIP等级
    "level_name": "string"           // 等级名称
  },
  "msg": "success"
}
```

---

### 1.8 获取用户等级进度

**接口**: `GET /arts/user/levelProgress`

**说明**: 获取用户等级升级进度

**认证**: 需要 Token

**响应示例**:
```json
{
  "code": 0,
  "data": {
    "current_level": 1,             // 当前等级
    "next_level": 2,                 // 下一等级
    "progress": 0.5,                 // 进度 (0-1)
    "points": 1000                   // 当前积分
  },
  "msg": "success"
}
```

---

### 1.9 检查等级升级

手动检查并触发等级升级。

**接口地址**
```
POST /arts/user/checkLevelUpgrade
```

**请求头**
```
Content-Type: application/json
token: {用户token}
```

**请求参数**: 无

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "upgraded": true,
    "new_level": 2,
    "message": "等级升级成功"
  }
}
```

**响应示例（未升级）**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "upgraded": false,
    "current_level": 1,
    "message": "当前等级未达到升级条件"
  }
}
```

---

### 1.10 获取用户佣金历史

获取用户佣金历史记录。

**接口地址**
```
GET /arts/user/commissionHistory
```

**请求头**
```
token: {用户token}
```

**请求参数**
```
page=1&page_size=10
```

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| page | int | 否 | 1 | 页码 |
| page_size | int | 否 | 10 | 每页数量 |

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "amount": "10.00",
        "type": "invite_reward",
        "description": "邀请奖励",
        "create_time": "2026-01-26T10:00:00+08:00"
      }
    ],
    "total": 50,
    "page": 1,
    "page_size": 10
  }
}
```

---

### 1.11 获取用户钱包列表

获取当前用户的所有钱包地址（包括主钱包和绑定的外部钱包）。

**接口地址**
```
GET /arts/user/wallets
```

**请求头**
```
token: {用户token}
```

**说明**
- 钱包登录用户: 返回登录时使用的钱包地址（`is_primary: true`）+ 绑定的其他钱包
- 邮箱登录用户: 返回自动分配的HD钱包地址（`is_primary: true`）+ 绑定的其他钱包

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "wallets": [
      {
        "id": 0,
        "uid": 17685299204314746,
        "chain_id": 1,
        "wallet_address": "4k7t2zbBpsjBeA6t37311exGgoTDXGcek5kWKnEqqvQP",
        "raw_wallet_address": "4k7t2zbBpsjBeA6t37311exGgoTDXGcek5kWKnEqqvQP",
        "is_primary": true
      },
      {
        "id": 123,
        "uid": 17685299204314746,
        "chain_id": 1,
        "wallet_address": "CMB4kMPthZqF28M21kEPhr3qUELYjdT6DMviTRzXP78",
        "raw_wallet_address": "CMB4kMPthZqF28M21kEPhr3qUELYjdT6DMviTRzXP78",
        "is_primary": false
      }
    ],
    "total": 2,
    "bound_email": "user@example.com"
  }
}
```

**字段说明**
| 字段 | 说明 |
|------|------|
| id | 钱包记录ID，主钱包为0 |
| uid | 用户UID |
| chain_id | 链ID（1=Solana） |
| wallet_address | 钱包地址 |
| raw_wallet_address | 原始钱包地址 |
| is_primary | 是否为主钱包（true=主钱包，false=绑定钱包） |
| bound_email | 绑定的邮箱地址（如果有） |
| total | 钱包总数 |

---

### 1.12 获取用户地区信息

**接口**: `GET /arts/user/region`

**说明**: 获取用户地区信息（根据IP自动识别）

**认证**: 无需 Token（公开接口）

**响应示例**:
```json
{
  "code": 0,
  "data": {
    "country": "CN",
    "country_name": "China",
    "region": "string"
  },
  "msg": "success"
}
```

---

### 1.13 检查白名单

检查用户是否在白名单中。

**接口地址**
```
GET /arts/user/check
```

**请求头**
```
token: {用户token}
```

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "in_whitelist": true,
    "whitelist_type": "vip"
  }
}
```

**响应示例（不在白名单）**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "in_whitelist": false
  }
}
```

---

### 1.14 绑定用户

绑定用户信息。

**接口地址**
```
POST /arts/user/bind
```

**请求头**
```
Content-Type: application/json
token: {用户token}
```

**请求参数**
```json
{
  "username": "用户名",
  "avatar": "头像URL"
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| username | string | 否 | 用户名 |
| avatar | string | 否 | 头像URL |

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "message": "绑定成功"
  }
}
```

---

### 1.15 获取节点数量

获取用户持有的节点数量。

**接口地址**
```
GET /arts/user/getNodeCounts
```

**请求头**
```
token: {用户token}
```

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "total_nodes": 5,
    "active_nodes": 3,
    "nodes_by_type": {
      "type1": 2,
      "type2": 3
    }
  }
}
```

---

## 2. 作品模块 (Work)

**基础路径**: `/arts/work`

### 2.1 作品列表

获取作品列表（支持分页、筛选）。

**接口地址**
```
GET /arts/work/list
```

**请求头**
| Header | 类型 | 必填 | 说明 |
|--------|------|------|------|
| token | string | 否 | 用户token（可选，登录用户可获取更多信息） |
| Accept-Language | string | 否 | 语言偏好，支持 `zh-CN`、`zh-TW`、`en`，默认英文 |

**请求参数**
```
page=1&page_size=10&work_type=1&status=active
```

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| page | int | 否 | 1 | 页码 |
| page_size | int | 否 | 10 | 每页数量 |
| work_type | int | 否 | - | 作品类型筛选 |
| status | string | 否 | - | 状态筛选 |

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "work_name": "作品名称",
        "work_type": 1,
        "author": "作者名称",
        "cover": "upload/poster/xxx.png",
        "work_description": "作品描述",
        "create_time": "2026-01-26T10:00:00+08:00"
      }
    ],
    "total": 100,
    "page": 1,
    "page_size": 10
  }
}
```

---

### 2.2 作品详情

获取作品详细信息。**用户完成首次签到后永久显示邀请码信息**（详见 [2.23.10 作品详情（含邀请信息）](#22310-作品详情含邀请信息)）。

**接口地址**
```
GET /arts/work/detail
```

**请求头**
| Header | 类型 | 必填 | 说明 |
|--------|------|------|------|
| token | string | 否 | 用户token（可选，登录用户可获取个人邀请信息） |
| Accept-Language | string | 否 | 语言偏好，支持 `zh-CN`、`zh-TW`、`en`，默认英文 |

**请求参数**
```
work_id=214
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| work_id | int | 是 | 作品ID |

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "work_id": 214,
    "work_type": 1,
    "work_name": "作品名称",
    "work_creator_name": "创作者",
    "work_cover_url": "upload/poster/xxx.png",
    "work_description": "作品描述",
    "signed_in": false,
    "ever_signed_in": true,
    "joined_community": true,
    "invite_count": 5,
    "token_balance": 100,
    "my_invite_code": "000004",
    "my_invite_url": "https://arts.mirror.fan/work/214?invite_code=000004",
    "my_invite_count": 5
  }
}
```

---

### 2.3 上传作品

批量上传作品。

**接口地址**
```
POST /arts/work/upload
```

**请求头**
```
Content-Type: application/json
token: {用户token}
```

**请求参数**
```json
{
  "works": [
    {
      "work_name": "作品名称",
      "work_type": 1,
      "work_introduction": "作品介绍"
    }
  ],
  "company_name": "公司名称",
  "region": "地区",
  "email": "contact@example.com",
  "telephone": "13800138000"
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| works | array | 是 | 作品列表 |
| works[].work_name | string | 是 | 作品名称 |
| works[].work_type | int | 是 | 作品类型 |
| works[].work_introduction | string | 否 | 作品介绍 |
| company_name | string | 否 | 公司名称 |
| region | string | 否 | 地区 |
| email | string | 否 | 联系邮箱 |
| telephone | string | 否 | 联系电话 |

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "message": "作品上传成功"
  }
}
```

---

### 2.4 标准化上传作品

标准化作品上传流程。

**接口地址**
```
POST /arts/work/standardUpload
```

**请求头**
```
Content-Type: application/json
token: {用户token}
```

**请求参数**
```json
{
  "work_name": "作品名称",
  "work_type": 1,
  "work_introduction": "作品介绍"
}
```

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "work_id": 214,
    "message": "作品上传成功"
  }
}
```

---

### 2.5 更新作品

更新作品信息。

**接口地址**
```
POST /arts/work/update
```

**请求头**
```
Content-Type: application/json
token: {用户token}
```

**请求参数**
```json
{
  "work_id": 214,
  "work_name": "更新后的作品名称",
  "work_introduction": "更新后的作品介绍"
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| work_id | int | 是 | 作品ID |
| work_name | string | 否 | 作品名称 |
| work_introduction | string | 否 | 作品介绍 |

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "message": "作品更新成功"
  }
}
```

---

### 2.6 删除作品

删除指定作品。

**接口地址**
```
GET /arts/work/delete
```

**请求头**
```
token: {用户token}
```

**请求参数**
```
work_id=214
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| work_id | int | 是 | 作品ID |

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "message": "作品删除成功"
  }
}
```

---

### 2.7 购买章节

使用指定货币购买作品章节。

**接口地址**
```
POST /arts/work/purchase
```

**请求头**
```
Content-Type: application/json
token: {用户token}
```

**请求参数**
```json
{
  "work_id": 123,
  "chapterCount": 5,
  "currency": "USDT"
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| work_id | int32 | 是 | 作品ID |
| chapterCount | int32 | 是 | 购买章节数量 |
| currency | string | 否 | 支付货币类型，可选值：`TOKEN`、`ENT`、`USDT`，默认 `TOKEN` |

**价格说明**
| 支付方式 | 单价 | 说明 |
|----------|------|------|
| TOKEN | 1 TOKEN/章节 | 使用作品代币支付 |
| ENT | 5 ENT/章节 | 使用ENT代币支付 |
| USDT | 0.05 USDT/章节 | 使用USDT支付 |

**成功响应**
```json
{
  "code": 0,
  "msg": "success",
  "data": {}
}
```

**错误响应**

1. **USDT 余额不足（需要充值）**
```json
{
  "code": 20050,
  "msg": "USDT餘額不足，請先充值"
}
```
> **前端处理**: 收到此错误码时，应自动弹出/跳转到充值页面

2. **ENT 余额不足**
```json
{
  "code": 20051,
  "msg": "ENT餘額不足"
}
```

3. **作品代币余额不足**
```json
{
  "code": 506,
  "msg": "餘額不足"
}
```

4. **无效的支付货币**
```json
{
  "code": 20052,
  "msg": "無效的支付貨幣，僅支持 TOKEN、ENT、USDT"
}
```

5. **作品代币不存在**
```json
{
  "code": 20053,
  "msg": "作品代幣不存在"
}
```

---

### 2.8 获取支付余额信息

获取用户在指定作品下的各种支付余额信息。

**接口地址**
```
GET /arts/work/payment/balances
```

**请求头**
```
token: {用户token}
```

**请求参数**
```
work_id=123
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| work_id | int32 | 是 | 作品ID |

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "token_balance": 100.5,
    "ent_balance": 500,
    "usdt_balance": "25.50",
    "usdt_available": "20.00",
    "chapter_price_token": 1,
    "chapter_price_ent": 5,
    "chapter_price_usdt": "0.05"
  }
}
```

**响应字段说明**
| 字段 | 类型 | 说明 |
|------|------|------|
| token_balance | float64 | 作品代币余额 |
| ent_balance | uint64 | ENT 余额 |
| usdt_balance | string | USDT 总余额 |
| usdt_available | string | USDT 可用余额（总余额 - 冻结余额） |
| chapter_price_token | int | 每章节 TOKEN 价格 |
| chapter_price_ent | int | 每章节 ENT 价格 |
| chapter_price_usdt | string | 每章节 USDT 价格 |

---

### 2.9 获取作品章节

获取作品章节内容。

**接口地址**
```
GET /arts/work/chapter
```

**请求头**
| Header | 类型 | 必填 | 说明 |
|--------|------|------|------|
| token | string | 否 | 用户token（可选，登录用户可获取更多信息） |

**请求参数**
```
work_id=214&chapter_id=1
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| work_id | int | 是 | 作品ID |
| chapter_id | int | 否 | 章节ID |

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "chapter_id": 1,
    "chapter_title": "第一章",
    "chapter_content": "章节内容...",
    "unlocked": true
  }
}
```

---

### 2.10 作品操作

对作品进行操作（点赞、收藏、分享等）。

**接口地址**
```
POST /arts/work/action
```

**请求头**
```
Content-Type: application/json
token: {用户token}
```

**请求参数**
```json
{
  "work_id": 214,
  "action_type": "like"
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| work_id | int | 是 | 作品ID |
| action_type | string | 是 | 操作类型：`like`（点赞）、`favorite`（收藏）、`share`（分享） |

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "message": "操作成功"
  }
}
```

---

### 2.11 热门作品列表

获取热门作品列表。

**接口地址**
```
GET /arts/work/hotList
```

**请求头**
| Header | 类型 | 必填 | 说明 |
|--------|------|------|------|
| token | string | 否 | 用户token（可选） |

**请求参数**
```
page=1&page_size=10
```

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| page | int | 否 | 1 | 页码 |
| page_size | int | 否 | 10 | 每页数量 |

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "list": [...],
    "total": 100,
    "page": 1,
    "page_size": 10
  }
}
```

---

### 2.12 已完成作品列表

获取已完结的作品列表。

**接口地址**
```
GET /arts/work/finishedList
```

**请求头**
```
token: {用户token}
```

**请求参数**
```
page=1&page_size=10
```

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "list": [...],
    "total": 50
  }
}
```

---

### 2.13 作品签到

作品签到（每日任务）。

**接口地址**
```
POST /arts/work/signIn
```

**请求头**
```
Content-Type: application/json
token: {用户token}
```

**请求参数**
```json
{
  "work_id": 214
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| work_id | int | 是 | 作品ID |

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "message": "签到成功",
    "reward": 10
  }
}
```

---

### 2.14 作品统计

获取作品统计信息。

**接口地址**
```
GET /arts/work/total
```

**请求头**
```
token: {用户token}
```

**请求参数**
```
work_id=214
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| work_id | int | 是 | 作品ID |

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "view_count": 1000,
    "like_count": 100,
    "favorite_count": 50
  }
}
```

---

### 2.15 分享作品

分享作品（生成分享链接）。

**接口地址**
```
GET /arts/work/share
```

**请求头**
```
token: {用户token}
```

**请求参数**
```
work_id=214
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| work_id | int | 是 | 作品ID |

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "share_url": "https://arts.mirror.fan/work/214?share_code=ABC123"
  }
}
```

---

### 2.16 获取代币信息

获取作品的代币信息。

**接口地址**
```
GET /arts/work/getTokenInfo
```

**请求头**
| Header | 类型 | 必填 | 说明 |
|--------|------|------|------|
| token | string | 否 | 用户token（可选） |

**请求参数**
```
work_id=214
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| work_id | int | 是 | 作品ID |

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "token_name": "TOKEN",
    "token_symbol": "TKN",
    "total_supply": 1000000
  }
}
```

---

### 2.17 获取活动奖励

获取作品活动奖励。

**接口地址**
```
GET /arts/work/getActivityRewards
```

**请求头**
```
token: {用户token}
```

**请求参数**
```
work_id=214
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| work_id | int | 是 | 作品ID |

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "rewards": [...]
  }
}
```

---

### 2.18 观看视频

观看视频（任务）。

**接口地址**
```
POST /arts/work/watchVideo
```

**请求头**
```
Content-Type: application/json
token: {用户token}
```

**请求参数**
```json
{
  "work_id": 214
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| work_id | int | 是 | 作品ID |

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "message": "观看成功",
    "reward": 5
  }
}
```

---

### 2.19 IDO 相关

#### 2.19.1 开启IDO

开启作品的IDO（Initial DEX Offering）。

**接口地址**
```
POST /arts/work/startIdo
```

**请求头**
```
Content-Type: application/json
token: {用户token}
```

**请求参数**
```json
{
  "work_id": 214,
  "token_price": "0.1",
  "total_supply": 1000000
}
```

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "ido_id": 1,
    "message": "IDO开启成功"
  }
}
```

---

#### 2.19.2 查询IDO信息

查询作品的IDO信息。

**接口地址**
```
POST /arts/work/queryIdoInfo
```

**请求头**
```
Content-Type: application/json
token: {用户token}
```

**请求参数**
```json
{
  "work_id": 214
}
```

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "ido_id": 1,
    "work_id": 214,
    "token_price": "0.1",
    "total_supply": 1000000,
    "sold_amount": 500000,
    "status": "active"
  }
}
```

---

#### 2.19.3 创建作品代币

为作品创建代币。

**接口地址**
```
POST /arts/work/createdToken
```

**请求头**
```
Content-Type: application/json
token: {用户token}
```

**请求参数**
```json
{
  "work_id": 214,
  "token_name": "TOKEN",
  "token_symbol": "TKN",
  "total_supply": 1000000
}
```

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "token_id": 1,
    "token_address": "TokenAddress...",
    "message": "代币创建成功"
  }
}
```

---

#### 2.19.4 IDO代币列表

获取IDO代币列表。

**接口地址**
```
GET /arts/work/tokenIdoList
```

**请求头**
| Header | 类型 | 必填 | 说明 |
|--------|------|------|------|
| token | string | 否 | 用户token（可选） |

**请求参数**
```
page=1&page_size=10
```

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "list": [
      {
        "ido_id": 1,
        "work_id": 214,
        "token_name": "TOKEN",
        "token_price": "0.1",
        "total_supply": 1000000,
        "sold_amount": 500000,
        "status": "active"
      }
    ],
    "total": 10,
    "page": 1,
    "page_size": 10
  }
}
```

---

#### 2.19.5 购买IDO代币

购买IDO代币。

**接口地址**
```
POST /arts/work/buyToken
```

**请求头**
```
Content-Type: application/json
token: {用户token}
```

**请求参数**
```json
{
  "ido_id": 1,
  "amount": 1000
}
```

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "order_id": "ORDER123",
    "token_amount": 1000,
    "payment_amount": "100.00",
    "message": "购买成功"
  }
}
```

---

### 2.20 空投相关

#### 2.20.1 获取空投信息

获取作品的空投信息。

**接口地址**
```
POST /arts/work/airdropInfo
```

**请求头**
```
Content-Type: application/json
token: {用户token}
```

**请求参数**
```json
{
  "work_id": 214
}
```

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "airdrop_id": 1,
    "work_id": 214,
    "total_amount": 10000,
    "claimed_amount": 5000,
    "available_amount": 5000,
    "status": "active"
  }
}
```

---

#### 2.20.2 解锁空投

解锁并领取空投。

**接口地址**
```
POST /arts/work/unlockAirDrop
```

**请求头**
```
Content-Type: application/json
token: {用户token}
```

**请求参数**
```json
{
  "airdrop_id": 1
}
```

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "amount": 100,
    "message": "空投解锁成功"
  }
}
```

---

### 2.21 外部链接

#### 2.21.1 上传外部链接

上传作品的外部链接。

**接口地址**
```
POST /arts/work/uploadExternalLink
```

**请求头**
```
Content-Type: application/json
token: {用户token}
```

**请求参数**
```json
{
  "work_id": 214,
  "link_url": "https://example.com",
  "link_type": "official"
}
```

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "link_id": 1,
    "message": "链接上传成功"
  }
}
```

---

#### 2.21.2 获取外部链接

获取作品的外部链接。

**接口地址**
```
GET /arts/work/externalLink
```

**请求头**
| Header | 类型 | 必填 | 说明 |
|--------|------|------|------|
| token | string | 否 | 用户token（可选） |

**请求参数**
```
work_id=214
```

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "links": [
      {
        "link_id": 1,
        "link_url": "https://example.com",
        "link_type": "official",
        "create_time": "2026-01-26T10:00:00+08:00"
      }
    ]
  }
}
```

---

### 2.22 推广统计

#### 2.22.1 推广点击统计

推广链接点击统计（无需登录）。

**接口地址**
```
GET /arts/work/track
```

**请求参数**
```
promo_code=ABC123
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| promo_code | string | 否 | 推广码 |

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "message": "统计成功"
  }
}
```

---

#### 2.22.2 获取推广统计

获取推广统计数据（无需登录）。

**接口地址**
```
GET /arts/work/promoStats
```

**请求参数**
```
promo_code=ABC123
```

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "promo_code": "ABC123",
    "total_clicks": 1000,
    "total_registrations": 100,
    "conversion_rate": 0.1
  }
}
```

---

### 2.23 作品邀请码相关

#### 邀请码格式

**格式规则**
```
6位Base36字符（000001-ZZZZZZ）
字符集：0-9, A-Z (36个字符)
容量：36^6 = 2,176,782,336 (21亿+)
```

**示例**
```
000001  (ID=1)
000004  (ID=4)
0000Z0  (ID=1260)
00ABCD  (ID=1,867,149)
100000  (ID=60,466,176)
ZZZZZZ  (ID=2,176,782,335，最大值)
```

**业务逻辑**
- 一个用户对每个作品生成一个独立的邀请码
- 新用户使用邀请码注册时，邀请人获得 **5个作品代币**
- 邀请码计数自动 +1
- 创建任务记录用于统计

---

#### 2.23.1 生成邀请码

为指定作品生成邀请码。

**接口地址**
```
POST /arts/work/generateInviteCode
```

**请求头**
```
Content-Type: application/json
token: {用户token}
```

**请求参数**
```json
{
  "work_id": 214
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| work_id | int | 是 | 作品ID |

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "uid": 17685299204314746,
    "work_id": 214,
    "invite_code": "000004",
    "invite_url": "https://arts.mirror.fan/work/214?invite_code=000004",
    "invite_count": 0,
    "status": 1,
    "create_time": "2026-01-16 10:35:19",
    "work_info": {
      "work_id": 214,
      "title": "作品标题",
      "cover": "upload/poster/xxx.png"
    }
  }
}
```

**说明**
- 同一用户对同一作品只能生成一个邀请码
- 如果已存在，直接返回现有邀请码

---

#### 2.23.2 解析邀请码

解析邀请码，获取邀请人和作品信息。

**接口地址**
```
GET /arts/work/parseInviteCode
```

**请求参数**
```
code=000004
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| code | string | 是 | 邀请码 |

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "invite_code": "000004",
    "work_id": 214,
    "invite_uid": 17685299204314746,
    "invite_count": 1,
    "create_time": "2026-01-16T10:35:19+08:00",
    "inviter_info": {
      "uid": 17685299204314746,
      "username": "temp_test123@test.com",
      "wallet_address": "4k7t2zbBpsjBeA6t37311exGgoTDXGcek5kWKnEqqvQP"
    },
    "work_info": {
      "work_id": 214,
      "title": "作品标题",
      "cover": "upload/poster/xxx.png"
    }
  }
}
```

**错误响应**
```json
{
  "code": 503,
  "msg": "邀请码不存在或已失效"
}
```

---

#### 2.23.3 验证邀请码

快速验证邀请码是否有效。

**接口地址**
```
GET /arts/work/validateInviteCode
```

**请求参数**
```
code=000004
```

**响应示例（有效）**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "valid": true,
    "invite_code": "000004"
  }
}
```

**响应示例（无效）**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "valid": false,
    "message": "邀请码不存在或已失效"
  }
}
```

---

#### 2.23.4 获取我的邀请码列表

查询当前用户生成的所有邀请码。

**接口地址**
```
GET /arts/work/myInviteCodes
```

**请求头**
```
token: {用户token}
```

**请求参数**
```
page=1&page_size=10
```

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| page | int | 否 | 1 | 页码 |
| page_size | int | 否 | 10 | 每页数量 |

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "list": [
      {
        "id": 4,
        "invite_code": "000004",
        "work_id": 214,
        "work_title": "作品标题",
        "work_cover": "upload/poster/xxx.png",
        "invite_count": 1,
        "status": 1,
        "create_time": "2026-01-16T10:35:19+08:00"
      }
    ],
    "total": 1,
    "page": 1,
    "size": 10
  }
}
```

---

#### 2.23.5 获取邀请统计

查询当前用户的邀请统计数据。

**接口地址**
```
GET /arts/work/inviteStats
```

**请求头**
```
token: {用户token}
```

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "total_codes": 3,
    "total_invites": 5
  }
}
```

| 字段 | 说明 |
|------|------|
| total_codes | 总共生成的邀请码数量 |
| total_invites | 总共邀请的人数 |

---

#### 2.23.6 获取作品邀请排行榜

查询指定作品的邀请排行榜。

**接口地址**
```
GET /arts/work/topInviters
```

**请求参数**
```
work_id=214&limit=10
```

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| work_id | int | 是 | - | 作品ID |
| limit | int | 否 | 10 | 返回数量 |

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "work_id": 214,
    "top_inviters": [
      {
        "rank": 1,
        "uid": 17685299204314746,
        "username": "temp_test123@test.com",
        "invite_code": "000004",
        "invite_count": 10
      }
    ]
  }
}
```

---

#### 2.23.7 获取作品的邀请码列表

查询指定作品的所有邀请码。

**接口地址**
```
GET /arts/work/workInviteCodes
```

**请求参数**
```
work_id=214&page=1&page_size=10
```

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| work_id | int | 是 | - | 作品ID |
| page | int | 否 | 1 | 页码 |
| page_size | int | 否 | 10 | 每页数量 |

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "work_id": 214,
    "list": [
      {
        "invite_code": "000004",
        "uid": 17685299204314746,
        "username": "temp_test123@test.com",
        "invite_count": 1,
        "create_time": "2026-01-16T10:35:19+08:00"
      }
    ],
    "total": 1,
    "page": 1,
    "size": 10
  }
}
```

---

#### 2.23.8 禁用邀请码

禁用指定的邀请码。

**接口地址**
```
POST /arts/work/disableInviteCode
```

**请求头**
```
Content-Type: application/json
token: {用户token}
```

**请求参数**
```json
{
  "invite_code": "000004"
}
```

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "message": "邀请码已禁用"
  }
}
```

---

#### 2.23.9 启用邀请码

启用已禁用的邀请码。

**接口地址**
```
POST /arts/work/enableInviteCode
```

**请求头**
```
Content-Type: application/json
token: {用户token}
```

**请求参数**
```json
{
  "invite_code": "000004"
}
```

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "message": "邀请码已启用"
  }
}
```

---

#### 2.23.10 作品详情（含邀请信息）

获取作品详情，**用户完成首次签到后永久显示邀请码信息**。

**接口地址**
```
GET /arts/work/detail
```

**请求头**
```
token: {用户token}  // 可选，登录用户可获取个人邀请信息
```

**请求参数**
```
work_id=214
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| work_id | int | 是 | 作品ID |

**响应示例（已完成首次签到的用户）**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "work_type": 1,
    "work_name": "作品名称",
    "work_creator_name": "创作者",
    "work_cover_url": "upload/poster/xxx.png",
    "work_description": "作品描述",
    
    "signed_in": false,
    "ever_signed_in": true,
    "joined_community": true,
    "invite_count": 5,
    "token_balance": 100,
    
    "my_invite_code": "000004",
    "my_invite_url": "https://arts.mirror.fan/work/214?invite_code=000004",
    "my_invite_count": 5
  }
}
```

**邀请相关字段说明**

| 字段 | 类型 | 说明 |
|------|------|------|
| signed_in | bool | 今日是否已签到 |
| ever_signed_in | bool | **是否曾完成过首次签到**（用于判断是否显示邀请信息） |
| joined_community | bool | 是否加入过社区 |
| invite_count | int | 用户邀请总人数（来自任务记录） |
| my_invite_code | string | 用户的邀请码（**仅首次签到后返回**） |
| my_invite_url | string | 用户的完整邀请链接（**仅首次签到后返回**） |
| my_invite_count | int | 用户已邀请人数（**仅首次签到后返回**） |

**业务逻辑**
1. **首次签到前**：`ever_signed_in = false`，不返回 `my_invite_code`、`my_invite_url`、`my_invite_count`
2. **首次签到后**：`ever_signed_in = true`，永久返回邀请码信息
3. **邀请码自动生成**：首次签到后访问详情页时自动生成（如果不存在则创建）
4. **被邀请限制**：用户完成首次签到后，不能再被其他人邀请到该作品

---

### 2.24 其他接口

#### 2.24.1 获取已完成列表

获取已完成的作品列表。

**接口地址**
```
GET /arts/work/finishList
```

**请求头**
```
token: {用户token}
```

**请求参数**
```
page=1&page_size=10
```

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "list": [...],
    "total": 50
  }
}
```

---

#### 2.24.2 获取默认Token

获取默认的Token信息。

**接口地址**
```
GET /arts/work/defaultToken
```

**请求头**
```
token: {用户token}
```

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "token_name": "TOKEN",
    "token_symbol": "TKN",
    "token_address": "TokenAddress..."
  }
}
```

---

#### 2.24.3 获取链接列表

获取作品关联的链接列表。

**接口地址**
```
GET /arts/work/linkList
```

**请求头**
```
token: {用户token}
```

**请求参数**
```
work_id=214
```

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "links": [...]
  }
}
```

---

#### 2.24.4 参与社区任务

参与作品社区任务。

**接口地址**
```
POST /arts/work/community
```

**请求头**
```
Content-Type: application/json
token: {用户token}
```

**请求参数**
```json
{
  "work_id": 214,
  "task_type": "join"
}
```

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "message": "任务完成",
    "reward": 10
  }
}
```

---

#### 2.24.5 获取好友列表

获取用户邀请的好友列表。

**接口地址**
```
GET /arts/work/friendsList
```

**请求头**
```
token: {用户token}
```

**请求参数**
```
work_id=214&page=1&page_size=10
```

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "list": [
      {
        "uid": 123456,
        "username": "friend@example.com",
        "invite_time": "2026-01-26T10:00:00+08:00"
      }
    ],
    "total": 10,
    "page": 1,
    "page_size": 10
  }
}
```

---

## 3. 文件模块 (File)

**基础路径**: `/arts/file`

### 3.1 文件上传

**接口**: `POST /arts/file/upload`

**说明**: 通用文件上传

**认证**: 需要 Token

**请求格式**: `multipart/form-data`

**请求参数**:
- `file` (file, 必需): 上传的文件

**响应示例**:
```json
{
  "code": 0,
  "data": {
    "url": "/static/upload/xxx.jpg",
    "filename": "xxx.jpg"
  },
  "msg": "success"
}
```

---

### 3.2 票券封面图上传

上传票券封面图。

**接口地址**
```
POST /arts/file/ticket/cover
```

**请求格式**: `multipart/form-data`

**请求参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| file | file | 是 | 图片文件 |

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "url": "/static/ticket/cover/xxx.jpg",
    "filename": "xxx.jpg"
  }
}
```

---

## 4. 静态文件模块 (Static)

**基础路径**: `/arts/static`

### 4.1 票券封面图访问

**接口**: `GET /arts/static/ticket/cover/:filename`

**说明**: 访问票券封面图

**认证**: 无需 Token（公开接口）

---

### 4.2 上传文件访问

**接口**: `GET /arts/static/upload/*filepath`

**说明**: 访问上传的文件

**认证**: 无需 Token（公开接口）

---

## 5. 节点模块 (Node)

**基础路径**: `/arts/node`

### 5.1 获取节点信息

查询节点（商品）的通用信息。

**接口地址**
```
GET /arts/node/nodeInfo
```

**请求参数**
```
id=1
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | int | 否 | 节点ID |

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "node_id": 1,
    "node_name": "节点名称",
    "node_type": "type1",
    "price": "100.00",
    "description": "节点描述"
  }
}
```

---

### 5.2 获取当前批次信息

查询指定ID商品的当前售卖批次信息。

**接口地址**
```
GET /arts/node/:id/current_tier_info
```

**路径参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | int | 是 | 节点ID |

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "node_id": 1,
    "current_tier": 1,
    "tier_price": "100.00",
    "remaining_quantity": 100,
    "total_quantity": 1000
  }
}
```

---

### 5.3 获取交易信息

根据签名查询交易信息。

**接口地址**
```
GET /arts/node/tx/:signature
```

**路径参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| signature | string | 是 | 交易签名 |

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "signature": "5KtPn1LGuxhFiwjxErkxTb3XwEHk...",
    "status": "confirmed",
    "amount": "100.00",
    "create_time": "2026-01-26T10:00:00+08:00"
  }
}
```

---

### 5.4 获取购买报价

获取购买报价单。

**接口地址**
```
POST /arts/node/quote
```

**请求头**
```
Content-Type: application/json
token: {用户token}
```

**请求参数**
```json
{
  "node_id": 1,
  "quantity": 1
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| node_id | int | 是 | 节点ID |
| quantity | int | 是 | 购买数量 |

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "node_id": 1,
    "quantity": 1,
    "unit_price": "100.00",
    "total_price": "100.00",
    "currency": "USDT"
  }
}
```

---

### 5.5 执行购买

执行节点购买。

**接口地址**
```
POST /arts/node/send
```

**请求头**
```
Content-Type: application/json
token: {用户token}
```

**请求参数**
```json
{
  "node_id": 1,
  "quantity": 1,
  "payment_method": "usdt"
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| node_id | int | 是 | 节点ID |
| quantity | int | 是 | 购买数量 |
| payment_method | string | 是 | 支付方式（usdt/ent） |

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "order_id": "ORDER123",
    "tx_signature": "5KtPn1LGuxhFiwjxErkxTb3XwEHk...",
    "status": "pending"
  }
}
```

---

### 5.6 获取交易列表

查询当前用户的交易列表。

**接口地址**
```
GET /arts/node/tx
```

**请求头**
```
token: {用户token}
```

**请求参数**
```
page=1&page_size=10
```

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| page | int | 否 | 1 | 页码 |
| page_size | int | 否 | 10 | 每页数量 |

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "list": [
      {
        "tx_id": "TX123",
        "node_id": 1,
        "amount": "100.00",
        "status": "confirmed",
        "create_time": "2026-01-26T10:00:00+08:00"
      }
    ],
    "total": 50,
    "page": 1,
    "page_size": 10
  }
}
```

---

### 5.7 查询支付结果

查询支付结果。

**接口地址**
```
GET /arts/node/getPayResult
```

**请求头**
```
token: {用户token}
```

**请求参数**
```
tx_id=TX123
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| tx_id | string | 是 | 交易ID |

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "tx_id": "TX123",
    "status": "confirmed",
    "amount": "100.00",
    "confirm_time": "2026-01-26T10:00:00+08:00"
  }
}
```

---

### 5.8 获取购买记录

获取购买记录。

**接口地址**
```
GET /arts/node/getPurchaseRecords
```

**请求头**
```
token: {用户token}
```

**请求参数**
```
page=1&page_size=10
```

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "list": [
      {
        "record_id": 1,
        "node_id": 1,
        "quantity": 1,
        "amount": "100.00",
        "create_time": "2026-01-26T10:00:00+08:00"
      }
    ],
    "total": 20
  }
}
```

---

### 5.9 查询邀请信息

查询邀请信息。

**接口地址**
```
GET /arts/node/inviteInfo
```

**请求头**
```
token: {用户token}
```

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "total_invites": 10,
    "total_rewards": "1000.00",
    "invite_code": "ABC123"
  }
}
```

---

### 5.10 获取邀请记录

获取邀请记录。

**接口地址**
```
GET /arts/node/getInviteRecords
```

**请求头**
```
token: {用户token}
```

**请求参数**
```
page=1&page_size=10
```

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "list": [
      {
        "invite_id": 1,
        "invited_uid": 123456,
        "reward": "100.00",
        "create_time": "2026-01-26T10:00:00+08:00"
      }
    ],
    "total": 10
  }
}
```

---

### 5.11 挖矿相关

#### 5.11.1 获取挖矿奖励

获取可领取的挖矿奖励。

**接口地址**
```
GET /arts/node/mining/rewards
```

**请求头**
```
token: {用户token}
```

**请求参数**
```
batch_id=1
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| batch_id | int | 否 | 批次ID |

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "rewards": [
      {
        "batch_id": 1,
        "cycle_id": 1,
        "reward_amount": "100.00",
        "status": "claimable",
        "claim_time": "2026-01-26T10:00:00+08:00"
      }
    ],
    "total_reward": "500.00"
  }
}
```

---

#### 5.11.2 领取挖矿奖励

领取挖矿奖励。

**接口地址**
```
POST /arts/node/mining/claim
```

**请求头**
```
Content-Type: application/json
token: {用户token}
```

**请求参数**
```json
{
  "batch_id": 1,
  "cycle_id": 1
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| batch_id | int | 是 | 批次ID |
| cycle_id | int | 否 | 周期ID（可选） |

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "reward_amount": "100.00",
    "tx_signature": "5KtPn1LGuxhFiwjxErkxTb3XwEHk...",
    "message": "奖励领取成功"
  }
}
```

---

#### 5.11.3 获取领取历史

获取挖矿奖励领取历史。

**接口地址**
```
GET /arts/node/mining/claimHistory
```

**请求头**
```
token: {用户token}
```

**请求参数**
```
page=1&page_size=10
```

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| page | int | 否 | 1 | 页码 |
| page_size | int | 否 | 10 | 每页数量 |

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "list": [
      {
        "claim_id": 1,
        "batch_id": 1,
        "cycle_id": 1,
        "reward_amount": "100.00",
        "claim_time": "2026-01-26T10:00:00+08:00"
      }
    ],
    "total": 50,
    "page": 1,
    "page_size": 10
  }
}
```

---

#### 5.11.4 获取挖矿历史

获取挖矿历史记录。

**接口地址**
```
GET /arts/node/mining/history
```

**请求头**
```
token: {用户token}
```

**请求参数**
```
page=1&page_size=10
```

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "list": [
      {
        "mining_id": 1,
        "batch_id": 1,
        "node_id": 1,
        "mining_amount": "10.00",
        "mining_time": "2026-01-26T10:00:00+08:00"
      }
    ],
    "total": 100
  }
}
```

---

#### 5.11.5 获取挖矿批次

获取挖矿批次列表。

**接口地址**
```
GET /arts/node/mining/batches
```

**请求头**
```
token: {用户token}
```

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "batches": [
      {
        "batch_id": 1,
        "batch_name": "批次1",
        "start_time": "2026-01-01T00:00:00+08:00",
        "end_time": "2026-12-31T23:59:59+08:00",
        "status": "active"
      }
    ]
  }
}
```

---

#### 5.11.6 获取调度器状态

获取挖矿调度器状态。

**接口地址**
```
GET /arts/node/mining/scheduler
```

**请求头**
```
token: {用户token}
```

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "scheduler_status": "running",
    "last_run_time": "2026-01-26T10:00:00+08:00",
    "next_run_time": "2026-01-26T11:00:00+08:00"
  }
}
```

---

#### 5.11.7 获取挖矿周期

获取挖矿周期列表。

**接口地址**
```
GET /arts/node/mining/cycles
```

**请求头**
```
token: {用户token}
```

**请求参数**
```
batch_id=1
```

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "cycles": [
      {
        "cycle_id": 1,
        "batch_id": 1,
        "cycle_number": 1,
        "start_time": "2026-01-01T00:00:00+08:00",
        "end_time": "2026-01-31T23:59:59+08:00"
      }
    ]
  }
}
```

---

#### 5.11.8 获取批次周期

获取指定批次的周期列表。

**接口地址**
```
GET /arts/node/mining/batch/:id/cycles
```

**请求头**
```
token: {用户token}
```

**路径参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | int | 是 | 批次ID |

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "batch_id": 1,
    "cycles": [
      {
        "cycle_id": 1,
        "cycle_number": 1,
        "start_time": "2026-01-01T00:00:00+08:00",
        "end_time": "2026-01-31T23:59:59+08:00",
        "total_reward": "1000.00"
      }
    ]
  }
}
```

---

## 6. 入金模块 (Deposit)

**基础路径**: `/arts/deposit`

### 6.1 获取充值地址

获取系统充值地址，用于 USDT 和 ENT 充值。

**接口地址**
```
GET /arts/deposit/address
```

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "address": "EbJkepGmnwKDDMbVCjWxzEDDFWrG2w74CGg3jjuYC48p"
  }
}
```

---

### 6.2 入金 USDT

用户充值 USDT 到平台账户。

**接口地址**
```
POST /arts/deposit/usdt
```
或
```
POST /arts/deposit/deposit
```

**请求头**
```
Content-Type: application/json
token: {用户token}
```

**请求参数**
```json
{
  "signed_tx": "base64编码的已签名Solana交易"
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| signed_tx | string | 是 | Base64编码的已签名Solana交易数据 |

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "tx_signature": "5KtPn1LGuxhFiwjxErkxTb3XwEHk...",
    "amount": 100.0,
    "status": "pending",
    "message": "入金交易已提交，金额已冻结，等待链上确认"
  }
}
```

**业务逻辑**
1. 解析并验证 Solana 交易
2. 验证收款地址和代币类型（USDT）
3. 最小充值金额：1 USDT
4. 创建交易记录并冻结金额
5. 推送到链上确认队列
6. 链上确认成功后，余额到账

---

### 6.3 入金 ENT

用户充值 ENT 代币到平台账户。

**接口地址**
```
POST /arts/deposit/ent
```

**请求头**
```
Content-Type: application/json
token: {用户token}
```

**请求参数**
```json
{
  "signed_tx": "base64编码的已签名Solana交易"
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| signed_tx | string | 是 | Base64编码的已签名Solana交易数据 |

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "tx_signature": "5KtPn1LGuxhFiwjxErkxTb3XwEHk...",
    "amount": 1000.0,
    "status": "pending",
    "message": "ENT入金交易已提交，金额已冻结，等待链上确认"
  }
}
```

**业务逻辑**
1. 解析并验证 Solana 交易
2. 验证收款地址和代币类型（ENT）
3. 最小充值金额：1 ENT
4. 创建交易记录并冻结金额
5. 推送到链上确认队列
6. 链上确认成功后，ENT余额到账

---

### 6.4 提币 USDT

提币USDT到指定地址。

**接口地址**
```
POST /arts/deposit/withdraw
```

**请求头**
```
Content-Type: application/json
token: {用户token}
```

**请求参数**
```json
{
  "amount": "100.00",
  "to_address": "string",
  "chain": "solana"
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| amount | string | 是 | 提币金额 |
| to_address | string | 是 | 提币地址 |
| chain | string | 是 | 链类型（solana） |

---

### 6.5 获取用户余额

获取当前用户的 USDT 余额信息。

**接口地址**
```
GET /arts/deposit/balance
```

**请求头**
```
token: {用户token}
```

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "uid": 17685299204314746,
    "balance": "100.000000",
    "frozen_balance": "10.000000",
    "total_income": "200.000000",
    "total_expense": "90.000000",
    "status": 1
  }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| uid | uint64 | 用户ID |
| balance | string | 可用余额 |
| frozen_balance | string | 冻结余额（充值待确认等） |
| total_income | string | 累计充值金额 |
| total_expense | string | 累计支出金额 |
| status | uint8 | 钱包状态：1=正常 |

---

### 6.6 获取充值历史

获取当前用户的充值历史记录。

**接口地址**
```
GET /arts/deposit/history
```

**请求头**
```
token: {用户token}
```

**请求参数**
```
page=1&limit=10
```

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| page | int | 否 | 1 | 页码 |
| limit | int | 否 | 10 | 每页数量（最大100） |

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "list": [
      {
        "deposit_id": "DEP20260118123456",
        "signature": "5KtPn1LGuxhFiwjxErkxTb3XwEHk...",
        "amount": "100.000000",
        "asset_type": "USDT",
        "status": "已确认",
        "from_address": "EbJkepGmnwKDDMbVCjWxzEDDFWrG2w74CGg3jjuYC48p",
        "to_address": "SystemDepositAddress...",
        "create_time": "2026-01-18T10:30:00+08:00",
        "credit_time": "2026-01-18T10:31:00+08:00"
      },
      {
        "deposit_id": "DEP20260118123457",
        "signature": "7MnPk2LHvyhGjwksFslxUc4YxFI...",
        "amount": "500.000000",
        "asset_type": "ENT",
        "status": "待确认",
        "from_address": "EbJkepGmnwKDDMbVCjWxzEDDFWrG2w74CGg3jjuYC48p",
        "to_address": "SystemDepositAddress...",
        "create_time": "2026-01-18T11:00:00+08:00"
      }
    ],
    "total": 2
  }
}
```

**状态说明**
| 状态 | 说明 |
|------|------|
| 待确认 | 交易已提交，等待链上确认 |
| 已确认 | 链上确认成功，余额已到账 |
| 失败 | 交易失败 |

---

### 6.7 获取入金统计

获取入金统计信息。

**接口地址**
```
GET /arts/deposit/stats
```

**请求头**
```
token: {用户token}
```

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "total_deposits": 50,
    "total_amount": "5000.00",
    "usdt_deposits": 30,
    "usdt_amount": "3000.00",
    "ent_deposits": 20,
    "ent_amount": "2000.00"
  }
}
```

---

### 6.8 获取提币历史

获取提币历史记录。

**接口地址**
```
GET /arts/deposit/withdraw/history
```

**请求头**
```
token: {用户token}
```

**请求参数**
```
page=1&page_size=10
```

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| page | int | 否 | 1 | 页码 |
| page_size | int | 否 | 10 | 每页数量 |

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "list": [
      {
        "withdraw_id": "WD123",
        "amount": "100.00",
        "to_address": "Address...",
        "status": "completed",
        "create_time": "2026-01-26T10:00:00+08:00",
        "complete_time": "2026-01-26T10:05:00+08:00"
      }
    ],
    "total": 20,
    "page": 1,
    "page_size": 10
  }
}
```

---

### 6.9 获取提币统计

获取提币统计信息。

**接口地址**
```
GET /arts/deposit/withdraw/stats
```

**请求头**
```
token: {用户token}
```

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "total_withdraws": 10,
    "total_amount": "1000.00",
    "pending_amount": "100.00",
    "completed_amount": "900.00"
  }
}
```

---

### 6.10 查询提币详情

根据交易哈希查询提币详情。

**接口地址**
```
GET /arts/deposit/withdraw/tx/:tx_hash
```

**路径参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| tx_hash | string | 是 | 交易哈希 |

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "tx_hash": "5KtPn1LGuxhFiwjxErkxTb3XwEHk...",
    "amount": "100.00",
    "to_address": "Address...",
    "status": "completed",
    "create_time": "2026-01-26T10:00:00+08:00",
    "complete_time": "2026-01-26T10:05:00+08:00"
  }
}
```

---

## 7. 票券模块 (Ticket)

**基础路径**: `/arts/ticket`

### 7.1 购买票券

**接口**: `POST /arts/ticket/purchase`

**说明**: 购买票券（抢购，每分钟最多60次请求）

**认证**: 需要 Token

**请求参数**:
```json
{
  "ticket_id": 1,                     // 票券ID
  "quantity": 1                       // 购买数量
}
```

**响应示例**:
```json
{
  "code": 0,
  "data": {
    "task_id": "string",              // 任务ID（用于查询结果）
    "status": "pending"                // pending/success/failed
  },
  "msg": "success"
}
```

---

### 7.2 获取可购买票券列表

获取可购买票券列表。

**接口地址**
```
GET /arts/ticket/available
```

**请求头**
| Header | 类型 | 必填 | 说明 |
|--------|------|------|------|
| token | string | 否 | 用户token（可选） |

**请求参数**
```
page=1&page_size=10&status=active
```

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| page | int | 否 | 1 | 页码 |
| page_size | int | 否 | 10 | 每页数量 |
| status | string | 否 | - | 状态筛选 |

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "list": [
      {
        "ticket_id": 1,
        "ticket_name": "票券名称",
        "price": "100.00",
        "remaining_quantity": 100,
        "total_quantity": 1000,
        "status": "active"
      }
    ],
    "total": 50,
    "page": 1,
    "page_size": 10
  }
}
```

---

### 7.3 获取票券详情

获取票券详情。

**接口地址**
```
GET /arts/ticket/:ticket_id
```

**请求头**
| Header | 类型 | 必填 | 说明 |
|--------|------|------|------|
| token | string | 否 | 用户token（可选） |

**路径参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| ticket_id | int | 是 | 票券ID |

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "ticket_id": 1,
    "ticket_name": "票券名称",
    "description": "票券描述",
    "price": "100.00",
    "remaining_quantity": 100,
    "total_quantity": 1000,
    "status": "active",
    "cover_url": "/static/ticket/cover/xxx.jpg"
  }
}
```

### 7.4 获取抢购结果

**接口**: `GET /arts/ticket/purchase/result/:task_id`

**说明**: 获取抢购结果

**认证**: 需要 Token

**路径参数**:
- `task_id` (string, 必需): 任务ID

**响应示例**:
```json
{
  "code": 0,
  "data": {
    "status": "success",              // pending/success/failed
    "ticket_instances": [ ... ],      // 票券实例列表
    "message": "string"               // 结果消息
  },
  "msg": "success"
}
```

---

### 7.5 获取我的购买历史

获取我的购买历史。

**接口地址**
```
GET /arts/ticket/my/purchases
```

**请求头**
```
token: {用户token}
```

**请求参数**
```
page=1&page_size=10
```

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| page | int | 否 | 1 | 页码 |
| page_size | int | 否 | 10 | 每页数量 |

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "list": [
      {
        "purchase_id": 1,
        "ticket_id": 1,
        "ticket_name": "票券名称",
        "quantity": 1,
        "total_amount": "100.00",
        "purchase_time": "2026-01-26T10:00:00+08:00"
      }
    ],
    "total": 20,
    "page": 1,
    "page_size": 10
  }
}
```

---

### 7.6 获取我的票券记录

获取我的票券记录。

**接口地址**
```
GET /arts/ticket/my/ticket_record
```

**请求头**
```
token: {用户token}
```

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "total_tickets": 10,
    "total_value": "1000.00",
    "records": [...]
  }
}
```

---

### 7.7 获取我的持仓

获取我持有的票券。

**接口地址**
```
GET /arts/ticket/my/holdings
```

**请求头**
```
token: {用户token}
```

**请求参数**
```
ticket_id=1&page=1&page_size=10
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| ticket_id | int | 否 | 票券ID筛选 |
| page | int | 否 | 页码 |
| page_size | int | 否 | 每页数量 |

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "list": [
      {
        "ticket_id": 1,
        "ticket_name": "票券名称",
        "quantity": 5,
        "total_value": "500.00"
      }
    ],
    "total": 10,
    "page": 1,
    "page_size": 10
  }
}
```

---

### 7.8 获取我的票券实例

获取我持有的特定票券实例。

**接口地址**
```
GET /arts/ticket/my/instances/:ticket_item_id
```

**请求头**
```
token: {用户token}
```

**路径参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| ticket_item_id | int | 是 | 票券项目ID |

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "instances": [
      {
        "instance_id": 1,
        "ticket_id": 1,
        "status": "active",
        "create_time": "2026-01-26T10:00:00+08:00"
      }
    ]
  }
}
```

---

### 7.9 获取票券实例详情

获取票券实例详情。

**接口地址**
```
GET /arts/ticket/instance/:instance_id
```

**路径参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| instance_id | int | 是 | 实例ID |

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "instance_id": 1,
    "ticket_id": 1,
    "ticket_name": "票券名称",
    "owner_uid": 123456,
    "status": "active",
    "create_time": "2026-01-26T10:00:00+08:00"
  }
}
```

---

### 7.10 K线和统计

#### 7.10.1 获取K线数据

获取票券K线数据。

**接口地址**
```
GET /arts/ticket/kline
```

**请求参数**
```
ticket_id=1&interval=1h&start_time=2026-01-01&end_time=2026-01-31
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| ticket_id | int | 是 | 票券ID |
| interval | string | 否 | 时间间隔 (1m/5m/15m/1h/1d) |
| start_time | string | 否 | 开始时间 |
| end_time | string | 否 | 结束时间 |

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "ticket_id": 1,
    "interval": "1h",
    "kline_data": [
      {
        "time": "2026-01-26T10:00:00+08:00",
        "open": "100.00",
        "high": "110.00",
        "low": "95.00",
        "close": "105.00",
        "volume": 1000
      }
    ]
  }
}
```

---

#### 7.10.2 获取票券统计

获取票券统计信息。

**接口地址**
```
GET /arts/ticket/stats/:ticket_id
```

**路径参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| ticket_id | int | 是 | 票券ID |

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "ticket_id": 1,
    "current_price": "100.00",
    "24h_volume": 1000,
    "24h_change": "5.00",
    "total_volume": 10000,
    "market_cap": "1000000.00"
  }
}
```

---

#### 7.10.3 获取价格变化统计

获取价格变化统计。

**接口地址**
```
GET /arts/ticket/price-change/:ticket_id
```

**路径参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| ticket_id | int | 是 | 票券ID |

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "ticket_id": 1,
    "price_changes": {
      "1h": "2.00",
      "24h": "5.00",
      "7d": "10.00",
      "30d": "20.00"
    }
  }
}
```

---

#### 7.10.4 获取市场概览

获取市场概览。

**接口地址**
```
GET /arts/ticket/market/overview
```

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "total_tickets": 100,
    "total_volume": "1000000.00",
    "active_tickets": 50,
    "market_cap": "5000000.00"
  }
}
```

---

### 7.11 预售相关

#### 7.11.1 预售预约报名

预售预约报名。

**接口地址**
```
POST /arts/ticket/presale/register
```

**请求头**
```
Content-Type: application/json
token: {用户token}
```

**请求参数**
```json
{
  "ticket_id": 1,
  "quantity": 1
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| ticket_id | int | 是 | 票券ID |
| quantity | int | 是 | 预约数量 |

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "registration_id": 1,
    "message": "预约成功"
  }
}
```

---

## 8. 寄售模块 (Consignment)

**基础路径**: `/arts/consignment`

### 8.1 创建寄售订单

创建寄售订单。

**接口地址**
```
POST /arts/consignment/create
```

**请求头**
```
Content-Type: application/json
token: {用户token}
```

**请求参数**
```json
{
  "ticket_instance_id": 1,
  "price": "100.00",
  "currency": "usdt"
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| ticket_instance_id | int | 是 | 票券实例ID |
| price | string | 是 | 寄售价格 |
| currency | string | 是 | 币种（usdt/ent） |

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "consignment_id": 1,
    "message": "寄售订单创建成功"
  }
}
```

---

### 8.2 批量创建寄售订单

批量创建寄售订单。

**接口地址**
```
POST /arts/consignment/batch/create
```

**请求头**
```
Content-Type: application/json
token: {用户token}
```

**请求参数**
```json
{
  "orders": [
    {
      "ticket_instance_id": 1,
      "price": "100.00",
      "currency": "usdt"
    }
  ]
}
```

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "created_count": 1,
    "failed_count": 0,
    "consignment_ids": [1]
  }
}
```

---

### 8.3 取消寄售

取消寄售订单。

**接口地址**
```
POST /arts/consignment/cancel
```

**请求头**
```
Content-Type: application/json
token: {用户token}
```

**请求参数**
```json
{
  "consignment_id": 1
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| consignment_id | int | 是 | 寄售订单ID |

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "message": "寄售订单已取消"
  }
}
```

---

### 8.4 获取寄售市场列表

获取寄售市场列表。

**接口地址**
```
GET /arts/consignment/market
```

**请求头**
| Header | 类型 | 必填 | 说明 |
|--------|------|------|------|
| token | string | 否 | 用户token（可选） |

**请求参数**
```
ticket_id=1&page=1&page_size=10&sort_by=price&order=asc
```

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| ticket_id | int | 否 | - | 票券ID筛选 |
| page | int | 否 | 1 | 页码 |
| page_size | int | 否 | 10 | 每页数量 |
| sort_by | string | 否 | price | 排序方式 (price/date) |
| order | string | 否 | asc | 排序顺序 (asc/desc) |

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "list": [
      {
        "consignment_id": 1,
        "ticket_id": 1,
        "ticket_name": "票券名称",
        "price": "100.00",
        "currency": "usdt",
        "seller_uid": 123456,
        "create_time": "2026-01-26T10:00:00+08:00"
      }
    ],
    "total": 50,
    "page": 1,
    "page_size": 10
  }
}
```

---

### 8.5 获取寄售市场统计

获取寄售市场统计。

**接口地址**
```
GET /arts/consignment/market/stats/:ticket_id
```

**路径参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| ticket_id | int | 是 | 票券ID |

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "ticket_id": 1,
    "total_listings": 100,
    "lowest_price": "95.00",
    "highest_price": "110.00",
    "average_price": "100.00",
    "total_volume": "10000.00"
  }
}
```

---

### 8.6 获取价格历史

获取价格历史。

**接口地址**
```
GET /arts/consignment/price/history/:ticket_id
```

**路径参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| ticket_id | int | 是 | 票券ID |

**请求参数**
```
days=7
```

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| days | int | 否 | 7 | 天数 |

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "ticket_id": 1,
    "price_history": [
      {
        "date": "2026-01-26",
        "price": "100.00",
        "volume": 1000
      }
    ]
  }
}
```

---

### 8.7 获取所有寄售统计

获取所有寄售统计信息。

**接口地址**
```
GET /arts/consignment/stats/all
```

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "total_listings": 1000,
    "total_volume": "100000.00",
    "active_tickets": 50
  }
}
```

---

### 8.8 获取指定票券寄售统计

获取指定票券的寄售统计。

**接口地址**
```
GET /arts/consignment/stats/:ticket_id
```

**路径参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| ticket_id | int | 是 | 票券ID |

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "ticket_id": 1,
    "total_listings": 100,
    "total_sales": 50,
    "total_volume": "5000.00",
    "average_price": "100.00"
  }
}
```

---

### 8.9 获取我的寄售订单

获取我的寄售订单。

**接口地址**
```
GET /arts/consignment/my/orders
```

**请求头**
```
token: {用户token}
```

**请求参数**
```
status=pending&page=1&page_size=10
```

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| status | string | 否 | - | 状态筛选 (pending/sold/cancelled) |
| page | int | 否 | 1 | 页码 |
| page_size | int | 否 | 10 | 每页数量 |

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "list": [
      {
        "consignment_id": 1,
        "ticket_id": 1,
        "ticket_name": "票券名称",
        "price": "100.00",
        "currency": "usdt",
        "status": "pending",
        "create_time": "2026-01-26T10:00:00+08:00"
      }
    ],
    "total": 20,
    "page": 1,
    "page_size": 10
  }
}
```

---

## 9. 渠道商模块 (Channel)

**基础路径**: `/arts/channel`

### 9.1 提交渠道商申请

提交渠道商申请。

**接口地址**
```
POST /arts/channel/submit
```

**请求头**
```
Content-Type: application/json
token: {用户token}
```

**请求参数**
```json
{
  "company_name": "公司名称",
  "contact_name": "联系人姓名",
  "email": "contact@example.com",
  "phone": "13800138000",
  "address": "公司地址",
  "description": "公司描述"
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| company_name | string | 是 | 公司名称 |
| contact_name | string | 是 | 联系人姓名 |
| email | string | 是 | 联系邮箱 |
| phone | string | 是 | 联系电话 |
| address | string | 否 | 公司地址 |
| description | string | 否 | 公司描述 |

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "application_id": 1,
    "message": "申请提交成功"
  }
}
```

---

### 9.2 获取渠道商信息

获取渠道商信息。

**接口地址**
```
GET /arts/channel/info
```

**请求头**
| Header | 类型 | 必填 | 说明 |
|--------|------|------|------|
| token | string | 否 | 用户token（可选） |

**请求参数**
```
channel_id=1
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| channel_id | int | 否 | 渠道商ID |

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "channel_id": 1,
    "company_name": "公司名称",
    "contact_name": "联系人姓名",
    "email": "contact@example.com",
    "phone": "13800138000",
    "status": "active"
  }
}
```

---

## 10. 健康检查模块 (Health)

**基础路径**: `/arts/health`

### 10.1 快速健康检查

**接口**: `GET /arts/health/cycle/quick`

**说明**: 快速健康检查（公开接口）

**认证**: 无需 Token（公开接口）

**响应示例**:
```json
{
  "code": 0,
  "data": {
    "status": "healthy",
    "timestamp": "2026-01-26T10:00:00Z"
  },
  "msg": "success"
}
```

---

### 10.2 获取健康状态摘要

获取健康状态摘要。

**接口地址**
```
GET /arts/health/cycle/summary
```

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "status": "healthy",
    "database": "ok",
    "redis": "ok",
    "last_check": "2026-01-26T10:00:00+08:00"
  }
}
```

---

### 10.3 获取健康状态

获取最后一次健康检查状态。

**接口地址**
```
GET /arts/health/cycle/status
```

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "status": "healthy",
    "check_time": "2026-01-26T10:00:00+08:00",
    "details": {
      "database": "ok",
      "redis": "ok"
    }
  }
}
```

---

### 10.4 获取性能指标

获取性能指标。

**接口地址**
```
GET /arts/health/cycle/metrics
```

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "cpu_usage": 30.5,
    "memory_usage": 60.2,
    "disk_usage": 45.0,
    "request_count": 1000,
    "error_rate": 0.01
  }
}
```

---

### 10.5 执行完整健康检查

执行完整健康检查（管理员接口）。

**接口地址**
```
POST /arts/health/cycle/check
```

**请求头**
```
Content-Type: application/json
token: {管理员token}
```

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "status": "healthy",
    "check_time": "2026-01-26T10:00:00+08:00",
    "details": {
      "database": "ok",
      "redis": "ok",
      "disk": "ok"
    }
  }
}
```

---

### 10.6 验证数据一致性

验证数据一致性（管理员接口）。

**接口地址**
```
POST /arts/health/cycle/consistency
```

**请求头**
```
Content-Type: application/json
token: {管理员token}
```

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "consistent": true,
    "issues": [],
    "check_time": "2026-01-26T10:00:00+08:00"
  }
}
```

---

### 10.7 触发故障恢复

触发故障恢复（管理员接口）。

**接口地址**
```
POST /arts/health/cycle/recovery
```

**请求头**
```
Content-Type: application/json
token: {管理员token}
```

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "recovery_started": true,
    "message": "故障恢复已启动"
  }
}
```

---

### 10.8 管理员操作

管理员操作接口。

**接口地址**
```
POST /arts/health/admin/operation
```

**请求头**
```
Content-Type: application/json
token: {管理员token}
```

**请求参数**
```json
{
  "operation": "restart_service",
  "params": {}
}
```

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "message": "操作执行成功"
  }
}
```

---

## 11. 管理员模块 (Admin)

### 11.1 票券管理

**基础路径**: `/arts/admin/ticket`

#### 11.1.1 创建票券

创建票券（管理员接口）。

**接口地址**
```
POST /arts/admin/ticket/create
```

**请求头**
```
Content-Type: application/json
token: {管理员token}
```

**请求参数**
```json
{
  "ticket_name": "票券名称",
  "description": "票券描述",
  "price": "100.00",
  "total_quantity": 1000,
  "cover_url": "/static/ticket/cover/xxx.jpg"
}
```

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "ticket_id": 1,
    "message": "票券创建成功"
  }
}
```

---

#### 11.1.2 更新票券状态

更新票券状态（管理员接口）。

**接口地址**
```
PUT /arts/admin/ticket/:id/status
```

**请求头**
```
Content-Type: application/json
token: {管理员token}
```

**路径参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | int | 是 | 票券ID |

**请求参数**
```json
{
  "status": "active"
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| status | string | 是 | 状态：`active`（激活）、`inactive`（停用）、`sold_out`（售罄） |

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "message": "状态更新成功"
  }
}
```

---

#### 11.1.3 获取票券列表

获取票券列表（管理员接口）。

**接口地址**
```
GET /arts/admin/ticket/list
```

**请求头**
```
token: {管理员token}
```

**请求参数**
```
page=1&page_size=10&status=active
```

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| page | int | 否 | 1 | 页码 |
| page_size | int | 否 | 10 | 每页数量 |
| status | string | 否 | - | 状态筛选 |

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "list": [
      {
        "ticket_id": 1,
        "ticket_name": "票券名称",
        "price": "100.00",
        "total_quantity": 1000,
        "remaining_quantity": 500,
        "status": "active"
      }
    ],
    "total": 50,
    "page": 1,
    "page_size": 10
  }
}
```

---

#### 11.1.4 获取票券详情

获取票券详情（管理员接口）。

**接口地址**
```
GET /arts/admin/ticket/:id
```

**请求头**
```
token: {管理员token}
```

**路径参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | int | 是 | 票券ID |

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "ticket_id": 1,
    "ticket_name": "票券名称",
    "description": "票券描述",
    "price": "100.00",
    "total_quantity": 1000,
    "remaining_quantity": 500,
    "status": "active",
    "create_time": "2026-01-26T10:00:00+08:00"
  }
}
```

---

#### 11.1.5 获取市场概览

获取市场概览（管理员接口）。

**接口地址**
```
GET /arts/admin/ticket/market/overview
```

**请求头**
```
token: {管理员token}
```

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "total_tickets": 100,
    "active_tickets": 50,
    "total_volume": "1000000.00",
    "total_sales": 5000,
    "market_cap": "5000000.00"
  }
}
```

---

### 11.2 票券统计

**基础路径**: `/arts/admin/ticket`

#### 11.2.1 获取持仓快照数据

获取持仓快照数据（管理员接口）。

**接口地址**
```
GET /arts/admin/ticket/holding_snapshot
```

**请求头**
```
token: {管理员token}
```

**请求参数**
```
ticket_id=1&date=2026-01-26&page=1&page_size=10
```

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| ticket_id | int | 否 | - | 票券ID筛选 |
| date | string | 否 | - | 日期筛选（YYYY-MM-DD） |
| page | int | 否 | 1 | 页码 |
| page_size | int | 否 | 10 | 每页数量 |

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "list": [
      {
        "snapshot_id": 1,
        "ticket_id": 1,
        "date": "2026-01-26",
        "total_holders": 100,
        "total_quantity": 1000,
        "create_time": "2026-01-26T10:00:00+08:00"
      }
    ],
    "total": 50,
    "page": 1,
    "page_size": 10
  }
}
```

---

#### 11.2.2 导出持仓快照数据

导出持仓快照数据（Excel格式）（管理员接口）。

**接口地址**
```
GET /arts/admin/ticket/holding_snapshot/export
```

**请求头**
```
token: {管理员token}
```

**请求参数**
```
ticket_id=1&date=2026-01-26
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| ticket_id | int | 否 | 票券ID筛选 |
| date | string | 否 | 日期筛选（YYYY-MM-DD） |

**响应说明**
- 返回 Excel 文件流
- Content-Type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`

---

#### 11.2.3 获取持仓排行榜

获取持仓排行榜（管理员接口）。

**接口地址**
```
GET /arts/admin/ticket/holding_ranking
```

**请求头**
```
token: {管理员token}
```

**请求参数**
```
ticket_id=1&limit=100
```

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| ticket_id | int | 否 | - | 票券ID筛选 |
| limit | int | 否 | 100 | 返回数量 |

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "ranking": [
      {
        "rank": 1,
        "uid": 123456,
        "username": "user@example.com",
        "quantity": 100,
        "percentage": 10.0
      }
    ]
  }
}
```

---

#### 11.2.4 获取持仓趋势数据

获取持仓趋势数据（管理员接口）。

**接口地址**
```
GET /arts/admin/ticket/holding_trends
```

**请求头**
```
token: {管理员token}
```

**请求参数**
```
ticket_id=1&days=30
```

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| ticket_id | int | 否 | - | 票券ID筛选 |
| days | int | 否 | 30 | 天数 |

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "trends": [
      {
        "date": "2026-01-26",
        "total_holders": 100,
        "total_quantity": 1000
      }
    ]
  }
}
```

---

#### 11.2.5 获取持仓统计信息

获取持仓统计信息（管理员接口）。

**接口地址**
```
GET /arts/admin/ticket/holding_stats
```

**请求头**
```
token: {管理员token}
```

**请求参数**
```
ticket_id=1
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| ticket_id | int | 否 | 票券ID筛选 |

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "total_holders": 100,
    "total_quantity": 1000,
    "average_holding": 10.0,
    "top10_percentage": 50.0
  }
}
```

---

### 11.3 任务管理

**基础路径**: `/arts/admin/tasks`

#### 11.3.1 获取所有任务状态

获取所有任务状态（管理员接口）。

**接口地址**
```
GET /arts/admin/tasks/status
```

**请求头**
```
token: {管理员token}
```

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "tasks": [
      {
        "task_name": "kline_aggregator",
        "status": "running",
        "last_run": "2026-01-26T10:00:00+08:00",
        "next_run": "2026-01-26T11:00:00+08:00"
      }
    ]
  }
}
```

---

#### 11.3.2 重启指定任务

重启指定任务（管理员接口）。

**接口地址**
```
POST /arts/admin/tasks/restart
```

**请求头**
```
Content-Type: application/json
token: {管理员token}
```

**请求参数**
```json
{
  "task_name": "kline_aggregator"
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| task_name | string | 是 | 任务名称 |

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "message": "任务重启成功"
  }
}
```

---

#### 11.3.3 获取调度器概览

获取调度器概览（管理员接口）。

**接口地址**
```
GET /arts/admin/tasks/overview
```

**请求头**
```
token: {管理员token}
```

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "total_tasks": 10,
    "running_tasks": 8,
    "stopped_tasks": 2,
    "failed_tasks": 0
  }
}
```

---

#### 11.3.4 获取K线聚合器状态

获取K线聚合器状态（管理员接口）。

**接口地址**
```
GET /arts/admin/tasks/kline/status
```

**请求头**
```
token: {管理员token}
```

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "status": "running",
    "last_run": "2026-01-26T10:00:00+08:00",
    "processed_count": 1000,
    "error_count": 0
  }
}
```

---

#### 11.3.5 获取价格调度器状态

获取价格调度器状态（管理员接口）。

**接口地址**
```
GET /arts/admin/tasks/price/status
```

**请求头**
```
token: {管理员token}
```

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "status": "running",
    "last_run": "2026-01-26T10:00:00+08:00",
    "updated_tickets": 50
  }
}
```

---

#### 11.3.6 手动生成持仓快照

手动生成持仓快照（管理员接口）。

**接口地址**
```
POST /arts/admin/tasks/snapshot/generate
```

**请求头**
```
Content-Type: application/json
token: {管理员token}
```

**请求参数**
```json
{
  "ticket_id": 1,
  "date": "2026-01-26"
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| ticket_id | int | 否 | 票券ID（可选） |
| date | string | 否 | 日期（可选，默认今天，格式：YYYY-MM-DD） |

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "snapshot_id": 1,
    "message": "持仓快照生成成功"
  }
}
```

---

#### 11.3.7 获取持仓快照统计信息

获取持仓快照统计信息（管理员接口）。

**接口地址**
```
GET /arts/admin/tasks/snapshot/stats
```

**请求头**
```
token: {管理员token}
```

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "total_snapshots": 100,
    "last_snapshot_date": "2026-01-26",
    "tickets_covered": 50
  }
}
```

---

#### 11.3.8 重启持仓快照聚合器

重启持仓快照聚合器（管理员接口）。

**接口地址**
```
POST /arts/admin/tasks/snapshot/restart
```

**请求头**
```
Content-Type: application/json
token: {管理员token}
```

**响应示例**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "message": "持仓快照聚合器重启成功"
  }
}
```

---

## 📊 接口统计

### 按模块统计
- **用户模块**: 15 个接口
- **作品模块**: 40+ 个接口
- **文件模块**: 2 个接口
- **节点模块**: 15+ 个接口
- **入金模块**: 10 个接口
- **票券模块**: 15+ 个接口
- **寄售模块**: 9 个接口
- **渠道商模块**: 2 个接口
- **健康检查模块**: 8 个接口
- **管理员模块**: 20+ 个接口

**总计**: 130+ 个接口

### 按认证类型统计
- **需要 Token**: 90+ 个接口
- **可选 Token**: 20+ 个接口
- **无需 Token（公开）**: 20+ 个接口

---

## 🔍 快速查找索引

### 按功能查找

#### 登录注册
- Solana 钱包登录: [1.1](#11-solana-钱包登录)
- 邮箱登录: [1.2](#12-邮箱登录)
- 发送验证码: [1.3](#13-发送邮箱验证码)

#### 作品相关
- 作品列表: [2.1](#21-作品列表)
- 作品详情: [2.2](#22-作品详情)
- 上传作品: [2.3](#23-上传作品)
- 购买章节: [2.7](#27-购买章节)

#### 支付相关
- 入金 USDT: [6.1](#61-入金-usdt)
- 入金 ENT: [6.2](#62-入金-ent)
- 提币 USDT: [6.3](#63-提币-usdt)
- 获取余额: [6.5](#65-获取用户余额)

#### 票券相关
- 购买票券: [7.1](#71-购买票券)
- 票券列表: [7.2](#72-获取可购买票券列表)
- 票券详情: [7.3](#73-获取票券详情)
- 寄售票券: [8.1](#81-创建寄售订单)

#### 挖矿相关
- 获取挖矿奖励: [5.11.1](#5111-获取挖矿奖励)
- 领取挖矿奖励: [5.11.2](#5112-领取挖矿奖励)
- 挖矿历史: [5.11.4](#5114-获取挖矿历史)

#### 节点相关
- 节点信息: [5.1](#51-获取节点信息)
- 购买节点: [5.5](#55-执行购买)
- 购买记录: [5.8](#58-获取购买记录)

---

## 📝 注意事项

### 1. 请求频率限制
- **票券购买**: 每分钟最多 60 次请求
- **其他接口**: 无特殊限制（但建议合理控制频率）

### 2. 文件上传
- **最大文件大小**: 根据服务器配置
- **支持格式**: 图片 (jpg, png, gif), 视频等
- **上传路径**: `/arts/file/upload`

### 3. 分页参数
- **默认页码**: 1
- **默认每页数量**: 10
- **最大每页数量**: 建议不超过 100

### 4. 时间格式
- **日期格式**: `YYYY-MM-DD` (如: 2026-01-26)
- **时间格式**: `YYYY-MM-DD HH:mm:ss` (如: 2026-01-26 10:00:00)
- **ISO 8601**: `2026-01-26T10:00:00Z`

### 5. 金额格式
- **精度**: 保留 2 位小数
- **格式**: 字符串类型 (如: "100.00")
- **币种**: USDT, ENT, TOKEN

### 6. 错误处理
- 所有错误都会返回统一的错误格式
- 错误码定义在 `internal/errno/apierrno.go`
- 支持多语言错误消息

### 7. Token 有效期
- **默认有效期**: 7 天
- **刷新机制**: 每次请求自动刷新（如果配置了）

---

## 🔗 相关资源

### 代码位置
- **路由定义**: `internal/routers/router_api.go`
- **Handler 实现**: `internal/handler/`
- **请求参数**: `internal/vars/reqParams/`
- **错误码定义**: `internal/errno/apierrno.go`

### 配置文件
- **应用配置**: `configs/app.ini`
- **数据库配置**: `configs/mysql.ini`
- **Redis 配置**: `configs/redis.ini`

### 文档
- **部署文档**: `服务器部署文档.md`
- **生产部署文档**: `生产服务器部署文档.md`
- **数据库连接**: `DATABASE_CONNECTION_STRINGS.md`

---

## 📞 技术支持

如有问题，请查看：
1. 服务器日志: `/data/4arts/app/logs/`
2. 错误日志: `/data/4arts/app/logs/error.log`
3. 代码仓库: 项目 Git 仓库

---

**最后更新**: 2026-01-26  
**文档版本**: v2.0  
**维护者**: Arts Server Team

---

## 📋 更新日志

### v2.0 (2026-01-26)
- ✅ **完善**: 所有接口文档按照详细格式重写
- ✅ **合并**: 将 `docs/USER_AUTH_AND_INVITE_API.md` 的内容合并到本文档
- ✅ **新增**: 所有接口的完整请求头、参数表格、响应示例
- ✅ **新增**: 业务逻辑说明和注意事项
- ✅ **新增**: 错误码详细说明
- ✅ **优化**: 文档结构和索引

### v1.0 (2026-01-26)
- ✅ 初始版本
- ✅ 基础接口文档
