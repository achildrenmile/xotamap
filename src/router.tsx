import { createBrowserRouter } from 'react-router-dom'
import App from './App'
import MapView from './pages/MapView'
import Encyclopedia from './pages/Encyclopedia'
import ProgramDetail from './pages/ProgramDetail'
import SpotList from './pages/SpotList'
import LogView from './pages/LogView'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <MapView /> },
      { path: 'encyclopedia', element: <Encyclopedia /> },
      { path: 'encyclopedia/:id', element: <ProgramDetail /> },
      { path: 'spots', element: <SpotList /> },
      { path: 'log', element: <LogView /> },
    ],
  },
])
