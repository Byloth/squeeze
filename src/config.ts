import type { RouteLocationNormalized, RouteRecordRaw } from "vue-router";

export type PageOptions = RouteRecordRaw &
{
  id: number;
  title: string;
  icon?: string;
  meta?: {
    requiresAuth?: boolean;
    topLevel?: boolean;
  }
};
export interface ConfigOptions
{
  backendUrl: string;

  title: string;
  author: string;
  pages: PageOptions[];
  version: string;
}

class PageCollection extends Array<PageOptions>
{
  public get topLevel(): PageOptions[]
  {
    return this.filter((page) => page.meta?.topLevel);
  }

  public getByPath(path: string): PageOptions | undefined
  {
    return this.find((page) => page.path === path);
  }
  public getByRoute(route: RouteLocationNormalized): PageOptions | undefined
  {
    return this.getByPath(route.path);
  }
}
class Config implements ConfigOptions
{
  protected _options: ConfigOptions;
  protected _pages: PageCollection;

  public get backendUrl(): string { return this._options.backendUrl; }

  public get title(): string { return this._options.title; }
  public get author(): string { return this._options.author; }
  public get version(): string { return this._options.version; }

  public get pages(): PageCollection { return this._pages; }

  constructor(options: ConfigOptions)
  {
    this._options = options;
    this._pages = new PageCollection(...this._options.pages);
  }
}

export default new Config({
  backendUrl: import.meta.env["VITE_BACKEND_URL"],

  title: "Do you Dare?",
  author: "Matteo Bilotta",
  pages: [
    {
      id: 0x1,
      name: "home",
      path: "/",
      component: () => import("./pages/HomePage.vue"),
      title: "Home page",
      meta: { topLevel: true }
    }
  ],
  version: "0.0.1α"
});
