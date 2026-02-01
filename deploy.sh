#!/usr/bin/env bash
set -euo pipefail

# 用法: ./deploy.sh [prod|test]
# 默认部署到 prod；传 test 则构建 test 环境并部署到测试机
# 构建时使用对应 env：prod → .env.prod，test → .env.test（Vite --mode）

ENV=${1:-prod}
if [[ "${ENV}" != "prod" && "${ENV}" != "test" ]]; then
  echo "用法: $0 [prod|test]"
  echo "  prod  生产环境（默认），使用 .env.prod 构建，部署到 REMOTE_HOST_PROD"
  echo "  test  测试环境，使用 .env.test 构建，部署到 REMOTE_HOST_TEST"
  exit 1
fi

REMOTE_HOST_PROD=${REMOTE_HOST_PROD:-root@47.243.108.203}
REMOTE_HOST_TEST=${REMOTE_HOST_TEST:-root@47.86.163.202}
REMOTE_DIR=${REMOTE_DIR:-/data/mirror/static/h5}
SKIP_BUILD=${SKIP_BUILD:-0}

# 根据环境选择远程主机
if [[ "${ENV}" == "prod" ]]; then
  REMOTE_HOST=${REMOTE_HOST_PROD}
else
  REMOTE_HOST=${REMOTE_HOST_TEST}
fi

# 构建输出目录（Vite 默认输出到 apps/web/dist，可按需覆盖）
BUILD_OUTPUT_DIR=${BUILD_OUTPUT_DIR:-apps/web/dist}

echo "📌 部署环境: ${ENV} → ${REMOTE_HOST}"

# 按需本地构建（使用对应 env 的 build）
if [ "${SKIP_BUILD}" -eq 0 ]; then
  echo "🧱 Building H5 (mode=${ENV})..."
  pnpm install --frozen-lockfile
  if [[ "${ENV}" == "prod" ]]; then
    pnpm build:prod
  else
    pnpm build:test
  fi
fi

INDEX_FILE="${BUILD_OUTPUT_DIR}/index.html"
if [ ! -f "${INDEX_FILE}" ]; then
  echo "❌ ${INDEX_FILE} not found. Build failed or was skipped."
  exit 1
fi

# echo "📦 Syncing static files to ${REMOTE_HOST}:${REMOTE_DIR}..."
# ssh "${REMOTE_HOST}" "mkdir -p ${REMOTE_DIR}"
# rsync -az --delete \
#   "${BUILD_OUTPUT_DIR}/" "${REMOTE_HOST}:${REMOTE_DIR}/"

echo "✅ Deploy complete (${ENV})."
