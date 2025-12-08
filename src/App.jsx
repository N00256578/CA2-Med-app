import { AuthProvider } from "./hooks/useAuth";

import { BrowserRouter as Router, Routes, Route } from "react-router";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";

import Home from "@/pages/Home";

import FestivalsIndex from "@/pages/festivals/Index";
import FestivalsShow from "@/pages/festivals/Show";
import FestivalsCreate from "@/pages/festivals/Create";
import FestivalsEdit from "@/pages/festivals/Edit";

import FormExamples from "@/pages/examples/Forms";
import ProtectedRoute from "@/pages/ProtectedRoute";

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <SidebarProvider
          style={{
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          }}
        >
          <AppSidebar variant="inset" />
          <SidebarInset>
            <SiteHeader />
            {/* <Navbar onLogin={onLogin} loggedIn={loggedIn} /> */}

            <div className="flex flex-1 flex-col">
              <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-2 py-4 md:gap-2 md:py-6 mx-6">
                  {/* Main content */}
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/festivals" element={<FestivalsIndex />} />

                    <Route path="/" element={<ProtectedRoute />}>
                      <Route
                        path="/festivals/:id"
                        element={<FestivalsShow />}
                      />
                      <Route
                        path="/festivals/:id/edit"
                        element={<FestivalsEdit />}
                      />
                      <Route
                        path="/festivals/create"
                        element={<FestivalsCreate />}
                      />
                    </Route>

                    <Route path="/forms" element={<FormExamples />} />
                  </Routes>
                </div>
              </div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </AuthProvider>
    </Router>
  );
}
