import { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Palette,
  Image as ImageIcon,
  Undo2,
  Redo2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link2,
  Code,
  Quote,
  Heading1,
  Heading2,
  Heading3,
} from 'lucide-react';
import { toast } from 'sonner';

interface ContentEditableEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  onImageUpload?: (file: File) => Promise<string>;
}

export function ContentEditableEditor({
  value,
  onChange,
  placeholder = '输入内容...',
  readOnly = false,
  onImageUpload,
}: ContentEditableEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const historyRef = useRef<string[]>([value]);
  const historyIndexRef = useRef(0);

  // 初始化编辑器内容
  useEffect(() => {
    if (editorRef.current && !isInitialized) {
      editorRef.current.innerHTML = value;
      setIsInitialized(true);
    }
  }, []);

  // 保存历史记录
  const saveHistory = useCallback(() => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      // 移除超过当前位置的历史记录
      historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
      historyRef.current.push(html);
      historyIndexRef.current = historyRef.current.length - 1;
    }
  }, []);

  // 处理内容变化
  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
      saveHistory();
    }
  }, [onChange, saveHistory]);

  // 执行命令
  const executeCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  // 撤销
  const handleUndo = () => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current--;
      if (editorRef.current) {
        editorRef.current.innerHTML = historyRef.current[historyIndexRef.current];
        onChange(editorRef.current.innerHTML);
      }
    }
  };

  // 重做
  const handleRedo = () => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current++;
      if (editorRef.current) {
        editorRef.current.innerHTML = historyRef.current[historyIndexRef.current];
        onChange(editorRef.current.innerHTML);
      }
    }
  };

  // 处理图片上传
  const handleImageUpload = async () => {
    if (!onImageUpload) {
      toast.error('图片上传功能未配置');
      return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.size > 5 * 1024 * 1024) {
        toast.error('图片大小不能超过5MB');
        return;
      }

      try {
        toast.loading('上传中...');
        const url = await onImageUpload(file);
        executeCommand('insertImage', url);
        toast.success('图片上传成功');
      } catch (error) {
        console.error('Image upload failed:', error);
        toast.error('图片上传失败');
      }
    };
    input.click();
  };

  // 插入链接
  const handleInsertLink = () => {
    const url = prompt('请输入链接地址:');
    if (url) {
      executeCommand('createLink', url);
    }
  };

  // 检查命令状态
  const isCommandActive = (command: string, value?: string) => {
    try {
      return document.queryCommandState(command);
    } catch {
      return false;
    }
  };

  const colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500',
    '#800080', '#FFC0CB', '#A52A2A', '#808080',
  ];

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-gray-100 border-b p-2 flex flex-wrap gap-1">
        {/* 文本格式 */}
        <Button
          size="sm"
          variant={isCommandActive('bold') ? 'default' : 'outline'}
          onClick={() => executeCommand('bold')}
          className="w-8 h-8 p-0"
          title="粗体"
        >
          <Bold size={16} />
        </Button>

        <Button
          size="sm"
          variant={isCommandActive('italic') ? 'default' : 'outline'}
          onClick={() => executeCommand('italic')}
          className="w-8 h-8 p-0"
          title="斜体"
        >
          <Italic size={16} />
        </Button>

        <Button
          size="sm"
          variant={isCommandActive('underline') ? 'default' : 'outline'}
          onClick={() => executeCommand('underline')}
          className="w-8 h-8 p-0"
          title="下划线"
        >
          <Underline size={16} />
        </Button>

        <Button
          size="sm"
          variant={isCommandActive('strikethrough') ? 'default' : 'outline'}
          onClick={() => executeCommand('strikethrough')}
          className="w-8 h-8 p-0"
          title="删除线"
        >
          <Strikethrough size={16} />
        </Button>

        <div className="w-px bg-gray-300 mx-1" />

        {/* 标题 */}
        <Button
          size="sm"
          variant="outline"
          onClick={() => executeCommand('formatBlock', 'h1')}
          className="w-8 h-8 p-0"
          title="标题1"
        >
          <Heading1 size={16} />
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={() => executeCommand('formatBlock', 'h2')}
          className="w-8 h-8 p-0"
          title="标题2"
        >
          <Heading2 size={16} />
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={() => executeCommand('formatBlock', 'h3')}
          className="w-8 h-8 p-0"
          title="标题3"
        >
          <Heading3 size={16} />
        </Button>

        <div className="w-px bg-gray-300 mx-1" />

        {/* 列表 */}
        <Button
          size="sm"
          variant={isCommandActive('insertUnorderedList') ? 'default' : 'outline'}
          onClick={() => executeCommand('insertUnorderedList')}
          className="w-8 h-8 p-0"
          title="无序列表"
        >
          <List size={16} />
        </Button>

        <Button
          size="sm"
          variant={isCommandActive('insertOrderedList') ? 'default' : 'outline'}
          onClick={() => executeCommand('insertOrderedList')}
          className="w-8 h-8 p-0"
          title="有序列表"
        >
          <ListOrdered size={16} />
        </Button>

        <div className="w-px bg-gray-300 mx-1" />

        {/* 引用和代码 */}
        <Button
          size="sm"
          variant="outline"
          onClick={() => executeCommand('formatBlock', 'blockquote')}
          className="w-8 h-8 p-0"
          title="引用"
        >
          <Quote size={16} />
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={() => executeCommand('formatBlock', 'pre')}
          className="w-8 h-8 p-0"
          title="代码块"
        >
          <Code size={16} />
        </Button>

        <div className="w-px bg-gray-300 mx-1" />

        {/* 对齐 */}
        <Button
          size="sm"
          variant="outline"
          onClick={() => executeCommand('justifyLeft')}
          className="w-8 h-8 p-0"
          title="靠左"
        >
          <AlignLeft size={16} />
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={() => executeCommand('justifyCenter')}
          className="w-8 h-8 p-0"
          title="居中"
        >
          <AlignCenter size={16} />
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={() => executeCommand('justifyRight')}
          className="w-8 h-8 p-0"
          title="靠右"
        >
          <AlignRight size={16} />
        </Button>

        <div className="w-px bg-gray-300 mx-1" />

        {/* 颜色 */}
        <div className="flex gap-1">
          {colors.map((color) => (
            <button
              key={color}
              onClick={() => executeCommand('foreColor', color)}
              className="w-6 h-6 rounded border-2 border-gray-300 hover:border-gray-500"
              style={{ backgroundColor: color }}
              title={`颜色: ${color}`}
            />
          ))}
        </div>

        <div className="w-px bg-gray-300 mx-1" />

        {/* 媒体和链接 */}
        <Button
          size="sm"
          variant="outline"
          onClick={handleInsertLink}
          className="w-8 h-8 p-0"
          title="插入链接"
        >
          <Link2 size={16} />
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={handleImageUpload}
          className="w-8 h-8 p-0"
          title="插入图片"
        >
          <ImageIcon size={16} />
        </Button>

        <div className="w-px bg-gray-300 mx-1" />

        {/* 撤销重做 */}
        <Button
          size="sm"
          variant="outline"
          onClick={handleUndo}
          className="w-8 h-8 p-0"
          title="撤销"
        >
          <Undo2 size={16} />
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={handleRedo}
          className="w-8 h-8 p-0"
          title="重做"
        >
          <Redo2 size={16} />
        </Button>
      </div>

      <div
        ref={editorRef}
        contentEditable={!readOnly}
        suppressContentEditableWarning
        onInput={handleInput}
        className="prose prose-sm max-w-none p-3 min-h-[200px] focus:outline-none bg-white"
        style={{
          wordWrap: 'break-word',
          overflowWrap: 'break-word',
          whiteSpace: 'pre-wrap',
        }}
      />
    </div>
  );
}
