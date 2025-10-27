"use client";

import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  Timestamp,
  onSnapshot,
  deleteDoc
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../../utils/firebase";
import { useParams, useRouter } from "next/navigation";
import styles from "../blogs.module.css";

export default function BlogDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [user] = useAuthState(auth);
  const [blog, setBlog] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadBlog = async () => {
      const ref = doc(db, "blogs", id as string);
      const snap = await getDoc(ref);
      if (snap.exists()) setBlog({ id: snap.id, ...snap.data() });
    };
    loadBlog();
  }, [id]);

  useEffect(() => {
    const commentsRef = collection(db, "blogs", id as string, "comments");
    const unsubscribe = onSnapshot(commentsRef, (snapshot) => {
      setComments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [id]);

  const handleComment = async () => {
    if (!user) {
      router.push(`/login?redirect=/blogs/${id}`);
      return;
    }
    if (!message.trim()) return;

    await addDoc(collection(db, "blogs", id as string, "comments"), {
      userId: user.uid,
      name: user.displayName || user.email,
      text: message,
      createdAt: Timestamp.now()
    });

    setMessage("");
  };

  const deleteComment = async (commentId: string) => {
    await deleteDoc(doc(db, "blogs", id as string, "comments", commentId));
  };

  if (!blog) return <div className={styles.loading}>Cargando blog...</div>;

  return (
    <div className={styles.blogContainer}>
      <p className={styles.date}>
        {blog.createdAt?.toDate?.().toLocaleString("es-ES", { dateStyle: "medium" })}
      </p>

      <h1 className={styles.blogTitle}>{blog.title}</h1>

      <div className={styles.blogContent}>
        {blog.content?.map((item: any, i: number) => {
          if (item.type === "text") return <p key={i} className={styles.paragraph}>{item.content}</p>;
          if (item.type === "image") return (
            <div key={i} className={styles.imageWrapper}>
              <img src={item.content} alt={`Imagen ${i + 1}`} className={styles.blogImage} />
            </div>
          );
          return null;
        })}
      </div>

      <h3 className={styles.commentsTitle}>Comentarios</h3>


      {user ? (
        <div className={styles.commentForm}>
            <textarea
            className={styles.commentTextarea}
            placeholder="Escribe un comentario..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            />
            <button onClick={handleComment} className={styles.commentSubmit}>Enviar</button>
        </div>
        ) : (
        <button
            onClick={() => router.push(`/auth/login?redirect=/blogs/${id}`)}
            className={styles.commentSubmit}
        >
            Inicia sesión para comentar
        </button>
        )}



      <div className={styles.commentList}>
        {comments.map((c) => (
          <div key={c.id} className={styles.commentCard}>
            <div className={styles.commentHeader}>
              <span className={styles.commentUser}>{c.name}</span>
              {user && user.uid === c.userId && (
                <button
                  className={styles.deleteBtn}
                  onClick={() => deleteComment(c.id)}
                >
                  X
                </button>
              )}
            </div>
            <p className={styles.commentText}>{c.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
