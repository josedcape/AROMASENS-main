import { Route, Switch } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import Home from "./pages/Home";
import Chat from "./pages/Chat";
import Recommendation from "./pages/Recommendation";
import Shop from "./pages/Shop";
import NotFound from "./pages/not-found";
import { ChatProvider } from "./context/ChatContext";
import { AISettingsProvider } from "./context/AISettingsContext";
import { queryClient } from "./lib/queryClient";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AISettingsProvider>
        <ChatProvider>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/chat" component={Chat} />
            <Route path="/recommendation/:id?" component={Recommendation} />
            <Route path="/shop" component={Shop} />
            <Route component={NotFound} />
          </Switch>
          <Toaster />
        </ChatProvider>
      </AISettingsProvider>
    </QueryClientProvider>
  );
}