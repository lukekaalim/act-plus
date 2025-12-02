export type CoreAPI = {
  routes: RoutesAPI,
  components: ComponentsAPI,
  articles: ArticlesAPI,
}

export type RoutesAPI = {
  routes: Route[],

  addRoute(): void,
}