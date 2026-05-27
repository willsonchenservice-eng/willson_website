# Notion 数据库配置（精简版）

## PhotoWall（照片墙）
**最少只需要：名称 + File**

| 字段 | 类型 | 必填 | 默认值 |
|------|------|------|--------|
| 名称 | Title | ✅ | - |
| File | Files & media | ✅ | - |
| Status | Select | ✅ | 完成 |

---

## Work（作品）
**最少只需要：名称 + 正文内容**

| 字段 | 类型 | 必填 | 默认值 |
|------|------|------|--------|
| 名称 | Title | ✅ | - |
| Status | Select | ✅ | 完成 |
| 正文 | Page Content | ✅ | - |

---

## Writing（博客）
**最少只需要：名称 + 正文内容**

| 字段 | 类型 | 必填 | 默认值 |
|------|------|------|--------|
| 名称 | Title | ✅ | - |
| Status | Select | ✅ | 完成 |
| 正文 | Page Content | ✅ | - |

---

## Beliefs（设计理念）
**最少只需要：名称 + 描述**

| 字段 | 类型 | 必填 | 默认值 |
|------|------|------|--------|
| 名称 | Title | ✅ | - |
| Tail/描述 | Rich text | ✅ | - |
| Status | Select | ✅ | 完成 |

---

## Social（自媒体）
**最少只需要：名称 + File + 链接 + 描述**

| 字段 | 类型 | 必填 | 默认值 |
|------|------|------|--------|
| 名称 | Title | ✅ | - |
| File/视频 | Files & media | ✅ | - |
| Link/链接 | URL | ✅ | - |
| Body/描述 | Rich text | ✅ | - |
| Status | Select | ✅ | 完成 |

---

## 环境变量
```
NOTION_API_KEY=你的token
NOTION_DATABASE_ID=Blog数据库ID
NOTION_WORK_DATABASE_ID=Work数据库ID
NOTION_PHOTOS_DATABASE_ID=PhotoWall数据库ID
NOTION_BELIEFS_DATABASE_ID=Beliefs数据库ID
NOTION_SOCIAL_DATABASE_ID=Social数据库ID
```
