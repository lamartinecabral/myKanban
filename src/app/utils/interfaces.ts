
// relacionamentos:
//
// user 1 - N board
// board 1 - N column
// column 1 - N card
// card 1 - N comment

export interface Board {
  id?: string,
  data?: {
    name?: string,
    uid?: string,
    created?: string,
    index?: number,
    guests?: string[],
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

export interface Comment {
  id?: string,
  data?: {
    text?: string,
    uid?: string,
    board_id?: string,
    column_id?: string,
    card_id?: string,
    created?: string,
  }
}
