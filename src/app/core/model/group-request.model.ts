import { RequestTypeEnum } from "../enum/request-type.enum";
import { StatusEnum } from "../enum/status.enum";

export interface GroupRequestModel {
  groupId: string;
  fromUid: string;
  toUid: string;
  status: StatusEnum;
  type: RequestTypeEnum;
  createdAt: any;
  id: string
}
