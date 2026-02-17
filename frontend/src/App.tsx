import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
// import { Toaster } from "@/components/ui/toaster";

// Pages
import LoginPage from "@/pages/Login";
import Onboarding from "@/pages/Onboarding";
import Dashboard from "@/pages/Dashboard";
import AnalyzePage from "@/pages/Analyze";
import ScanDetails from "@/pages/ScanDetails";

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="ecotwin-theme">
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/onboarding/preferences" element={<Onboarding />} />
              <Route path="/analyze" element={<AnalyzePage />} />
              <Route path="/scan/:id" element={<ScanDetails />} />
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
