---
name: "consult-product-spec"
description: "查阅产品说明书 (docs/product-spec) 以理解项目背景、需求、架构和工作流。当AI或者用户 询问项目详情或请求新功能时调用此 skill。"
---

# 查阅产品说明书 (Consult Product Specification)

本 Skill 用于帮助你通过查阅位于 `docs/product-spec/` 的产品说明书，来理解项目背景、需求、架构和工作流。

## 何时使用 (When to Use)
- 当用户询问有关项目功能、架构或工作流的问题时。
- 当用户请求新功能或修改时。
- 当你需要理解现有代码库结构和规范时。
- 当你在做出更改后需要更新文档时。

## 如何使用 (How to Use)
1. **阅读上下文**: 首先阅读 `docs/product-spec/00-context-for-ai.md`，以获取项目、技术栈和编码规范的概览。
2. **检查需求**: 如果用户询问功能，请阅读 `docs/product-spec/01-requirements.md`。
3. **理解架构**: 如果任务涉及代码更改或理解系统设计，请阅读 `docs/product-spec/02-architecture.md`。
4. **遵循工作流**: 如果你需要知道如何构建、测试或部署，请阅读 `docs/product-spec/03-workflows.md`。
5. **更新文档**: 如果你对项目所做的更改影响了需求、架构或工作流，**你必须**更新相应的文档文件。

## 文件结构 (File Structure)
- `docs/product-spec/index.md`: 主要入口点和目录。
- `docs/product-spec/00-context-for-ai.md`: AI 专用上下文和指南。
- `docs/product-spec/01-requirements.md`: 功能和非功能需求。
- `docs/product-spec/02-architecture.md`: 系统架构和设计。
- `docs/product-spec/03-workflows.md`: 开发和运维工作流。
