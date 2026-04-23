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
  DISTRICT = 'DISTRICT',
  HOD = 'HOD',
  ZONE = 'ZONE',
  CELL = 'CELL',
  MEMBER = 'MEMBER',
}

const ROLE_HIERARCHY = {
  MEMBER: 1,
  CELL: 2,
  ZONE: 3,
  HOD: 4,
  DISTRICT: 5,
  TEAM: 6,
  PASTOR: 7,
  CAMPUS_PASTOR: 8,
};
