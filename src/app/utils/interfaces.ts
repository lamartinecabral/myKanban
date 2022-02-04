
// relacionamentos:
//
// user 1 - N board
// board 1 - N column
// column 1 - N card

export interface Board {
  id?: string,
  data?: {
    name?: string,
    uid?: string,
    created?: string,
    index?: number,
  }
}

export interface Column {
  id?: string,
  data?: {
    name?: string,
    uid?: string,
    board_id?: string,
    created?: string,
    index?: number,
  }
}

export interface Card {
  id?: string,
  data?: {
    text?: string,
    uid?: string,
    board_id?: string,
    column_id?: string,
    created?: string,
    index?: number,
  }
}