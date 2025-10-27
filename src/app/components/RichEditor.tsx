"use client";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import styles from "./ui/editor.module.css";

export default function RichEditor({ value, onChange }: any) {
    const editor = useEditor({
    extensions: [
        StarterKit,
        Underline,
    ],
    content: value,
    immediatelyRender: false, // ✅ Elimina error SSR
    onUpdate: ({ editor }) => {
        onChange(editor.getHTML());
    },
    });


  return (
    <div className={styles.editorContainer}>
      <div className={styles.toolbar}>
        <button
          type="button"
          className={editor?.isActive("bold") ? styles.activeBtn : ""}
          onClick={() => editor?.chain().focus().toggleBold().run()}
        >
          B
        </button>
        <button
          type="button"
          className={editor?.isActive("italic") ? styles.activeBtn : ""}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
        >
          <i>I</i>
        </button>
        <button
          type="button"
          className={editor?.isActive("underline") ? styles.activeBtn : ""}
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
        >
          <u>U</u>
        </button>
      </div>

      <EditorContent editor={editor} className={styles.editor} />
    </div>
  );
}
