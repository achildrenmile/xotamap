export interface ProgramRules {
  minQsos?: number;
  activationRadius?: string;
  equipment?: string;
  operatingModes?: string[];
  specialRequirements?: string;
}

export interface Award {
  name: string;
  points?: number;
  description?: string;
}

export interface ProgramLinks {
  website: string;
  rules?: string;
  logUpload?: string;
  referenceSearch?: string;
  spotPage?: string;
}

export interface Program {
  id: string;
  code: string;
  name: string;
  nameDE: string;
  focus: string;
  focusDE: string;
  tier: 1 | 2 | 3 | 4;
  website: string;
  spotSource: 'spothole' | 'direct' | 'none';
  hasReferences: boolean;
  referenceCount?: number;
  color: string;
  icon: string;
  rules: ProgramRules;
  awards: Award[];
  links: ProgramLinks;
  subPrograms?: string[];
  region?: string;
  eventPeriod?: string;
}
