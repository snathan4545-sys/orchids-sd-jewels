"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import styles from '../products/AdminProducts.module.css';
import { API_BASE_URL } from '@/config';

export default function AdminSizes() {
  const [sizes, setSizes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newSize, setNewSize] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const fetchSizes = () => {
    fetch(`${API_BASE_URL}/sizes`)
      .then(res => res.json())
      .then(data => {
        setSizes(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchSizes();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSize.trim()) return;
    setIsAdding(true);
    
    try {
      const res = await fetch(`${API_BASE_URL}/sizes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newSize.trim() })
      });
      const data = await res.json();
      if (res.ok) {
        setNewSize("");
        fetchSizes();
      } else {
        alert(data.error || "Failed to add size");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this size? Products using this size might still display it if they saved it directly.")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/sizes/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchSizes();
      } else {
        alert("Failed to delete size");
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className={styles.loading}>Loading sizes...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2>Size Master</h2>
          <p className={styles.description}>Manage the global list of available sizes for your products.</p>
        </div>
      </div>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <form onSubmit={handleAdd} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input 
            type="text" 
            placeholder="e.g. US 7, Small, 18inch" 
            value={newSize} 
            onChange={(e) => setNewSize(e.target.value)} 
            style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #ccc' }}
            required
          />
          <button type="submit" className={styles.addBtn} disabled={isAdding}>
            <Plus size={18} />
            {isAdding ? "Adding..." : "Add Size"}
          </button>
        </form>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Size Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sizes.length > 0 ? (
              sizes.map(s => (
                <tr key={s.id}>
                  <td>{s.id}</td>
                  <td style={{ fontWeight: 600 }}>{s.name}</td>
                  <td>
                    <div className={styles.actions}>
                      <button className={styles.iconBtn} onClick={() => handleDelete(s.id)}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} style={{ textAlign: 'center', padding: '2rem' }}>No sizes found in master list.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
