import { useState, useEffect } from 'react';
import { initialMediaItems } from '../data/mockData';
import toast from 'react-hot-toast';
import { clearAdminSession, getAdminAuthToken } from '../utils/adminSession';

const STORAGE_KEY = 'learning_center_media_p4_2_real_covers_v2';
const STORAGE_REVISION = 'p4_2_real_covers_pages_v4';
const seedIds = new Set(initialMediaItems.map((item) => item.id));

// Determine dynamic API Base URL according to environment (local dev vs. live cloud hosting)
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3000'
  : 'https://learning-hub-hjba.onrender.com';

function getItemSignature(item) {
  return [
    item.title?.trim().toLowerCase() || '',
    item.grade || '',
    item.type || '',
    item.fileUrl?.trim().toLowerCase() || '',
  ].join('|');
}

function saveLocalBackup(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ revision: STORAGE_REVISION, items }));
}

function normalizeStoredMedia(parsed) {
  if (Array.isArray(parsed)) {
    return { revision: null, items: parsed };
  }

  if (parsed && Array.isArray(parsed.items)) {
    return { revision: parsed.revision ?? null, items: parsed.items };
  }

  return { revision: null, items: [] };
}

function hydrateSeedMedia(storedItems = []) {
  const storedById = new Map(storedItems.map((item) => [item.id, item]));
  const seededItems = initialMediaItems.map((seedItem) => {
    const storedItem = storedById.get(seedItem.id);

    return {
      ...seedItem,
      ...storedItem,
      cover: seedItem.cover,
      thumbnail: seedItem.thumbnail,
      fileUrl: seedItem.fileUrl,
      quizQuestions: seedItem.quizQuestions || storedItem?.quizQuestions || []
    };
  });
  const customItems = storedItems.filter((item) => !seedIds.has(item.id));

  return [...seededItems, ...customItems];
}

function loadLocalBackup() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return initialMediaItems;
  }

  try {
    const { items } = normalizeStoredMedia(JSON.parse(stored));
    return hydrateSeedMedia(items);
  } catch {
    return initialMediaItems;
  }
}

function mergeRemoteWithLocal(remoteItems, localItems) {
  const remoteHydrated = hydrateSeedMedia(remoteItems);
  const remoteIds = new Set(remoteHydrated.map((item) => item.id));
  const remoteSignatures = new Set(remoteHydrated.map(getItemSignature));
  const localOnlyItems = localItems.filter((item) => {
    if (seedIds.has(item.id) || remoteIds.has(item.id)) return false;
    return !remoteSignatures.has(getItemSignature(item));
  });

  return [...localOnlyItems, ...remoteHydrated];
}

function getMutationHeaders(includeJson = false) {
  const token = getAdminAuthToken();
  if (!token) return null;

  return {
    ...(includeJson ? { 'Content-Type': 'application/json' } : {}),
    Authorization: `Bearer ${token}`
  };
}

async function assertWriteResponse(response) {
  if (response.status === 401 || response.status === 403) {
    clearAdminSession();
    throw new Error('AUTH_REQUIRED');
  }

  if (!response.ok) {
    throw new Error(`API server returned ${response.status}`);
  }
}

function showWriteWarning(error) {
  if (error.message === 'AUTH_REQUIRED') {
    toast.error('เซสชันหลังบ้านหมดอายุ กรุณาเข้าสู่ระบบใหม่');
    return;
  }

  toast.error('บันทึกไว้เฉพาะเครื่องนี้ ยังไม่ซิงก์ขึ้นระบบกลาง');
}

