import {
  subjectStemCover,
  subjectMathCover,
  subjectComputerCover,
  subjectWorkCover
} from '../assets';

export const subjectCoverOptions = [
  { id: 'stem', label: 'STEM / วิทยาศาสตร์', image: subjectStemCover, palette: 'motion' },
  { id: 'math', label: 'คณิตศาสตร์', image: subjectMathCover, palette: 'air' },
  { id: 'computer', label: 'วิทยาการคอมพิวเตอร์', image: subjectComputerCover, palette: 'game' },
  { id: 'work', label: 'การงานอาชีพ', image: subjectWorkCover, palette: 'paper' },
];

export const defaultSubjects = [
  { id: 'subject-stem', name: 'STEM', coverId: 'stem' },
  { id: 'subject-math', name: 'คณิตศาสตร์', coverId: 'math' },
  { id: 'subject-computer', name: 'วิทยาการคอมพิวเตอร์', coverId: 'computer' },
  { id: 'subject-work', name: 'การงานอาชีพ', coverId: 'work' },
];

export function getSubjectCoverOption(coverId) {
  return subjectCoverOptions.find((option) => option.id === coverId) || subjectCoverOptions[0];
}

export function hydrateSubject(subject) {
  const coverOption = getSubjectCoverOption(subject.coverId);

  return {
    ...subject,
    coverId: coverOption.id,
    coverLabel: coverOption.label,
    cover: coverOption.image,
    palette: subject.palette || coverOption.palette,
  };
}

export function findSubjectByName(subjects, subjectName) {
  const normalizedName = subjectName?.trim().toLowerCase();
  return subjects.find((subject) => subject.name.trim().toLowerCase() === normalizedName);
}
