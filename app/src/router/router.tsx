import ActionObjectSearch from 'pages/action_object_search';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from 'pages';
import React from 'react';
import BoundingBoxImageViewer from 'pages/action_object_search/2d-bbox-image';

const Router = (): React.ReactElement => {
  const router = createBrowserRouter([
    {
      path: '/',
      element: <App />,
    },
    {
      path: '/action-object-search',
      element: <ActionObjectSearch />,
    },
    {
      path: '/action-object-search/2d-bbox-image',
      element: <BoundingBoxImageViewer />,
    },
  ]);

  return <RouterProvider router={router} />;
};
export default Router;
