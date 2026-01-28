import React, { useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './RichTextEditor.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = '输入内容...',
  readOnly = false,
}: RichTextEditorProps) {
  const modules = useMemo(
    () => ({
      toolbar: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['link', 'image'],
        ['clean'],
      ],
    }),
    []
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
  ];

  return (
    <div className="rich-text-editor-wrapper">
      <ReactQuill
        theme={readOnly ? 'bubble' : 'snow'}
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        readOnly={readOnly}
      />
    </div>
  );
}

export function RichTextDisplay({ content }: { content: string }) {
  return (
    <div className="rich-text-display ql-editor">
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
}
