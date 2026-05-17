import {createHashRouter, Outlet, RouterProvider} from 'react-router-dom';
import {AppShell} from '../components/layout/AppShell';
import Dashboard from '../pages/Dashboard';
import Scan from '../pages/Scan';
import FindingsList from '../pages/FindingsList';
import FindingDetail from '../pages/FindingDetail';
import HeatmapPreview from '../pages/HeatmapPreview';
import Settings from '../pages/Settings';
import Report from '../pages/Report';
import {ScanProvider} from './ScanContext';

const router = createHashRouter([
  {
    path: '/',
    element: (
      <AppShell>
        <Outlet />
      </AppShell>
    ),
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'scan',
        element: <Scan />,
      },
      {
        path: 'findings',
        element: <FindingsList />,
      },
      {
        path: 'findings/:id',
        element: <FindingDetail />,
      },
      {
        path: 'heatmap',
        element: <HeatmapPreview />,
      },
      {
        path: 'settings',
        element: <Settings />,
      },
      {
        path: 'report',
        element: <Report />,
      },
    ],
  },
]);

export default function App() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <ScanProvider>
        <RouterProvider router={router} />
      </ScanProvider>
    </div>
  );
}