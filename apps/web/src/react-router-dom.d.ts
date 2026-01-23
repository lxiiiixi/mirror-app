// 修复 React 19 与 react-router-dom 的类型兼容性问题
// React 19 引入了新的类型系统，ReactNode 现在可能包含 Promise<ReactNode>
// 这导致 react-router-dom 的组件类型与 React 19 的 JSX 类型不兼容

// 通过扩展全局 JSX 命名空间来修复类型兼容性
declare global {
  namespace React {
    // 允许组件返回 ReactNode | Promise<ReactNode>
    type JSXElementConstructor<P = object> =
      | ((props: P) => ReactNode | Promise<ReactNode>)
      | (new (props: P) => Component<P, object>)
      | ExoticComponent<P>
  }
}

// 重新声明 react-router-dom 模块以修复类型
declare module 'react-router-dom' {
  import type { ComponentPropsWithoutRef } from 'react'
  import type { Location, NavigateFunction } from 'react-router'

  export interface NavLinkProps
    extends Omit<ComponentPropsWithoutRef<'a'>, 'href' | 'className'> {
    to: string
    className?: string | ((props: { isActive: boolean }) => string)
  }

  export const NavLink: React.ComponentType<NavLinkProps>

  export interface RoutesProps {
    children?: React.ReactNode
    location?: Partial<Location> | string
  }

  export const Routes: React.ComponentType<RoutesProps>

  export interface RouteProps {
    caseSensitive?: boolean
    children?: React.ReactNode
    element?: React.ReactNode
    index?: boolean
    path?: string
  }

  export const Route: React.ComponentType<RouteProps>

  export const useLocation: () => Location
  export const useNavigate: () => NavigateFunction
}
