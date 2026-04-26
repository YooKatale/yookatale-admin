"use client";

import { useRef, forwardRef } from "react";
import { Editor } from "@tinymce/tinymce-react";

const ALLOWED_PLUGINS = "lists link autolink";
const TOOLBAR = "undo redo | bold italic underline strikethrough | bullist numlist | link | removeformat";

const SafeRichEditor = ({ value, onChange, placeholder = "Start writing...", height = 320 }) => {
  const editorRef = useRef(null);

  return (
    <Editor
      tinymceScriptSrc="/tinymce/tinymce.min.js"
      onInit={(_evt, editor) => { editorRef.current = editor; }}
      value={value}
      onEditorChange={(content) => onChange?.(content)}
      init={{
        height,
        menubar: false,
        plugins: ALLOWED_PLUGINS,
        toolbar: TOOLBAR,
        placeholder,
        branding: false,
        promotion: false,
        statusbar: false,
        content_style: "body { font-family: 'Bricolage Grotesque', 'Inter', system-ui, sans-serif; font-size: 14px; line-height: 1.7; }",
        // Security: restrict pasting to plain text + safe HTML
        paste_as_text: false,
        invalid_elements: "script,iframe,object,embed,form,input,select,textarea",
        extended_valid_elements: "a[href|target=_blank|rel=noopener noreferrer]",
        // Sanitize URLs
        convert_urls: true,
        relative_urls: false,
        allow_script_urls: false,
        // Block unsafe content
        sandbox_iframes: true,
      }}
    />
  );
};

export default SafeRichEditor;
