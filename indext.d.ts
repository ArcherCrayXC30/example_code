declare module '*.svg'
declare module '*.gif'
declare module '*.png'
declare module '*.jpg'
declare module '*.jpeg'
declare module '*.webp'
declare module '*.css'
declare module '*.scss'

interface NodeRequire {
  ensure(
    dependencies: string[],
    callback: (require: IWebpackRequire) => void,
    errorCallback?: (error: Error) => void,
    chunkName?: string
  ): void
  resolveWeak(path: string): number
}

interface NodeModule {
  hot: {
    accept(path?: string, callback?: () => void): void
  }
}

declare namespace NodeJS {
  interface Global {
    $RefreshReg$: () => void
    $RefreshSig$$: () => void
  }
}

interface Window {
  __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: any
  __INITIAL_STATE__?: any
  sp?: function
  dataLayer?: any
  onYouTubeIframeAPIReady?: any
  YT?: any
}

interface AxiosRequestConfig {
  host: string
}
interface IRouteProps extends RouteProps {
  pageId: number
}

interface IRouteConfig extends RouteConfig {
  isArticle?: boolean
  isCourse?: boolean
  isTest?: boolean
  isInstruction?: boolean
  isNewsArticle?: boolean
  isLesson?: boolean
  isPulse?: boolean
  isWebinar?: boolean
  pageId: number
}

declare module 'imagemin' {
  type Plugin = (input: Buffer) => Promise<Buffer>

  interface Options {
    destination: string
    plugins: ReadonlyArray<Plugin>
  }

  interface Result {
    data: Buffer
    path: string
  }

  function imagemin(input: ReadonlyArray<string>, options?: imagemin.Options): Promise<imagemin.Result[]>

  function buffer(b: Buffer, options?: Options): Promise<Buffer>

  export = imagemin
}

type WithOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

type PartialExcept<T, K extends keyof T> = Pick<T, K> & Partial<T>
