#!/usr/bin/env bash
set -euo pipefail

# 使用方式: ./deploy.sh test | prod
# 环境变量（可选，用于覆盖默认服务器与目录）:
#   测试: REMOTE_HOST_TEST, REMOTE_DIR_TEST
#   正式: REMOTE_HOST_PROD, REMOTE_DIR_PROD
#   通用: SKIP_BUILD=1 跳过本地构建，仅同步已存在的 dist

ENV="${1:-}"

if [ -z "${ENV}" ] || [[ ! "${ENV}" =~ ^(test|prod)$ ]]; then
  echo "用法: $0 test | prod"
  echo "  test  - 构建 test 并部署到测试环境"
  echo "  prod  - 构建 prod 并部署到正式环境"
  exit 1
fi

if [ "${ENV}" = "test" ]; then
  REMOTE_HOST="${REMOTE_HOST_TEST:-root@47.86.163.202}"
  REMOTE_DIR="${REMOTE_DIR_TEST:-/data/4arts/static/h5}"
  BUILD_CMD="pnpm build:test"
else
  # 正式环境参考 arts-app/deploy-pro.sh
  REMOTE_HOST="${REMOTE_HOST_PROD:-root@47.243.108.203}"
  REMOTE_DIR="${REMOTE_DIR_PROD:-/data/mirror/web}"
  BUILD_CMD="pnpm build:prod"
fi

SKIP_BUILD="${SKIP_BUILD:-0}"

echo "🎯 环境: ${ENV}"
echo "📂 目标: ${REMOTE_HOST}:${REMOTE_DIR}"
echo ""

if [ "${SKIP_BUILD}" -eq 0 ]; then
  echo "🧱 本地构建 (${BUILD_CMD})..."
  pnpm install --frozen-lockfile
  ${BUILD_CMD}
fi

if [ ! -f dist/index.html ]; then
  echo "❌ dist/index.html 不存在，请先完成构建或去掉 SKIP_BUILD=1。"
  exit 1
fi

echo "📦 同步静态资源到 ${REMOTE_HOST}:${REMOTE_DIR} ..."
ssh "${REMOTE_HOST}" "mkdir -p ${REMOTE_DIR}"
rsync -az --delete dist/ "${REMOTE_HOST}:${REMOTE_DIR}/"

echo "✅ 部署完成 (${ENV})。"
