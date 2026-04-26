import { OpaqueID } from "../utils";
import { TypeID } from "./type";

export type CommentID = OpaqueID<"CommentID">;
export type Comment = {
  id: CommentID,

  text: string,
  typeId: TypeID,
  memberName: null | string
}