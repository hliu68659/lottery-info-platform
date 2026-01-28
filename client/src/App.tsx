import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import MaterialDetail from "./pages/MaterialDetail";
import ZodiacPage from "./pages/ZodiacPage";
import HistoryPage from "./pages/HistoryPage";
import PlaceholderPage from "./pages/PlaceholderPage";
import Admin from "./pages/Admin";
import AdminQuickDraw from "./pages/AdminQuickDraw";
import AdminDrawHistory from "./pages/AdminDrawHistory";
import AdminMaterials from "./pages/AdminMaterials";
import AdminRoute from "./components/AdminRoute";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/zodiac"} component={ZodiacPage} />
      <Route path={"/history"} component={HistoryPage} />
      
      {/* 资料详情页 */}
      <Route path={"/shensuan"}>
        <MaterialDetail location="shensuan" title="神算子" />
      </Route>
      <Route path={"/guanjiapo"}>
        <MaterialDetail location="guanjiapo" title="管家婆" />
      </Route>
      <Route path={"/huangdaxian"}>
        <MaterialDetail location="huangdaxian" title="黄大仙" />
      </Route>
      
      {/* 占位页面 */}
      <Route path={"/barcode"}>
        <PlaceholderPage 
          title="条码助手" 
          description="条码助手功能正在开发中，敬请期待！" 
        />
      </Route>
      <Route path={"/formula"}>
        <PlaceholderPage 
          title="六合公式" 
          description="六合公式功能正在开发中，敬请期待！" 
        />
      </Route>
      <Route path={"/humor"}>
        <PlaceholderPage 
          title="幽默猜测" 
          description="幽默猜测功能正在开发中，敬请期待！" 
        />
      </Route>
      
      {/* 后台管理路由 - 需要管理员权限 */}
      <Route path={"/admin"}>
        <AdminRoute>
          <Admin />
        </AdminRoute>
      </Route>
      <Route path={"/admin/quick-draw"}>
        <AdminRoute>
          <AdminQuickDraw />
        </AdminRoute>
      </Route>
      <Route path={"/admin/draw-history"}>
        <AdminRoute>
          <AdminDrawHistory />
        </AdminRoute>
      </Route>
      <Route path={"/admin/materials"}>
        <AdminRoute>
          <AdminMaterials />
        </AdminRoute>
      </Route>
      <Route path={"/admin/text-blocks"}>
        <AdminRoute>
          <AdminMaterials />
        </AdminRoute>
      </Route>
      <Route path={"/admin/image-blocks"}>
        <AdminRoute>
          <AdminMaterials />
        </AdminRoute>
      </Route>
      <Route path={"/admin/draws"}>
        <AdminRoute>
          <AdminDrawHistory />
        </AdminRoute>
      </Route>
      <Route path={"/admin/ai-images"}>
        <AdminRoute>
          <PlaceholderPage 
            title="AI配图生成" 
            description="AI配图生成功能正在开发中，敬请期待！" 
          />
        </AdminRoute>
      </Route>
      <Route path={"/admin/settings"}>
        <AdminRoute>
          <PlaceholderPage 
            title="系统设置" 
            description="系统设置功能正在开发中，敬请期待！" 
          />
        </AdminRoute>
      </Route>
      
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
