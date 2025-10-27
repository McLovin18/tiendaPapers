"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/app/utils/firebase";
import Sidebar from "@/app/components/Sidebar";
import Link from "next/link";
import styles from "./blogsAdmin.module.css";

export default function BlogsAdmin() {
  const [blogs, setBlogs] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, "blogs"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      setBlogs(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsub();
  }, []);

  return (
    <div className={styles.adminContainer}>
      <Sidebar />
      <div className={styles.content}>
        <h2 className="fw-bold mb-4">Administrar Blogs</h2>

        <div className={styles.grid}>
          {/* Tarjeta para crear nuevo blog */}
          <Link href="/admin/crear-blogs/crear" className={styles.addCard}>
            <span>+</span>
          </Link>


          {/* Tarjetas de blogs */}
            {blogs.map((blog) => (
            <Link
                key={blog.id}
                href={`/admin/crear-blogs/${blog.id}`}
                className={styles.card}
            >
                <div
                className={styles.thumb}
                style={{
                    backgroundImage: blog.thumbnail ? `url(${blog.thumbnail})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    minHeight: '150px',
                    borderRadius: '8px'
                }}
                ></div>
                <h5 className="mt-2 fw-semibold">{blog.title}</h5>
            </Link>
            ))}

        </div>

        {blogs.length === 0 && (
          <p className="text-muted mt-3">
            No hay blogs aún. Comienza creando uno.
          </p>
        )}
      </div>
    </div>
  );
}
