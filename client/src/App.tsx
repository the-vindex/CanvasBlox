import { QueryClientProvider } from '@tanstack/react-query';
import { Route, Switch } from 'wouter';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import LevelEditor from '@/pages/LevelEditor';
import NotFound from '@/pages/not-found';
import { queryClient } from './lib/queryClient';

function Router() {
    return (
        <Switch>
            <Route path="/" component={LevelEditor} />
            <Route component={NotFound} />
        </Switch>
    );
}

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <TooltipProvider>
                <Toaster />
                <Router />
            </TooltipProvider>
        </QueryClientProvider>
    );
}

export default App;
