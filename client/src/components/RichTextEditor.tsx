import React, { useMemo, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './RichTextEditor.css';
import { toast } from 'sonner';

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
  const quillRef = useRef<any>(null);
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

      // 验证文件大小（限制为5MB）
      if (file.size > 5 * 1024 * 1024) {
        toast.error('图片大小不能超过5MB');
        return;
      }

      try {
        toast.loading('上传中...');
        const imageUrl = await onImageUpload(file);
        
        // 获取编辑器实例并插入图片
        const editor = quillRef.current?.getEditor();
        if (editor) {
          const range = editor.getSelection();
          const index = range?.index || editor.getLength();
          editor.insertEmbed(index, 'image', imageUrl);
          editor.setSelection(index + 1);
        }
        
        toast.success('图片上传成功');
      } catch (error) {
        console.error('图片上传失败:', error);
        toast.error('图片上传失败');
      }
    };
    input.click();
  };

  const modules = useMemo(
    () => {
      const config: any = {
        toolbar: {
          container: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['link'],
            ['clean'],
          ],
        },
      };

      if (onImageUpload) {
        config.toolbar.container.splice(5, 0, 'image');
        config.toolbar.handlers = {
          image: handleImageUpload,
        };
      }

      return config;
    },
    [onImageUpload]
  );

  const formats = [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'color',
    'background',
    'list',
    'bullet',
    'link',
    'image',
    'align',
  ];

  return (
    <div className="rich-text-editor-wrapper">
      <ReactQuill
        ref={quillRef}
        theme={readOnly ? 'bubble' : 'snow'}
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        readOnly={readOnly}
        preserveWhitespace
      />
    </div>
  );
}

export function RichTextDisplay({ content }: { content: string }) {
  return (
    <div className="rich-text-display ql-editor">
      <div 
        dangerouslySetInnerHTML={{ __html: content }}
        style={{ wordBreak: 'break-word' }}
      />
    </div>
  );
}
