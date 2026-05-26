import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  defaultSubjects,
  findSubjectByName,
  getSubjectCoverOption,
  hydrateSubject,
  subjectCoverOptions
} from '../data/subjects';

const SUBJECT_STORAGE_KEY = 'learning_center_subject_catalog_v1';

function toStoredSubjects(subjects) {
  return subjects.map(({ id, name, coverId }) => ({ id, name, coverId }));
}

function hydrateSubjects(subjects) {
  return subjects.map(hydrateSubject);
}

function loadSubjects() {
  const stored = localStorage.getItem(SUBJECT_STORAGE_KEY);
  if (!stored) return hydrateSubjects(defaultSubjects);

  try {
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return hydrateSubjects(defaultSubjects);
    }

    return hydrateSubjects(parsed);
  } catch {
    return hydrateSubjects(defaultSubjects);
  }
}

function persistSubjects(subjects) {
  localStorage.setItem(SUBJECT_STORAGE_KEY, JSON.stringify(toStoredSubjects(subjects)));
}

export function useSubjectCatalog() {
  const [subjects, setSubjects] = useState(loadSubjects);

  const saveSubjects = (nextSubjects, message) => {
    const hydrated = hydrateSubjects(nextSubjects);
    setSubjects(hydrated);
    persistSubjects(hydrated);
    if (message) toast.success(message);
  };

  const addSubject = ({ name, coverId }) => {
    const subjectName = name.trim();
    if (!subjectName) {
      toast.error('กรุณากรอกชื่อรายวิชา');
      return false;
    }
    if (findSubjectByName(subjects, subjectName)) {
      toast.error('มีรายวิชานี้อยู่แล้ว');
      return false;
    }

    const coverOption = getSubjectCoverOption(coverId);
    saveSubjects(
      [
        ...subjects,
        {
          id: `subject-${Date.now()}`,
          name: subjectName,
          coverId: coverOption.id,
        },
      ],
      'เพิ่มรายวิชาเรียบร้อยแล้ว'
    );
    return true;
  };

  const updateSubject = (id, updates) => {
    const subjectName = updates.name.trim();
    if (!subjectName) {
      toast.error('กรุณากรอกชื่อรายวิชา');
      return false;
    }

    const duplicate = subjects.some(
      (subject) => subject.id !== id && subject.name.trim().toLowerCase() === subjectName.toLowerCase()
    );
    if (duplicate) {
      toast.error('มีรายวิชานี้อยู่แล้ว');
      return false;
    }

    const coverOption = getSubjectCoverOption(updates.coverId);
    saveSubjects(
      subjects.map((subject) => (
        subject.id === id
          ? { ...subject, name: subjectName, coverId: coverOption.id }
          : subject
      )),
      'แก้ไขรายวิชาเรียบร้อยแล้ว'
    );
    return true;
  };

  const deleteSubject = (id) => {
    if (subjects.length <= 1) {
      toast.error('ต้องมีรายวิชาอย่างน้อย 1 รายการ');
      return false;
    }

    saveSubjects(subjects.filter((subject) => subject.id !== id), 'ลบรายวิชาเรียบร้อยแล้ว');
    return true;
  };

  return {
    subjects,
    coverOptions: subjectCoverOptions,
    addSubject,
    updateSubject,
    deleteSubject,
  };
}
