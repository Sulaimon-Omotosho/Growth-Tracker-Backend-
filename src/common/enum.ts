export class RegisterDto {
  email: string;
  password?: string;
  firstName?: string;
  lastName?: string;
}

export enum Role {
  CAMPUS_PASTOR = 'CAMPUS_PASTOR',
  PASTOR = 'PASTOR',
  TEAM = 'TEAM',
  HOD = 'HOD',
  DISTRICT = 'DISTRICT',
  ZONE = 'ZONE',
  CELL = 'CELL',
  MEMBER = 'MEMBER',
}

const ROLE_HIERARCHY = {
  MEMBER: 1,
  CELL: 2,
  ZONE: 3,
  DISTRICT: 4,
  HOD: 5,
  TEAM: 6,
  PASTOR: 7,
  CAMPUS_PASTOR: 8,
};
