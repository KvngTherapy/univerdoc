export const MATRIC_REGEX = /^M\.\d{2}\/[A-Z]{2,}\/[A-Z]{2,}\/\d{4,6}$/;

export function validateMatricNumber(matric) {
  if (!matric || typeof matric !== 'string') return false;
  return MATRIC_REGEX.test(matric.trim());
}

export const MATRIC_EXAMPLE = 'M.24/ND/PEG/11245';
export const MATRIC_GUIDE = 'Format: M.YY/PROGRAM/DEPT/NUMBER — e.g. M.24/ND/PEG/11245';