import { User } from "../../core/services/users.service";

export interface Client {
  id: string;
  name: string;
  lastName: string;
  identificationNumber: string;
  birthDate: string;
  phoneNumber: number;
  address: string;
  gender: string;
  occupation: string;
  active: boolean;
  user: User;
}
