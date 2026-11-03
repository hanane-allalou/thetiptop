import { Routes, Route } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext"
import HomePage from "./pages/HomePage"
import AdminPage from "./pages/AdminPage"
import EmployeePage from "./pages/EmployeePage"


function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/employee" element={<EmployeePage />} />
        </Routes>
      </div>
    </AuthProvider>
  )
}

export default App
