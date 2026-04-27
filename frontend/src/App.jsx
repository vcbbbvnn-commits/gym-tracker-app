// Version 1.0.3 - Redeploy Trigger
import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import AuthPage from "./pages/AuthPage";
import HomePage from "./pages/HomePage";
import SessionsPage from "./pages/SessionsPage";
import ProgressPage from "./pages/ProgressPage";
import ProgressDetailPage from "./pages/ProgressDetailPage";
import WorkoutSessionPage from "./pages/WorkoutSessionPage";
import TemplatesPage from "./pages/TemplatesPage";
import ExerciseLibraryPage from "./pages/ExerciseLibraryPage";

function App() {
  const { token } = useAuth();

  return (
    <Routes>
      <Route
        path="/auth"
        element={token ? <Navigate to="/" replace /> : <AuthPage />}
      />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<HomePage />} />
        <Route path="/sessions" element={<SessionsPage />} />
        <Route path="/templates" element={<TemplatesPage />} />
        <Route path="/exercises" element={<ExerciseLibraryPage />} />
        <Route path="/workouts/:workoutId" element={<WorkoutSessionPage />} />
        <Route path="/progress" element={<ProgressPage />} />
        <Route path="/progress/:exerciseName" element={<ProgressDetailPage />} />
      </Route>
      <Route path="*" element={<Navigate to={token ? "/" : "/auth"} replace />} />
    </Routes>
  );
}

export default App;
