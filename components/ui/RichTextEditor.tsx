'use client';

import React, { useRef, useEffect } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  RemoveFormatting,
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  className?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Enter rich text content...',
  minHeight = 'min-h-[130px]',
  className = '',
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isUpdatingRef = useRef(false);

  useEffect(() => {
    if (editorRef.current && !isUpdatingRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      isUpdatingRef.current = true;
      onChange(editorRef.current.innerHTML);
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 50);
    }
  };

  const executeCommand = (command: string, arg: string | undefined = undefined) => {
    document.execCommand(command, false, arg);
    if (editorRef.current) {
      editorRef.current.focus();
      handleInput();
    }
  };

  const handleInsertLink = () => {
    const url = prompt('Enter link URL (e.g. https://example.com):');
    if (url) executeCommand('createLink', url);
  };

  return (
    <div className={`border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs font-sans ${className}`}>
      {/* Toolbar */}
      <div className="bg-slate-50 border-b border-slate-200 px-3 py-2 flex flex-wrap items-center gap-1">
        <button type="button" onClick={() => executeCommand('bold')} title="Bold (Ctrl+B)" className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-200/80 hover:text-slate-900 transition-colors">
          <Bold size={14} />
        </button>
        <button type="button" onClick={() => executeCommand('italic')} title="Italic (Ctrl+I)" className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-200/80 hover:text-slate-900 transition-colors">
          <Italic size={14} />
        </button>
        <button type="button" onClick={() => executeCommand('underline')} title="Underline (Ctrl+U)" className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-200/80 hover:text-slate-900 transition-colors">
          <Underline size={14} />
        </button>
        <button type="button" onClick={() => executeCommand('strikeThrough')} title="Strikethrough" className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-200/80 hover:text-slate-900 transition-colors">
          <Strikethrough size={14} />
        </button>

        <div className="w-[1px] h-4 bg-slate-300 mx-1" />

        <button type="button" onClick={() => executeCommand('formatBlock', '<h1>')} title="Heading 1" className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-200/80 hover:text-slate-900 transition-colors">
          <Heading1 size={14} />
        </button>
        <button type="button" onClick={() => executeCommand('formatBlock', '<h2>')} title="Heading 2" className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-200/80 hover:text-slate-900 transition-colors">
          <Heading2 size={14} />
        </button>

        <div className="w-[1px] h-4 bg-slate-300 mx-1" />

        <button type="button" onClick={() => executeCommand('insertUnorderedList')} title="Bullet List" className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-200/80 hover:text-slate-900 transition-colors">
          <List size={14} />
        </button>
        <button type="button" onClick={() => executeCommand('insertOrderedList')} title="Numbered List" className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-200/80 hover:text-slate-900 transition-colors">
          <ListOrdered size={14} />
        </button>
        <button type="button" onClick={() => executeCommand('formatBlock', '<blockquote>')} title="Blockquote" className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-200/80 hover:text-slate-900 transition-colors">
          <Quote size={14} />
        </button>

        <div className="w-[1px] h-4 bg-slate-300 mx-1" />

        <button type="button" onClick={handleInsertLink} title="Insert Link" className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-200/80 hover:text-slate-900 transition-colors">
          <LinkIcon size={14} />
        </button>
        <button type="button" onClick={() => executeCommand('removeFormat')} title="Clear Formatting" className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-200/80 hover:text-slate-900 transition-colors">
          <RemoveFormatting size={14} />
        </button>
      </div>

      {/* Editor Body */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onBlur={handleInput}
        className={`p-3 text-xs text-slate-900 outline-none font-sans focus:ring-0 ${minHeight} overflow-y-auto prose prose-sm max-w-none`}
        data-placeholder={placeholder}
        style={{ minHeight: '120px' }}
      />
    </div>
  );
}