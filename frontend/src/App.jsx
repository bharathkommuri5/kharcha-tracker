import { Navigate, Route, Routes } from "react-router-dom";
import RequireAuth from "./components/RequireAuth.jsx";
import AppLayout from "./pages/AppLayout.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import OverviewView from "./views/OverviewView.jsx";
import ProfileView from "./views/ProfileView.jsx";
import ReportsView from "./views/ReportsView.jsx";
import TeamView from "./views/TeamView.jsx";
import TeamsListView from "./views/TeamsListView.jsx";
import TransactionsView from "./views/TransactionsView.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/app"
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<OverviewView />} />
        <Route path="transactions" element={<TransactionsView />} />
        <Route path="teams" element={<TeamsListView />} />
        <Route path="teams/:teamId" element={<TeamView />} />
        <Route path="reports" element={<ReportsView />} />
        <Route path="profile" element={<ProfileView />} />
        <Route path="*" element={<Navigate to="overview" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
