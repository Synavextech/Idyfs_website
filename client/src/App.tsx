
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";

// Pages
import NotFound from "@/pages/not-found";
import Landing from "@/pages/laning";
import Services from "@/pages/services";
import Team from "@/pages/about";
import Blog from "@/pages/blog";
import Onboard from "@/pages/onboard";
import Admin from "@/pages/Admin";
import AuthPage from "@/pages/Auth";
import Events from "@/pages/Events";
import NavBar from "@/components/NavBar";

import Footer from "@/components/Footer";

function Router() {
    return (
        <Switch>
            <Route path="/" component={Landing} />
            <Route path="/services" component={Services} />
            <Route path="/team" component={Team} />
            <Route path="/blog" component={Blog} />
            <Route path="/events" component={Events} />
            <Route path="/onboard" component={Onboard} />
            <Route path="/auth" component={AuthPage} />
            <ProtectedRoute path="/admin" component={Admin} requireAdmin />
            {/* Fallback for admins/auth specifically, usually would have a /login page maybe under /admin/login or similar, but for now relying on basic auth modals or such embedded if needed, or create a designated Auth page. Assuming simple structure first. */}

            {/* <Route path="/auth" component={AuthPage} /> */}
            <Route component={NotFound} />
        </Switch>
    );
}

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <div className="flex min-h-screen flex-col">
                    <NavBar />
                    <main className="flex-1">
                        <Router />
                    </main>
                    <Footer />
                </div>
                <Toaster />
            </AuthProvider>
        </QueryClientProvider>
    );
}

export default App;
