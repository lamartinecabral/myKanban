
// relacionamentos:
//
// user 1 - N board
// board 1 - N column
// column 1 - N card
// card 1 - N comment

import { SnapshotMetadata } from "firebase/firestore";

export class Board {
  static col = 'boards';
  id?: string;
  data?: {
    name?: string,
    uid?: string,
    created?: string,
    index?: number,
    guests?: string[],
  }
}

export class Column {
  static col = 'columns';
  id?: string;
  data?: {
    name?: string,
    uid?: string,
    board_id?: string,
    created?: string,
    index?: number,
  }
}

export class Card {
  static col = 'cards';
  id?: string;
  data?: {
    title?: string,
    text?: string,
    uid?: string,
    board_id?: string,
    column_id?: string,
    created?: string,
    index?: number,
  }
}

export class Comment {
  static col = 'comments';
  id?: string;
  data?: {
    text?: string,
    uid?: string,
    board_id?: string,
    column_id?: string,
    card_id?: string,
    created?: string,
  }
}

export interface ListSnapshot<T>{
  metadata?: SnapshotMetadata;
  docs?: T[];
}

export interface GetSnapshot<T>{
  metadata?: SnapshotMetadata;
  doc?: T;
}
