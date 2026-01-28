import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { 
  FileText, 
  Image, 
  Ticket, 
  History,
  Settings,
  Sparkles
} from "lucide-react";
import { Link } from "wouter";

export default function Admin() {
  const { user } = useAuth();
  const { data: textBlocksCount } = trpc.textBlocks.list.useQuery({});
  const { data: imageBlocksCount } = trpc.imageBlocks.list.useQuery({});
  const { data: drawsCount } = trpc.lotteryDraws.list.useQuery({ limit: 100 });

  // 权限检查已由 AdminRoute 组件处理

  const stats = [
    { 
      title: "文字资料", 
      value: textBlocksCount?.length || 0, 
      icon: FileText,
      link: "/admin/text-blocks",
      color: "text-blue-600"
    },
    { 
      title: "图片资料", 
      value: imageBlocksCount?.length || 0, 
      icon: Image,
      link: "/admin/image-blocks",
      color: "text-green-600"
    },
    { 
      title: "开奖记录", 
      value: drawsCount?.length || 0, 
      icon: Ticket,
      link: "/admin/draws",
      color: "text-purple-600"
    },
  ];

  const quickActions = [
    { 
      title: "快捷开奖", 
      description: "快速录入新一期开奖结果",
      icon: Ticket,
      link: "/admin/quick-draw",
      color: "text-red-600"
    },
    { 
      title: "开奖历史", 
      description: "查看和编辑历史开奖记录",
      icon: History,
      link: "/admin/draw-history",
      color: "text-orange-600"
    },
    { 
      title: "资料管理", 
      description: "管理文字和图片资料板块",
      icon: FileText,
      link: "/admin/materials",
      color: "text-indigo-600"
    },
    { 
      title: "AI配图生成", 
      description: "使用AI自动生成资料配图",
      icon: Sparkles,
      link: "/admin/ai-images",
      color: "text-pink-600"
    },
    { 
      title: "系统设置", 
      description: "配置彩票类型和号码属性",
      icon: Settings,
      link: "/admin/settings",
      color: "text-gray-600"
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">后台管理</h1>
          <p className="text-muted-foreground mt-2">欢迎回来，{user?.name || '管理员'}</p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <Link key={index} href={stat.link}>
              <Card className="card-elegant hover:scale-105 transition-transform cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* 快捷操作 */}
        <div>
          <h2 className="text-2xl font-bold mb-4">快捷操作</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.link}>
                <Card className="card-elegant hover:scale-105 transition-transform cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <action.icon className={`w-8 h-8 ${action.color}`} />
                      <CardTitle>{action.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
