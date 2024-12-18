declare module "@repo/web" {
  export function getPublicDir(): string;
  export function getServerBuild(): Promise<any>;
  export function startDevServer(app: any): Promise<void>;
}
