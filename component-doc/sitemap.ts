export type SiteMap = {
  page: SitePage[]
}

export type SitePage = {
  segment: string,
  parent: string,
}