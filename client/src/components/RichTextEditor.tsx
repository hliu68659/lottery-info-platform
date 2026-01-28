import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Image from '@tiptap/extension-image';
import { Button } from '@/components/ui/button';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Palette,
  Image as ImageIcon,
  Undo2,
  Redo2,
} from 'lucide-react';
import { toast } from 'sonner';
import './RichTextEditor.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  onImageUpload?: (file: File) => Promise<string>;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = '输入内容...',
  readOnly = false,
  onImageUpload,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color.configure({
        types: ['textStyle'],
      }),
      Image.configure({
        allowBase64: true,
      }),
    ],
    content: value,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

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
        editor.chain().focus().setImage({ src: url }).run();
        toast.success('图片上传成功');
      } catch (error) {
        console.error('Image upload failed:', error);
        toast.error('图片上传失败');
      }
    };
    input.click();
  };

  const colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500',
    '#800080', '#FFC0CB', '#A52A2A', '#808080',
  ];

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-gray-100 border-b p-2 flex flex-wrap gap-1">
        <Button
          size="sm"
          variant={editor.isActive('bold') ? 'default' : 'outline'}
          onClick={() => editor.chain().focus().toggleBold().run()}
          className="w-8 h-8 p-0"
        >
          <Bold size={16} />
        </Button>

        <Button
          size="sm"
          variant={editor.isActive('italic') ? 'default' : 'outline'}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className="w-8 h-8 p-0"
        >
          <Italic size={16} />
        </Button>

        <div className="w-px bg-gray-300 mx-1" />

        <Button
          size="sm"
          variant={editor.isActive('bulletList') ? 'default' : 'outline'}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className="w-8 h-8 p-0"
        >
          <List size={16} />
        </Button>

        <Button
          size="sm"
          variant={editor.isActive('orderedList') ? 'default' : 'outline'}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className="w-8 h-8 p-0"
        >
          <ListOrdered size={16} />
        </Button>

        <div className="w-px bg-gray-300 mx-1" />

        <div className="flex gap-1">
          {colors.map((color) => (
            <button
              key={color}
              onClick={() => editor.chain().focus().setColor(color).run()}
              className={`w-6 h-6 rounded border-2 ${
                editor.isActive('textStyle', { color })
                  ? 'border-gray-800'
                  : 'border-gray-300'
              }`}
              style={{ backgroundColor: color }}
              title={`颜色: ${color}`}
            />
          ))}
        </div>

        <div className="w-px bg-gray-300 mx-1" />

        <Button
          size="sm"
          variant="outline"
          onClick={handleImageUpload}
          className="w-8 h-8 p-0"
        >
          <ImageIcon size={16} />
        </Button>

        <div className="w-px bg-gray-300 mx-1" />

        <Button
          size="sm"
          variant="outline"
          onClick={() => editor.chain().focus().undo().run()}
          className="w-8 h-8 p-0"
        >
          <Undo2 size={16} />
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={() => editor.chain().focus().redo().run()}
          className="w-8 h-8 p-0"
        >
          <Redo2 size={16} />
        </Button>
      </div>

      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none p-3 min-h-[200px] focus:outline-none"
      />
    </div>
  );
}
