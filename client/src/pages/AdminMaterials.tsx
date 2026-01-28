import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Edit, Trash2, Plus, Eye, EyeOff } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { AIImageGeneratorDialog } from "@/components/AIImageGeneratorDialog";
import { RichTextEditor, RichTextDisplay } from "@/components/RichTextEditor";

export default function AdminMaterials() {
  const { user } = useAuth();
  const [selectedLocation, setSelectedLocation] = useState<"home" | "shensuan" | "guanjiapo" | "huangdaxian">("home");
  const [editingText, setEditingText] = useState<any>(null);
  const [editingImage, setEditingImage] = useState<any>(null);
  const [newText, setNewText] = useState({ title: "", content: "", displayOrder: 0, visible: true });
  const [newImage, setNewImage] = useState({ title: "", imageUrl: "", description: "", displayOrder: 0, visible: true });

  const { data: textBlocks, refetch: refetchText } = trpc.textBlocks.list.useQuery({ location: selectedLocation });
  const { data: imageBlocks, refetch: refetchImage } = trpc.imageBlocks.list.useQuery({ location: selectedLocation });

  const createTextMutation = trpc.textBlocks.create.useMutation({
    onSuccess: () => {
      toast.success("创建成功");
      setNewText({ title: "", content: "", displayOrder: 0, visible: true });
      refetchText();
    },
    onError: (error) => toast.error(`创建失败: ${error.message}`),
  });

  const updateTextMutation = trpc.textBlocks.update.useMutation({
    onSuccess: () => {
      toast.success("更新成功");
      setEditingText(null);
      refetchText();
    },
    onError: (error) => toast.error(`更新失败: ${error.message}`),
  });

  const deleteTextMutation = trpc.textBlocks.delete.useMutation({
    onSuccess: () => {
      toast.success("删除成功");
      refetchText();
    },
    onError: (error) => toast.error(`删除失败: ${error.message}`),
  });

  const createImageMutation = trpc.imageBlocks.create.useMutation({
    onSuccess: () => {
      toast.success("创建成功");
      setNewImage({ title: "", imageUrl: "", description: "", displayOrder: 0, visible: true });
      refetchImage();
    },
    onError: (error) => toast.error(`创建失败: ${error.message}`),
  });

  const updateImageMutation = trpc.imageBlocks.update.useMutation({
    onSuccess: () => {
      toast.success("更新成功");
      setEditingImage(null);
      refetchImage();
    },
    onError: (error) => toast.error(`更新失败: ${error.message}`),
  });

  const deleteImageMutation = trpc.imageBlocks.delete.useMutation({
    onSuccess: () => {
      toast.success("删除成功");
      refetchImage();
    },
    onError: (error) => toast.error(`删除失败: ${error.message}`),
  });

  const toggleTextVisibility = (id: number, visible: boolean) => {
    updateTextMutation.mutate({ id, visible: !visible });
  };

  const toggleImageVisibility = (id: number, visible: boolean) => {
    updateImageMutation.mutate({ id, visible: !visible });
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  const locationNames = {
    home: "首页",
    shensuan: "神算子",
    guanjiapo: "管家婆",
    huangdaxian: "黄大仙",
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">资料管理</h1>
          <p className="text-muted-foreground mt-2">管理文字和图片资料板块</p>
        </div>

        {/* 位置选择 */}
        <Card className="card-elegant">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Label className="whitespace-nowrap">页面位置:</Label>
              <Select
                value={selectedLocation}
                onValueChange={(value: any) => setSelectedLocation(value)}
              >
                <SelectTrigger className="max-w-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(locationNames).map(([key, name]) => (
                    <SelectItem key={key} value={key}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* 标签页 */}
        <Tabs defaultValue="text">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="text">文字资料</TabsTrigger>
            <TabsTrigger value="image">图片资料</TabsTrigger>
          </TabsList>

          {/* 文字资料 */}
          <TabsContent value="text" className="space-y-4">
            {/* 新建按钮 */}
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  新建文字资料
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>新建文字资料</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>标题</Label>
                    <Input
                      value={newText.title}
                      onChange={(e) => setNewText({ ...newText, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>内容</Label>
                    <RichTextEditor
                      value={newText.content}
                      onChange={(content) => setNewText({ ...newText, content })}
                      placeholder="输入内容，支持文字颜色、加粗、斜体等格式..."
                      onImageUpload={async (file: File) => {
                        const reader = new FileReader();
                        return new Promise((resolve, reject) => {
                          reader.onload = async (e) => {
                            try {
                              const base64 = (e.target?.result as string).split(',')[1];
                              const result = await trpc.upload.image.useMutation().mutateAsync({
                                filename: file.name,
                                base64,
                              });
                              resolve(result.url);
                            } catch (error) {
                              reject(error);
                            }
                          };
                          reader.readAsDataURL(file);
                        });
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>显示顺序</Label>
                    <Input
                      type="number"
                      value={newText.displayOrder}
                      onChange={(e) => setNewText({ ...newText, displayOrder: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={newText.visible}
                      onCheckedChange={(checked) => setNewText({ ...newText, visible: checked })}
                    />
                    <Label>立即显示</Label>
                  </div>
                  <Button
                    onClick={() => createTextMutation.mutate({ ...newText, location: selectedLocation })}
                    disabled={createTextMutation.isPending}
                    className="w-full"
                  >
                    {createTextMutation.isPending ? "创建中..." : "创建"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* 列表 */}
            <div className="space-y-4">
              {textBlocks?.map((block) => (
                <Card key={block.id} className="card-elegant">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{block.title}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleTextVisibility(block.id, block.visible)}
                        >
                          {block.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingText(block)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (confirm("确定删除？")) {
                              deleteTextMutation.mutate({ id: block.id });
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <RichTextDisplay content={block.content} />
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* 图片资料 */}
          <TabsContent value="image" className="space-y-4">
            {/* 新建按钮 */}
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  新建图片资料
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>新建图片资料</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>标题</Label>
                    <Input
                      value={newImage.title}
                      onChange={(e) => setNewImage({ ...newImage, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>图片URL</Label>
                    <div className="flex gap-2">
                      <Input
                        value={newImage.imageUrl}
                        onChange={(e) => setNewImage({ ...newImage, imageUrl: e.target.value })}
                        placeholder="https://..."
                      />
                      <AIImageGeneratorDialog
                        title={newImage.title}
                        content={newImage.description}
                        onImageGenerated={(url) => setNewImage({ ...newImage, imageUrl: url })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>描述</Label>
                    <Textarea
                      value={newImage.description}
                      onChange={(e) => setNewImage({ ...newImage, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>显示顺序</Label>
                    <Input
                      type="number"
                      value={newImage.displayOrder}
                      onChange={(e) => setNewImage({ ...newImage, displayOrder: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={newImage.visible}
                      onCheckedChange={(checked) => setNewImage({ ...newImage, visible: checked })}
                    />
                    <Label>立即显示</Label>
                  </div>
                  <Button
                    onClick={() => createImageMutation.mutate({ ...newImage, location: selectedLocation })}
                    disabled={createImageMutation.isPending}
                    className="w-full"
                  >
                    {createImageMutation.isPending ? "创建中..." : "创建"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* 列表 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {imageBlocks?.map((block) => (
                <Card key={block.id} className="card-elegant">
                  <div className="aspect-video relative overflow-hidden">
                    <img src={block.imageUrl} alt={block.title} className="w-full h-full object-cover" />
                  </div>
                  <CardContent className="p-4 space-y-2">
                    <h3 className="font-semibold">{block.title}</h3>
                    {block.description && (
                      <p className="text-sm text-muted-foreground">{block.description}</p>
                    )}
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleImageVisibility(block.id, block.visible)}
                      >
                        {block.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm("确定删除？")) {
                            deleteImageMutation.mutate({ id: block.id });
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
