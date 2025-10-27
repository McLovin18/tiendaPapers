"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, limit, startAfter, getDocs } from "firebase/firestore";
import { db } from ".././utils/firebase";
import Link from "next/link";
import styles from "./blogs.module.css";

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [noMore, setNoMore] = useState(false);

  const fetchBlogs = async (loadMore = false) => {
    setLoading(true);
    const baseQuery = query(
      collection(db, "blogs"),
      orderBy("createdAt", "desc"),
      limit(5)
    );

    let finalQuery = baseQuery;

    if (loadMore && lastDoc) {
      finalQuery = query(
        collection(db, "blogs"),
        orderBy("createdAt", "desc"),
        startAfter(lastDoc),
        limit(5)
      );
    }

    const docsSnap = await getDocs(finalQuery);

    if (docsSnap.empty) {
      setNoMore(true);
      setLoading(false);
      return;
    }

    const lastVisible = docsSnap.docs[docsSnap.docs.length - 1];
    setLastDoc(lastVisible);

    const newBlogs = docsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    setBlogs((prev) => loadMore ? [...prev, ...newBlogs] : newBlogs);
    setLoading(false);
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Blogs</h2>

      {blogs.length === 0 && !loading && (
        <p className={styles.emptyText}>Todavía no hay blogs publicados.</p>
      )}

      <div className={styles.blogList}>
        {blogs.map((blog) => (
          <div key={blog.id} className={styles.blogCard}>
            <p className={styles.date}>
              {blog.createdAt?.toDate?.().toLocaleString("es-ES", { dateStyle: "medium" })}
            </p>
            <h3 className={styles.blogTitle}>{blog.title}</h3>
            <p className={styles.blogDesc}>
                {blog.summary
                    ? blog.summary.slice(0, 120) + "..."
                    : blog.content
                        .filter(p => p.type === "text")
                        .map(p => p.content)
                        .join(" ")
                        .slice(0, 120) + "..."}
            </p>

            <Link href={`/blogs/${blog.id}`} className={styles.readMore}>
              Leer más
            </Link>
          </div>
        ))}
      </div>

      {!noMore && !loading && (
        <button className={styles.loadMore} onClick={() => fetchBlogs(true)}>
          Ver más blogs
        </button>
      )}

      {loading && <p className={styles.loading}>Cargando...</p>}
    </div>
  );
}
