// hooks/useEditablePosts.ts
import { useState } from "react";
import type { Post } from "../components/SearchTable";

export function useEditablePosts(initialData: Post[]) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<{ title: string; body: string }>({
    title: "",
    body: "",
  });
  const [data, setData] = useState<Post[]>(initialData);

  const startEditing = (post: Post) => {
    setEditingId(post.id);
    setEditValues({ title: post.title, body: post.body });
  };

  const finishEditing = (id: number) => {
    setData((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, title: editValues.title, body: editValues.body } : p
      )
    );
    setEditingId(null);
    setEditValues({ title: "", body: "" });
  };

  const cancelEditing = () => {
  setEditingId(null);
  setEditValues({ title: "", body: "" });
};

  return {
    data,
    setData,
    editingId,
    editValues,
    setEditValues,
    startEditing,
    finishEditing,
    cancelEditing
  };
}
