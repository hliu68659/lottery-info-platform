import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";

interface MaterialDetailProps {
  location: "shensuan" | "guanjiapo" | "huangdaxian";
  title: string;
}

export default function MaterialDetail({ location, title }: MaterialDetailProps) {
  const [, navigate] = useLocation();
  
  const { data: textBlocks, isLoading: loadingText } = trpc.textBlocks.list.useQuery({ 
    location, 
    visibleOnly: true 
  });
  
  const { data: imageBlocks, isLoading: loadingImages } = trpc.imageBlocks.list.useQuery({ 
    location, 
    visibleOnly: true 
  });

  return (
    <div className="min-h-screen elegant-gradient overflow-x-hidden">
      {/* 头部 */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-50 w-full">
        <div className="container px-4 sm:px-6 lg:px-8 py-4 mx-auto">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate("/")}
              className="flex-shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold golden-shine bg-clip-text text-transparent truncate">
              {title}
            </h1>
          </div>
        </div>
      </header>

      <main className="container px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 sm:space-y-12 mx-auto w-full max-w-full">
        {/* 文字资料板块 */}
        <section className="w-full">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">资料内容</h2>
          {loadingText ? (
            <div className="text-center text-muted-foreground">加载中...</div>
          ) : textBlocks && textBlocks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 w-full">
              {textBlocks.map((block) => (
                <Card key={block.id} className="card-elegant">
                  <CardHeader>
                    <CardTitle className="text-lg">{block.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground whitespace-pre-wrap break-words overflow-hidden" dangerouslySetInnerHTML={{ __html: block.content }} />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="card-elegant">
              <CardContent className="py-12 text-center text-muted-foreground">
                暂无资料内容
              </CardContent>
            </Card>
          )}
        </section>

        {/* 图片资料板块 */}
        {imageBlocks && imageBlocks.length > 0 && (
          <section className="w-full">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">图片资料</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full">
              {imageBlocks.map((block) => (
                <Card key={block.id} className="card-elegant overflow-hidden">
                  <div className="aspect-video relative overflow-hidden">
                    <img 
                      src={block.imageUrl} 
                      alt={block.title}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2 text-sm sm:text-base break-words">{block.title}</h3>
                    {block.description && (
                      <p className="text-xs sm:text-sm text-muted-foreground break-words">{block.description}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* 页脚 */}
      <footer className="bg-card/80 backdrop-blur-sm border-t border-border mt-8 sm:mt-12 w-full">
        <div className="container px-4 sm:px-6 lg:px-8 py-4 sm:py-6 text-center text-xs sm:text-sm text-muted-foreground mx-auto">
          <p>© 2026 彩票资讯平台 - 仅供娱乐参考</p>
        </div>
      </footer>
    </div>
  );
}
