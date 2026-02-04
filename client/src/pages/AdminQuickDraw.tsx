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
  const [drawStatus, setDrawStatus] = useState<"未开" | "开奖中" | "已开">("未开");
  const [autoDrawEnabled, setAutoDrawEnabled] = useState<boolean>(false);
  const [numbers, setNumbers] = useState<string[]>(Array(7).fill(""));
  const [attributes, setAttributes] = useState<Array<{ zodiac?: string; color?: string }>>([]);
  const [nextDrawTime, setNextDrawTime] = useState<string>("");
  const [nextDrawWeek, setNextDrawWeek] = useState<string>("星期四");
  const [year, setYear] = useState<string>(new Date().getFullYear().toString());
  const [duplicateNumbers, setDuplicateNumbers] = useState<Set<number>>(new Set());

  // 检查号码是否重复
  const checkDuplicateNumbers = (nums: string[]) => {
    const validNumbers = nums
      .map(n => parseInt(n))
      .filter(n => !isNaN(n) && n >= 1 && n <= 49);
    
    const seen = new Set<number>();
    const duplicates = new Set<number>();
    
    validNumbers.forEach(num => {
      if (seen.has(num)) {
        duplicates.add(num);
      }
      seen.add(num);
    });
    
    setDuplicateNumbers(duplicates);
    return duplicates.size === 0;
  };

  const { data: lotteryTypes } = trpc.lotteryTypes.list.useQuery({ enabledOnly: true });

  const createDrawMutation = trpc.lotteryDraws.quickCreate.useMutation({
    onSuccess: (data) => {
      toast.success(`开奖录入成功！期号: ${data.issueNumber}`);
      setIssueNumber("");
      setDrawTime("");
      setDrawStatus("未开");
      setAutoDrawEnabled(false);
      setNumbers(Array(7).fill(""));
      setAttributes([]);
      setNextDrawTime("");
      setNextDrawWeek("星期四");
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
    
    // 检查是否有重复号码
    checkDuplicateNumbers(newNumbers);

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

    // 检查是否有重复号码
    if (!checkDuplicateNumbers(numbers)) {
      const duplicateList = Array.from(duplicateNumbers).join(", ");
      toast.error(`号码重复: ${duplicateList}，请修改后重试`);
      return;
    }

    createDrawMutation.mutate({
      lotteryTypeId,
      issueNumber,
      drawTime: new Date(drawTime).toISOString(),
      numbers: nums,
    });
  };

  const handleReset = () => {
    setIssueNumber("");
    setDrawTime("");
    setDrawStatus("未开");
    setAutoDrawEnabled(false);
    setNumbers(Array(7).fill(""));
    setAttributes([]);
    setNextDrawTime("");
    setNextDrawWeek("星期四");
    setYear(new Date().getFullYear().toString());
    setDuplicateNumbers(new Set());
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">手动开奖</h1>
          <p className="text-muted-foreground mt-2">快速录入新一期开奖结果</p>
        </div>

        <Card className="card-elegant">
          <CardHeader className="bg-blue-600 text-white rounded-t-lg">
            <CardTitle className="text-white">开奖信息</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {/* 表单式布局 */}
            <div className="space-y-4">
              {/* 彩票类型选择 */}
              <div className="grid grid-cols-3 gap-4 items-center border-b pb-4">
                <Label className="font-semibold">彩票类型</Label>
                <div className="col-span-2">
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
              </div>

              {/* 期号 */}
              <div className="grid grid-cols-3 gap-4 items-center border-b pb-4">
                <Label className="font-semibold">期号</Label>
                <div className="col-span-2">
                  <Input
                    type="text"
                    value={issueNumber}
                    onChange={(e) => setIssueNumber(e.target.value)}
                    placeholder="例如: 001"
                  />
                </div>
              </div>

              {/* 开奖时间 */}
              <div className="grid grid-cols-3 gap-4 items-center border-b pb-4">
                <Label className="font-semibold">开奖时间</Label>
                <div className="col-span-2">
                  <Input
                    type="datetime-local"
                    value={drawTime}
                    onChange={(e) => setDrawTime(e.target.value)}
                  />
                </div>
              </div>

              {/* 开奖状态 */}
              <div className="grid grid-cols-3 gap-4 items-center border-b pb-4">
                <Label className="font-semibold">开奖状态</Label>
                <div className="col-span-2 flex items-center gap-6">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="drawStatus"
                      value="未开"
                      checked={drawStatus === "未开"}
                      onChange={(e) => setDrawStatus(e.target.value as any)}
                      className="w-4 h-4"
                    />
                    <span>未开</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="drawStatus"
                      value="开奖中"
                      checked={drawStatus === "开奖中"}
                      onChange={(e) => setDrawStatus(e.target.value as any)}
                      className="w-4 h-4"
                    />
                    <span>开奖中</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="drawStatus"
                      value="已开"
                      checked={drawStatus === "已开"}
                      onChange={(e) => setDrawStatus(e.target.value as any)}
                      className="w-4 h-4"
                    />
                    <span>已开</span>
                  </label>
                </div>
              </div>

              {/* 自动开奖 */}
              <div className="grid grid-cols-3 gap-4 items-center border-b pb-4">
                <Label className="font-semibold">自动开奖</Label>
                <div className="col-span-2 flex items-center gap-6">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="autoDraw"
                      value="auto"
                      checked={autoDrawEnabled}
                      onChange={() => setAutoDrawEnabled(true)}
                      className="w-4 h-4"
                    />
                    <span>自动</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="autoDraw"
                      value="manual"
                      checked={!autoDrawEnabled}
                      onChange={() => setAutoDrawEnabled(false)}
                      className="w-4 h-4"
                    />
                    <span>手动</span>
                  </label>
                </div>
              </div>

              {/* 号码输入 */}
              <div className="border-b pb-4">
                <Label className="font-semibold block mb-4">号码输入</Label>
                <div className="space-y-3">
                  {[
                    { label: "号码1", index: 0 },
                    { label: "号码2", index: 1 },
                    { label: "号码3", index: 2 },
                    { label: "号码4", index: 3 },
                    { label: "号码5", index: 4 },
                    { label: "号码6", index: 5 },
                  ].map((item) => {
                    const num = parseInt(numbers[item.index]);
                    const isDuplicate = !isNaN(num) && duplicateNumbers.has(num);
                    return (
                      <div key={item.index} className="grid grid-cols-3 gap-4 items-center">
                        <Label className="text-sm">{item.label}</Label>
                        <div className="col-span-2">
                          <Input
                            type="number"
                            min="1"
                            max="49"
                            value={numbers[item.index]}
                            onChange={(e) => handleNumberChange(item.index, e.target.value)}
                            placeholder="1-49"
                            className={isDuplicate ? "border-red-500 border-2" : ""}
                          />
                          {isDuplicate && (
                            <p className="text-red-500 text-xs mt-1">⚠️ 号码重复</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 特码 */}
              <div className="grid grid-cols-3 gap-4 items-center border-b pb-4">
                <Label className="font-semibold">特码</Label>
                <div className="col-span-2">
                  {(() => {
                    const num = parseInt(numbers[6]);
                    const isDuplicate = !isNaN(num) && duplicateNumbers.has(num);
                    return (
                      <>
                        <Input
                          type="number"
                          min="1"
                          max="49"
                          value={numbers[6]}
                          onChange={(e) => handleNumberChange(6, e.target.value)}
                          placeholder="1-49"
                          className={isDuplicate ? "border-red-500 border-2" : ""}
                        />
                        {isDuplicate && (
                          <p className="text-red-500 text-xs mt-1">⚠️ 号码重复</p>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* 下期时间 */}
              <div className="grid grid-cols-3 gap-4 items-center border-b pb-4">
                <Label className="font-semibold">下期时间</Label>
                <div className="col-span-2">
                  <Input
                    type="datetime-local"
                    value={nextDrawTime}
                    onChange={(e) => setNextDrawTime(e.target.value)}
                  />
                </div>
              </div>

              {/* 下期星期 */}
              <div className="grid grid-cols-3 gap-4 items-center border-b pb-4">
                <Label className="font-semibold">下期星期</Label>
                <div className="col-span-2 bg-gray-100 p-2 rounded">
                  <span>{nextDrawWeek}</span>
                </div>
              </div>

              {/* 年份 */}
              <div className="grid grid-cols-3 gap-4 items-center">
                <Label className="font-semibold">年份</Label>
                <div className="col-span-2 bg-gray-100 p-2 rounded">
                  <span>{year}</span>
                </div>
              </div>
            </div>

            {/* 提交按钮 */}
            <div className="flex justify-end gap-4 mt-8">
              <Button
                variant="outline"
                onClick={handleReset}
              >
                重置
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createDrawMutation.isPending || duplicateNumbers.size > 0}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {createDrawMutation.isPending ? "提交中..." : "确定"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
