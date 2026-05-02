import { OpaqueID } from "../utils";
import { IdentifierID } from "./identifiers";
import { TypeID } from "./type";

export type CommentID = OpaqueID<"CommentID">;
export type Comment = {
  id: CommentID,

  text: string,
  identifier: IdentifierID,
  memberName: null | string
}