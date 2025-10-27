"use client";

import { useState } from "react";
import { db, storage } from "@/app/utils/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/components/Sidebar";
import styles from "../blogsAdmin.module.css";

type Paragraph = {
  type: "text" | "image";
  content: string | File;
};

export default function CreateBlog() {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [paragraphs, setParagraphs] = useState<Paragraph[]>([{ type: "text", content: "" }]);
  const router = useRouter();

  const handleParagraphChange = (index: number, value: string) => {
    const newParagraphs = [...paragraphs];
    newParagraphs[index].content = value;
    setParagraphs(newParagraphs);
  };

  const addParagraph = () => setParagraphs([...paragraphs, { type: "text", content: "" }]);

  const removeParagraph = (index: number) => {
    setParagraphs(paragraphs.filter((_, i) => i !== index));
  };

  const uploadParagraphImage = async (file: File) => {
    const imageRef = ref(storage, `blogs/${Date.now()}_${file.name}`);
    await uploadBytes(imageRef, file);
    return await getDownloadURL(imageRef);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!title || !summary || paragraphs.some(p => p.type === "text" && !p.content)) {
      return alert("Completa todos los campos de texto");
    }

    const uploadedParagraphs = await Promise.all(
      paragraphs.map(async p => {
        if (p.type === "image" && p.content instanceof File) {
          const url = await uploadParagraphImage(p.content);
          return { type: "image", content: url };
        }
        return p;
      })
    );

    const firstImageObj = uploadedParagraphs.find(p => p.type === "image");
    const thumbnail = firstImageObj ? firstImageObj.content : null;

    await addDoc(collection(db, "blogs"), {
      title,
      summary,
      content: uploadedParagraphs,
      thumbnail,
      createdAt: serverTimestamp(),
      author: "Admin"
    });

    router.push("/admin/crear-blogs");
  };

  return (
    <div className={styles.adminContainer}>
      <Sidebar />
      <div className={styles.content}>
        <h1 className="fw-bold mb-4">Crear Blog</h1>
        <form onSubmit={handleSubmit}>
          <label className="fw-semibold">Título</label>
          <input
            className="form-control mb-3"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título del blog"
          />

          <label className="fw-semibold">Resumen corto</label>
          <textarea
            className="form-control mb-3"
            rows={3}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Resumen atractivo"
          />

          <label className="fw-semibold">Contenido</label>

          {paragraphs.map((p, idx) => (
            <div key={idx} className={styles.editorBlock}>
              <div className={styles.toolbar}>
                <button
                  type="button"
                  onClick={() => removeParagraph(idx)}
                  className={styles.deleteBtn}
                >
                  ❌
                </button>
              </div>

              {p.type === "text" ? (
                <textarea
                  className={styles.editorContent}
                  rows={4}
                  value={p.content as string}
                  onChange={(e) => handleParagraphChange(idx, e.target.value)}
                />

              ) : (
                <div className={styles.imagePreview}>
                  <img
                    src={p.content instanceof File ? URL.createObjectURL(p.content) : p.content}
                    alt="preview"
                    style={{ maxWidth: "100%" }}
                  />
                </div>
              )}

              {p.type === "text" && (
                <div className={styles.actions}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const newParagraphs = [...paragraphs];
                        newParagraphs.splice(idx + 1, 0, { type: "image", content: e.target.files[0] });
                        setParagraphs(newParagraphs);
                      }
                    }}
                  />
                </div>
              )}
            </div>
          ))}

          <button type="button" className="btn btn-secondary mb-3 mx-3" onClick={addParagraph}>
            [+] Agregar párrafo
          </button>

          <button type="submit" className="btn btn-primary">
            Publicar Blog
          </button>
        </form>
      </div>
    </div>
  );
}
