import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { LotteryBall } from "@/components/LotteryBall";
import { Edit, Trash2 } from "lucide-react";

export default function AdminDrawHistory() {
  const { user } = useAuth();
  const [selectedLotteryId, setSelectedLotteryId] = useState<number | null>(null);
  const [editingDraw, setEditingDraw] = useState<any>(null);
  const [editNumbers, setEditNumbers] = useState<string[]>(Array(7).fill(""));

  const { data: lotteryTypes } = trpc.lotteryTypes.list.useQuery({ enabledOnly: true });
  const { data: draws, refetch } = trpc.lotteryDraws.list.useQuery(
    { lotteryTypeId: selectedLotteryId || undefined, limit: 100 },
    { enabled: !!selectedLotteryId }
  );

  const updateDrawMutation = trpc.lotteryDraws.update.useMutation({
    onSuccess: () => {
      toast.success("更新成功");
      setEditingDraw(null);
      refetch();
    },
    onError: (error) => {
      toast.error(`更新失败: ${error.message}`);
    },
  });

  const deleteDrawMutation = trpc.lotteryDraws.delete.useMutation({
    onSuccess: () => {
      toast.success("删除成功");
      refetch();
    },
    onError: (error) => {
      toast.error(`删除失败: ${error.message}`);
    },
  });

  const handleEdit = (draw: any) => {
    setEditingDraw(draw);
    setEditNumbers([
      draw.number1?.toString() || "",
      draw.number2?.toString() || "",
      draw.number3?.toString() || "",
      draw.number4?.toString() || "",
      draw.number5?.toString() || "",
      draw.number6?.toString() || "",
      draw.specialNumber?.toString() || "",
    ]);
  };

  const handleUpdate = () => {
    if (!editingDraw) return;

    const nums = editNumbers.map(n => parseInt(n)).filter(n => !isNaN(n) && n >= 1 && n <= 49);
    if (nums.length !== 7) {
      toast.error("请输入7个有效号码(1-49)");
      return;
    }

    updateDrawMutation.mutate({
      id: editingDraw.id,
      numbers: nums,
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("确定要删除这条开奖记录吗？")) {
      deleteDrawMutation.mutate({ id });
    }
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">开奖历史管理</h1>
          <p className="text-muted-foreground mt-2">查看和编辑历史开奖记录</p>
        </div>

        {/* 彩票类型选择 */}
        <Card className="card-elegant">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Label className="whitespace-nowrap">彩票类型:</Label>
              <Select
                value={selectedLotteryId?.toString() || ""}
                onValueChange={(value) => setSelectedLotteryId(Number(value))}
              >
                <SelectTrigger className="max-w-xs">
                  <SelectValue placeholder="请选择彩票类型" />
                </SelectTrigger>
                <SelectContent>
                  {lotteryTypes?.map((type) => (
                    <SelectItem key={type.id} value={type.id.toString()}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* 开奖记录列表 */}
        {selectedLotteryId && draws && draws.length > 0 && (
          <div className="space-y-4">
            {draws.map((draw) => (
              <Card key={draw.id} className="card-elegant">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">第 {draw.issueNumber} 期</CardTitle>
                      <div className="text-sm text-muted-foreground">
                        {new Date(draw.drawTime).toLocaleString('zh-CN')}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        draw.status === "completed" 
                          ? "bg-green-100 text-green-800" 
                          : draw.status === "drawing"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {draw.status === "completed" ? "已开奖" : draw.status === "drawing" ? "开奖中" : "未开奖"}
                      </span>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(draw)}
                            disabled={draw.status === "completed"}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            编辑
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>编辑开奖记录</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              {editNumbers.slice(0, 6).map((num, index) => (
                                <div key={index} className="space-y-2">
                                  <Label>号码 {index + 1}</Label>
                                  <Input
                                    type="number"
                                    min="1"
                                    max="49"
                                    value={num}
                                    onChange={(e) => {
                                      const newNumbers = [...editNumbers];
                                      newNumbers[index] = e.target.value;
                                      setEditNumbers(newNumbers);
                                    }}
                                  />
                                </div>
                              ))}
                            </div>
                            <div className="space-y-2">
                              <Label>特码</Label>
                              <Input
                                type="number"
                                min="1"
                                max="49"
                                value={editNumbers[6]}
                                onChange={(e) => {
                                  const newNumbers = [...editNumbers];
                                  newNumbers[6] = e.target.value;
                                  setEditNumbers(newNumbers);
                                }}
                              />
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" onClick={() => setEditingDraw(null)}>
                                取消
                              </Button>
                              <Button onClick={handleUpdate} disabled={updateDrawMutation.isPending}>
                                {updateDrawMutation.isPending ? "保存中..." : "保存"}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(draw.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 flex-wrap">
                    {[
                      { num: draw.number1, color: draw.number1Color },
                      { num: draw.number2, color: draw.number2Color },
                      { num: draw.number3, color: draw.number3Color },
                      { num: draw.number4, color: draw.number4Color },
                      { num: draw.number5, color: draw.number5Color },
                      { num: draw.number6, color: draw.number6Color },
                    ].map((ball, index) => (
                      <LotteryBall
                        key={index}
                        number={ball.num || undefined}
                        color={ball.color || "gray"}
                      />
                    ))}
                    <div className="text-2xl text-primary font-bold mx-2">+</div>
                    <LotteryBall
                      number={draw.specialNumber || undefined}
                      color={draw.specialNumberColor || "gray"}
                      className="w-14 h-14 text-lg ring-4 ring-primary/30"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {selectedLotteryId && (!draws || draws.length === 0) && (
          <Card className="card-elegant">
            <CardContent className="py-12 text-center text-muted-foreground">
              暂无开奖记录
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