export function useMediaStorage() {
  const [mediaItems, setMediaItems] = useState(loadLocalBackup);
  const [isLoaded, setIsLoaded] = useState(false);

  // Dynamic async fetch from real Node.js REST API
  useEffect(() => {
    const fetchMediaFromApi = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/media`);
        if (!response.ok) throw new Error('API server returned error status');
        
        const data = await response.json();
        console.log('[PWA API] Loaded media data successfully from Node.js server!');
        
        // Preserve recently saved local items that may not have reached the remote API yet.
        const hydrated = mergeRemoteWithLocal(data, loadLocalBackup());
        setMediaItems(hydrated);
        
        // Keep localStorage backup in sync
        saveLocalBackup(hydrated);
      } catch (err) {
        console.warn('[PWA API] Server offline, running on local cache fallback:', err.message);
        // Fallback is already loaded as initial state, so we just log it
      } finally {
        setIsLoaded(true);
      }
    };

    fetchMediaFromApi();
  }, []);

  const addMedia = async (newItem) => {
    // Generate a temporary ID for optimistic UI rendering
    const tempId = Date.now();
    const itemWithId = { ...newItem, id: tempId };
    const updated = [itemWithId, ...mediaItems];
    
    // Save to local state and local backup fallback
    setMediaItems(updated);
    saveLocalBackup(updated);
    toast.success('เพิ่มสื่อใหม่เรียบร้อยแล้ว');

    // Attempt to write to real API
    try {
      const headers = getMutationHeaders(true);
      if (!headers) throw new Error('AUTH_REQUIRED');

      const response = await fetch(`${API_BASE}/api/media`, {
        method: 'POST',
        headers,
        body: JSON.stringify(newItem)
      });
      await assertWriteResponse(response);
      const savedItem = await response.json();
      // Replace temp item with saved item containing actual backend server ID
      setMediaItems(prev => {
        const synced = prev.map(item => item.id === tempId ? { ...item, ...savedItem } : item);
        saveLocalBackup(synced);
        return synced;
      });
      console.log('[PWA API] Successfully added media item to backend database.');
    } catch (err) {
      showWriteWarning(err);
      console.warn('[PWA API] Failed to add media on server, synced to local cache only.', err);
    }
  };

  const editMedia = async (id, updatedItem) => {
    const updated = mediaItems.map(item => item.id === id ? { ...item, ...updatedItem } : item);
    
    // Save to local state and local backup fallback
    setMediaItems(updated);
    saveLocalBackup(updated);
    toast.success('แก้ไขข้อมูลเรียบร้อยแล้ว');

    // Attempt to write to real API
    try {
      const headers = getMutationHeaders(true);
      if (!headers) throw new Error('AUTH_REQUIRED');

      const response = await fetch(`${API_BASE}/api/media/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updatedItem)
      });
      await assertWriteResponse(response);
      console.log('[PWA API] Successfully updated media item on backend database.');
    } catch (err) {
      showWriteWarning(err);
      console.warn('[PWA API] Failed to update media on server, synced to local cache only.', err);
    }
  };

  const deleteMedia = async (id) => {
    const updated = mediaItems.filter(item => item.id !== id);
    
    // Save to local state and local backup fallback
    setMediaItems(updated);
    saveLocalBackup(updated);
    toast.success('ลบสื่อเรียบร้อยแล้ว');

    // Attempt to delete on real API
    try {
      const headers = getMutationHeaders();
      if (!headers) throw new Error('AUTH_REQUIRED');

      const response = await fetch(`${API_BASE}/api/media/${id}`, {
        method: 'DELETE',
        headers
      });
      await assertWriteResponse(response);
      console.log('[PWA API] Successfully deleted media item from backend database.');
    } catch (err) {
      showWriteWarning(err);
      console.warn('[PWA API] Failed to delete media on server, synced to local cache only.', err);
    }
  };

  const togglePublish = async (id) => {
    let newStatus = true;
    const updated = mediaItems.map(item => {
      if (item.id === id) {
        newStatus = !item.isPublished;
        toast.success(newStatus ? 'เผยแพร่สื่อแล้ว' : 'ซ่อนสื่อแล้ว');
        return { ...item, isPublished: newStatus };
      }
      return item;
    });
    
    // Save to local state and local backup fallback
    setMediaItems(updated);
    saveLocalBackup(updated);

    // Attempt to toggle on real API
    try {
      const headers = getMutationHeaders();
      if (!headers) throw new Error('AUTH_REQUIRED');

      const response = await fetch(`${API_BASE}/api/media/${id}/publish`, {
        method: 'PATCH',
        headers
      });
      await assertWriteResponse(response);
      console.log('[PWA API] Successfully toggled media publish status on backend.');
    } catch (err) {
      showWriteWarning(err);
      console.warn('[PWA API] Failed to toggle publish on server, synced to local cache only.', err);
    }
  };

  const getMediaById = (id) => {
    return mediaItems.find(item => item.id === parseInt(id, 10));
  };

  return {
    mediaItems,
    isLoaded,
    addMedia,
    editMedia,
    deleteMedia,
    togglePublish,
    getMediaById
  };
}
