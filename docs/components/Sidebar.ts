import { useRouterContext } from "@lukekaalim/act-router";


export const Sidebar = () => {
  const router = useRouterContext();

  const parts = router.location.pathname.split('/');

  return JSON.stringify(parts);
};

const BackButton = () => {

}

const GroupTitle = () => {

};

const PageTitle = () => {

};
