import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { LotteryBall } from "@/components/LotteryBall";

export default function AdminQuickDraw() {
  const { user } = useAuth();
  const [lotteryTypeId, setLotteryTypeId] = useState<number | null>(null);
  const [issueNumber, setIssueNumber] = useState<string>("");
  const [drawTime, setDrawTime] = useState<string>("");
  const [numbers, setNumbers] = useState<string[]>(Array(7).fill(""));
  const [attributes, setAttributes] = useState<Array<{ zodiac?: string; color?: string }>>([]);

  const { data: lotteryTypes } = trpc.lotteryTypes.list.useQuery({ enabledOnly: true });

  const createDrawMutation = trpc.lotteryDraws.quickCreate.useMutation({
    onSuccess: (data) => {
      toast.success(`开奖录入成功！期号: ${data.issueNumber}`);
      setIssueNumber("");
      setDrawTime("");
      setNumbers(Array(7).fill(""));
      setAttributes([]);
    },
    onError: (error) => {
      toast.error(`录入失败: ${error.message}`);
    },
  });

  const utils = trpc.useUtils();

  const handleNumberChange = async (index: number, value: string) => {
    const newNumbers = [...numbers];
    newNumbers[index] = value;
    setNumbers(newNumbers);

    // 自动识别号码属性
    const num = parseInt(value);
    if (num >= 1 && num <= 49) {
      try {
        const attr = await utils.client.numberAttributes.getByNumber.query({ number: num });
        const newAttributes = [...attributes];
        newAttributes[index] = attr || {};
        setAttributes(newAttributes);
      } catch (error) {
        console.error("Failed to fetch number attribute:", error);
      }
    }
  };

  const handleSubmit = () => {
    if (!lotteryTypeId) {
      toast.error("请选择彩票类型");
      return;
    }

    if (!issueNumber.trim()) {
      toast.error("请输入期号");
      return;
    }

    if (!drawTime.trim()) {
      toast.error("请输入开奖时间");
      return;
    }

    const nums = numbers.map(n => parseInt(n)).filter(n => !isNaN(n) && n >= 1 && n <= 49);
    if (nums.length !== 7) {
      toast.error("请输入7个有效号码(1-49)");
      return;
    }

    createDrawMutation.mutate({
      lotteryTypeId,
      issueNumber,
      drawTime: new Date(drawTime).toISOString(),
      numbers: nums,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">快捷开奖</h1>
          <p className="text-muted-foreground mt-2">快速录入新一期开奖结果</p>
        </div>

        <Card className="card-elegant">
          <CardHeader>
            <CardTitle>开奖信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 彩票类型选择 */}
            <div className="space-y-2">
              <Label>彩票类型</Label>
              <Select
                value={lotteryTypeId?.toString() || ""}
                onValueChange={(value) => setLotteryTypeId(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="请选择彩票类型" />
                </SelectTrigger>
                <SelectContent>
                  {lotteryTypes?.filter(t => t.isCustom).map((type) => (
                    <SelectItem key={type.id} value={type.id.toString()}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 期号和开奖时间手动输入 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>期号</Label>
                <Input
                  type="text"
                  value={issueNumber}
                  onChange={(e) => setIssueNumber(e.target.value)}
                  placeholder="例如: 001"
                />
              </div>
              <div className="space-y-2">
                <Label>开奖时间</Label>
                <Input
                  type="datetime-local"
                  value={drawTime}
                  onChange={(e) => setDrawTime(e.target.value)}
                />
              </div>
            </div>

            {/* 号码输入 */}
            <div className="space-y-4">
              <Label>开奖号码</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {numbers.slice(0, 6).map((num, index) => (
                  <div key={index} className="space-y-2">
                    <Label className="text-sm">号码 {index + 1}</Label>
                    <Input
                      type="number"
                      min="1"
                      max="49"
                      value={num}
                      onChange={(e) => handleNumberChange(index, e.target.value)}
                      placeholder="1-49"
                    />
                    {attributes[index] && (
                      <div className="flex items-center gap-2">
                        <LotteryBall
                          number={parseInt(num)}
                          color={attributes[index].color as any}
                          className="w-8 h-8 text-xs"
                        />
                        <span className="text-xs text-muted-foreground">
                          {attributes[index].zodiac}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Label className="text-sm">特码</Label>
                <div className="flex items-start gap-4">
                  <Input
                    type="number"
                    min="1"
                    max="49"
                    value={numbers[6]}
                    onChange={(e) => handleNumberChange(6, e.target.value)}
                    placeholder="1-49"
                    className="max-w-xs"
                  />
                  {attributes[6] && (
                    <div className="flex items-center gap-2">
                      <LotteryBall
                        number={parseInt(numbers[6])}
                        color={attributes[6].color as any}
                        className="w-10 h-10"
                      />
                      <span className="text-sm text-muted-foreground">
                        {attributes[6].zodiac}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 提交按钮 */}
            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIssueNumber("");
                  setDrawTime("");
                  setNumbers(Array(7).fill(""));
                  setAttributes([]);
                }}
              >
                重置
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createDrawMutation.isPending}
              >
                {createDrawMutation.isPending ? "提交中..." : "确定提交"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 说明 */}
        <Card className="card-elegant">
          <CardHeader>
            <CardTitle>使用说明</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• 期号和开奖时间需要手动输入</p>
            <p>• 输入号码后会自动识别波色和生肖属性</p>
            <p>• 提交后开奖记录会立即生效,前端会自动同步显示</p>
            <p>• 如需修改,请前往"开奖历史"页面进行编辑</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
