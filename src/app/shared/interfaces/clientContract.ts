import { Client } from "./client";
import { Contract } from "./contract";


export interface ClientContracts {
  client: Client;
  contracts: Contract[];
}
