import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Download } from "lucide-react";
import { Loader2 } from "lucide-react";

interface AIImageGeneratorDialogProps {
  onImageGenerated?: (imageUrl: string) => void;
  title?: string;
  content?: string;
}

export function AIImageGeneratorDialog({
  onImageGenerated,
  title: initialTitle = "",
  content: initialContent = "",
}: AIImageGeneratorDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [style, setStyle] = useState<"elegant" | "mystical" | "fortune" | "wisdom" | "nature">("elegant");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateByTypeMutation = trpc.aiImage.generateByType.useMutation({
    onSuccess: (data) => {
      setGeneratedImage(data.url);
      toast.success("配图生成成功！");
    },
    onError: (error) => {
      toast.error(`生成失败: ${error.message}`);
    },
    onMutate: () => {
      setIsGenerating(true);
    },
    onSettled: () => {
      setIsGenerating(false);
    },
  });

  const generateFromTextMutation = trpc.aiImage.generateFromText.useMutation({
    onSuccess: (data) => {
      setGeneratedImage(data.url);
      toast.success("配图生成成功！");
    },
    onError: (error) => {
      toast.error(`生成失败: ${error.message}`);
    },
    onMutate: () => {
      setIsGenerating(true);
    },
    onSettled: () => {
      setIsGenerating(false);
    },
  });

  const handleGenerate = async () => {
    if (!title.trim() && !content.trim()) {
      toast.error("请输入标题或内容");
      return;
    }

    const text = title.trim() ? `${title}\n${content}` : content;

    generateFromTextMutation.mutate({
      text,
      style,
    });
  };

  const handleUseImage = () => {
    if (generatedImage && onImageGenerated) {
      onImageGenerated(generatedImage);
      setOpen(false);
      setGeneratedImage(null);
      setTitle("");
      setContent("");
    }
  };

  const handleDownloadImage = () => {
    if (generatedImage) {
      const link = document.createElement("a");
      link.href = generatedImage;
      link.download = `lottery-image-${Date.now()}.jpg`;
      link.click();
    }
  };

  const styleLabels: Record<string, string> = {
    elegant: "优雅精致",
    mystical: "神秘玄学",
    fortune: "财运吉祥",
    wisdom: "智慧学问",
    nature: "自然和谐",
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Sparkles className="w-4 h-4 mr-2" />
          AI生成配图
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>AI配图生成</DialogTitle>
        </DialogHeader>

        {!generatedImage ? (
          <div className="space-y-4">
            {/* 标题输入 */}
            <div className="space-y-2">
              <Label>标题(可选)</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例如: 新年财运指南"
              />
            </div>

            {/* 内容输入 */}
            <div className="space-y-2">
              <Label>内容描述</Label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="描述您想要的配图内容，AI将根据描述自动生成精美的配图..."
                rows={4}
              />
            </div>

            {/* 风格选择 */}
            <div className="space-y-2">
              <Label>设计风格</Label>
              <Select value={style} onValueChange={(value: any) => setStyle(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(styleLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 风格说明 */}
            <Card className="bg-muted/50">
              <CardContent className="pt-4 text-sm text-muted-foreground">
                <p>
                  <strong>选中风格:</strong> {styleLabels[style]}
                </p>
                <p className="mt-2">
                  {style === "elegant" && "优雅精致的设计风格，适合高端资料展示"}
                  {style === "mystical" && "神秘玄学风格，包含中国传统元素"}
                  {style === "fortune" && "财运和好运主题，包含传统吉祥元素"}
                  {style === "wisdom" && "智慧和学问主题，适合知识性内容"}
                  {style === "nature" && "自然和谐风格，清新舒适"}
                </p>
              </CardContent>
            </Card>

            {/* 生成按钮 */}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setOpen(false);
                  setTitle("");
                  setContent("");
                }}
              >
                取消
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || (!title.trim() && !content.trim())}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    生成配图
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* 生成的图片预览 */}
            <div className="space-y-2">
              <Label>生成的配图</Label>
              <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted">
                <img
                  src={generatedImage}
                  alt="Generated"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setGeneratedImage(null);
                  setTitle("");
                  setContent("");
                }}
              >
                重新生成
              </Button>
              <Button
                variant="outline"
                onClick={handleDownloadImage}
              >
                <Download className="w-4 h-4 mr-2" />
                下载图片
              </Button>
              <Button onClick={handleUseImage}>
                使用此图片
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
