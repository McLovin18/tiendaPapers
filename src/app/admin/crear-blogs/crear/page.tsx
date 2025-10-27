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

  const addImageParagraph = (file: File) => {
    setParagraphs([...paragraphs, { type: "image", content: file }]);
  };

  const toggleBold = (index: number) => {
    const newParagraphs = [...paragraphs];
    const p = newParagraphs[index];
    if (p.type === "text") {
      const text = p.content as string;
      if (text.startsWith("<b>") && text.endsWith("</b>")) {
        p.content = text.replace(/^<b>|<\/b>$/g, "");
      } else {
        p.content = `<b>${text}</b>`;
      }
      setParagraphs(newParagraphs);
    }
  };

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

    // Subir imágenes y reemplazar File por URL
    const uploadedParagraphs = await Promise.all(
      paragraphs.map(async p => {
        if (p.type === "image" && p.content instanceof File) {
          const url = await uploadParagraphImage(p.content);
          return { type: "image", content: url };
        }
        return p;
      })
    );

    await addDoc(collection(db, "blogs"), {
      title,
      summary,
      content: uploadedParagraphs,
      createdAt: serverTimestamp(),
      author: "Admin",
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
            <div key={idx} className="mb-3">
              {p.type === "text" ? (
                <textarea
                  className="form-control mb-1"
                  rows={4}
                  value={p.content as string}
                  onChange={(e) => handleParagraphChange(idx, e.target.value)}
                  placeholder={`Párrafo ${idx + 1}`}
                />
              ) : (
                <div className="position-relative mb-1">
                  <img
                    src={typeof p.content === "string" ? p.content : URL.createObjectURL(p.content)}
                    alt="Imagen del párrafo"
                    className="img-fluid rounded"
                  />
                  <button
                    type="button"
                    className="btn btn-sm btn-danger position-absolute top-0 end-0"
                    onClick={() => removeParagraph(idx)}
                  >
                    X
                  </button>
                </div>
              )}
              <div className="d-flex gap-2 mb-2">
                <button
                  type="button"
                  className="btn btn-sm btn-secondary"
                  onClick={() => toggleBold(idx)}
                >
                  B
                </button>
                <input
                  type="file"
                  accept="image/*"
                  className="form-control form-control-sm"
                  onChange={(e) => e.target.files && addImageParagraph(e.target.files[0])}
                />
              </div>
            </div>
          ))}

          <button type="button" className="btn btn-secondary mb-3" onClick={addParagraph}>
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
