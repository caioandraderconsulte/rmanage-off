export interface Company {
  id: string;
  name: string;
  address: string;
  phone: string;
  website: string;
  email: string;
  responsible: string;
  manufacturer: string;
  centralModel: string;
  cbProject: string;
  avcb: string;
  date: string;
  code: string;
}

export interface Unit {
  id: string;
  companyId: string;
  name: string;
  code: string;
}

export interface Sector {
  id: string;
  unitId: string;
  name: string;
  code: string;
}

export interface Equipment {
  id: string;
  sectorId: string;
  typeCode: string;
  model: string;
  loop: string;
  central: string;
  finalCode: string;
}

export interface Inspection {
  id: string;
  equipmentId: string;
  description: string;
  descriptionPhoto?: string;
  functioning: boolean;
  malfunctionDescription: string;
  malfunctionPhoto?: string;
  date: string;
  nextDate: string;
}

export interface EquipmentType {
  code: string;
  name: string;
}