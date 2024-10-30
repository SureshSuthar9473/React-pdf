import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import WithoutCheckBox from './WithoutCheckBox.jsx'

const route = createBrowserRouter([
  {path:'/',element:<App/>},
  {path:'/without-select',element:<WithoutCheckBox/>}
])

createRoot(document.getElementById('root')).render(
  <RouterProvider router={route}>
    
  </RouterProvider>,
)
