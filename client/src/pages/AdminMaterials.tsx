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
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Edit, Trash2, Plus, Eye, EyeOff, ChevronUp, ChevronDown } from "lucide-react";
import { AIImageGeneratorDialog } from "@/components/AIImageGeneratorDialog";
import { SortableTextList, SortableImageList } from "@/components/SortableMaterialsList";

export default function AdminMaterials() {
  const { user } = useAuth();
  const [selectedLocation, setSelectedLocation] = useState<"home" | "shensuan" | "guanjiapo" | "huangdaxian">("home");
  const [editingText, setEditingText] = useState<any>(null);
  const [editingImage, setEditingImage] = useState<any>(null);
  const [newText, setNewText] = useState({ title: "", content: "", displayOrder: 0, visible: true });
  const [newImage, setNewImage] = useState({ title: "", imageUrl: "", description: "", displayOrder: 0, visible: true });
  
  // 批量操作状态
  const [selectedTextIds, setSelectedTextIds] = useState<Set<number>>(new Set());
  const [selectedImageIds, setSelectedImageIds] = useState<Set<number>>(new Set());
  const [bulkDisplayOrder, setBulkDisplayOrder] = useState<number>(0);

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

  // 批量操作函数
  const handleBulkDeleteText = () => {
    if (selectedTextIds.size === 0) {
      toast.error("请先选择要删除的资料");
      return;
    }
    
    if (confirm(`确定删除选中的 ${selectedTextIds.size} 条资料吗？`)) {
      selectedTextIds.forEach(id => {
        deleteTextMutation.mutate({ id });
      });
      setSelectedTextIds(new Set());
    }
  };

  const handleBulkDeleteImage = () => {
    if (selectedImageIds.size === 0) {
      toast.error("请先选择要删除的资料");
      return;
    }
    
    if (confirm(`确定删除选中的 ${selectedImageIds.size} 条资料吗？`)) {
      selectedImageIds.forEach(id => {
        deleteImageMutation.mutate({ id });
      });
      setSelectedImageIds(new Set());
    }
  };

  const handleBulkUpdateDisplayOrder = (type: 'text' | 'image') => {
    const selectedIds = type === 'text' ? selectedTextIds : selectedImageIds;
    
    if (selectedIds.size === 0) {
      toast.error("请先选择要调整的资料");
      return;
    }

    const mutation = type === 'text' ? updateTextMutation : updateImageMutation;
    selectedIds.forEach(id => {
      mutation.mutate({ id, displayOrder: bulkDisplayOrder });
    });
    
    toast.success(`已调整 ${selectedIds.size} 条资料的显示顺序`);
    if (type === 'text') {
      setSelectedTextIds(new Set());
    } else {
      setSelectedImageIds(new Set());
    }
    setBulkDisplayOrder(0);
  };

  const toggleTextSelection = (id: number) => {
    const newSet = new Set(selectedTextIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedTextIds(newSet);
  };

  const toggleImageSelection = (id: number) => {
    const newSet = new Set(selectedImageIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedImageIds(newSet);
  };

  const selectAllText = () => {
    if (selectedTextIds.size === textBlocks?.length) {
      setSelectedTextIds(new Set());
    } else {
      setSelectedTextIds(new Set(textBlocks?.map(b => b.id) || []));
    }
  };

  const selectAllImage = () => {
    if (selectedImageIds.size === imageBlocks?.length) {
      setSelectedImageIds(new Set());
    } else {
      setSelectedImageIds(new Set(imageBlocks?.map(b => b.id) || []));
    }
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
                    <Textarea
                      value={newText.content}
                      onChange={(e) => setNewText({ ...newText, content: e.target.value })}
                      rows={6}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>显示顺序</Label>
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      value={newText.displayOrder || 0}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '') {
                          setNewText({ ...newText, displayOrder: 0 });
                        } else {
                          const num = parseInt(value);
                          if (!isNaN(num) && num >= 0) {
                            setNewText({ ...newText, displayOrder: num });
                          }
                        }
                      }}
                    />
                    <p className="text-xs text-muted-foreground mt-1">请输入正整数（最小值：0）</p>
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

            {/* 批量操作工具栏 */}
            {selectedTextIds.size > 0 && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="text-sm text-muted-foreground">
                      已选择 {selectedTextIds.size} 条资料
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        placeholder="新显示顺序"
                        value={bulkDisplayOrder}
                        onChange={(e) => setBulkDisplayOrder(e.target.value ? parseInt(e.target.value) : 0)}
                        className="w-32"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleBulkUpdateDisplayOrder('text')}
                      >
                        <ChevronUp className="w-4 h-4 mr-1" />
                        调整顺序
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={handleBulkDeleteText}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        批量删除
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 列表 */}
            {textBlocks && textBlocks.length > 0 ? (
              <SortableTextList
                items={textBlocks}
                selectedIds={selectedTextIds}
                onToggleSelect={toggleTextSelection}
                onToggleVisibility={toggleTextVisibility}
                onEdit={setEditingText}
                onDelete={(id) => {
                  if (confirm("确定删除？")) {
                    deleteTextMutation.mutate({ id });
                  }
                }}
                onReorder={(items) => {
                  items.forEach(item => {
                    updateTextMutation.mutate({ id: item.id, displayOrder: item.displayOrder });
                  });
                }}
              />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                暂无文字资料
              </div>
            )}
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
                      min="0"
                      step="1"
                      value={newImage.displayOrder || 0}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '') {
                          setNewImage({ ...newImage, displayOrder: 0 });
                        } else {
                          const num = parseInt(value);
                          if (!isNaN(num) && num >= 0) {
                            setNewImage({ ...newImage, displayOrder: num });
                          }
                        }
                      }}
                    />
                    <p className="text-xs text-muted-foreground mt-1">请输入正整数（最小值：0）</p>
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

            {/* 批量操作工具栏 */}
            {selectedImageIds.size > 0 && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="text-sm text-muted-foreground">
                      已选择 {selectedImageIds.size} 条资料
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        placeholder="新显示顺序"
                        value={bulkDisplayOrder}
                        onChange={(e) => setBulkDisplayOrder(e.target.value ? parseInt(e.target.value) : 0)}
                        className="w-32"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleBulkUpdateDisplayOrder('image')}
                      >
                        <ChevronUp className="w-4 h-4 mr-1" />
                        调整顺序
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={handleBulkDeleteImage}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        批量删除
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 列表 */}
            {imageBlocks && imageBlocks.length > 0 ? (
              <SortableImageList
                items={imageBlocks}
                selectedIds={selectedImageIds}
                onToggleSelect={toggleImageSelection}
                onToggleVisibility={toggleImageVisibility}
                onDelete={(id) => {
                  if (confirm("确定删除？")) {
                    deleteImageMutation.mutate({ id });
                  }
                }}
                onReorder={(items) => {
                  items.forEach(item => {
                    updateImageMutation.mutate({ id: item.id, displayOrder: item.displayOrder });
                  });
                }}
              />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                暂无图片资料
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* 编辑文字资料对话框 */}
        {editingText && (
          <Dialog open={!!editingText} onOpenChange={(open) => !open && setEditingText(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>编辑文字资料</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>标题</Label>
                  <Input
                    value={editingText.title}
                    onChange={(e) => setEditingText({ ...editingText, title: e.target.value })}
                    placeholder="输入标题"
                  />
                </div>
                <div>
                  <Label>内容</Label>
                  <Textarea
                    value={editingText.content}
                    onChange={(e) => setEditingText({ ...editingText, content: e.target.value })}
                    placeholder="输入内容"
                    rows={5}
                  />
                </div>
                <div>
                  <Label>显示顺序</Label>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    value={editingText.displayOrder}
                    onChange={(e) => {
                      const num = parseInt(e.target.value);
                      if (!isNaN(num) && num >= 0) {
                        setEditingText({ ...editingText, displayOrder: num });
                      }
                    }}
                  />
                  <p className="text-xs text-muted-foreground mt-1">请输入正整数（最小值：0）</p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={editingText.visible}
                    onCheckedChange={(checked) => setEditingText({ ...editingText, visible: checked })}
                  />
                  <Label>立即显示</Label>
                </div>
                <Button
                  onClick={() => updateTextMutation.mutate(editingText)}
                  disabled={updateTextMutation.isPending}
                  className="w-full"
                >
                  {updateTextMutation.isPending ? "保存中..." : "保存"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* 编辑图片资料对话框 */}
        {editingImage && (
          <Dialog open={!!editingImage} onOpenChange={(open) => !open && setEditingImage(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>编辑图片资料</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>标题</Label>
                  <Input
                    value={editingImage.title}
                    onChange={(e) => setEditingImage({ ...editingImage, title: e.target.value })}
                    placeholder="输入标题"
                  />
                </div>
                <div>
                  <Label>图片URL</Label>
                  <Input
                    value={editingImage.imageUrl}
                    onChange={(e) => setEditingImage({ ...editingImage, imageUrl: e.target.value })}
                    placeholder="输入图片URL"
                  />
                </div>
                <div>
                  <Label>描述</Label>
                  <Textarea
                    value={editingImage.description || ""}
                    onChange={(e) => setEditingImage({ ...editingImage, description: e.target.value })}
                    placeholder="输入描述"
                    rows={3}
                  />
                </div>
                <div>
                  <Label>显示顺序</Label>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    value={editingImage.displayOrder}
                    onChange={(e) => {
                      const num = parseInt(e.target.value);
                      if (!isNaN(num) && num >= 0) {
                        setEditingImage({ ...editingImage, displayOrder: num });
                      }
                    }}
                  />
                  <p className="text-xs text-muted-foreground mt-1">请输入正整数（最小值：0）</p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={editingImage.visible}
                    onCheckedChange={(checked) => setEditingImage({ ...editingImage, visible: checked })}
                  />
                  <Label>立即显示</Label>
                </div>
                <Button
                  onClick={() => updateImageMutation.mutate(editingImage)}
                  disabled={updateImageMutation.isPending}
                  className="w-full"
                >
                  {updateImageMutation.isPending ? "保存中..." : "保存"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DashboardLayout>
  );
}
