import { GroupRequestModel } from "./group-request.model";

export interface GroupRequestExtendedModel extends GroupRequestModel{
  fromUsername: string,
  toUsername: string,
  groupName: string
}
