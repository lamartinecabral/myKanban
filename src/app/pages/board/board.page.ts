import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as firestore from 'firebase/firestore';
import { AuthService } from 'src/app/services/auth.service';
import { FirestoreService } from 'src/app/services/firestore.service';
import { IoService } from 'src/app/services/io.service';
import { Board, Column, Card } from 'src/app/utils/interfaces';

@Component({
  selector: 'app-board',
  templateUrl: './board.page.html',
  styleUrls: ['./board.page.scss'],
})
export class BoardPage implements OnInit {

  board: Board;
  unsubscribeBoard;

  columns: any[];
  unsubscribeColumns;

  cards: {[column_id: string]: Card[]} = {};
  unsubscribeCards = {};

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    public auth: AuthService,
    public firestore: FirestoreService,
    public io: IoService,
  ) { }

  ngOnDestroy(){
    if(this.unsubscribeBoard) this.unsubscribeBoard();
    if(this.unsubscribeColumns) this.unsubscribeColumns();
    for(let id in this.unsubscribeCards)
      if(this.unsubscribeCards[id])
        this.unsubscribeCards[id]();
  }

  ngOnInit() {
    this.getBoard(this.route.snapshot.params.id);
    this.getColumns(this.route.snapshot.params.id);
  }

  // MOVE METHODS

  moveCard(col_index: number, card_index: number, increment: number){
    let fromColumn = this.columns[col_index];
    let card = this.cards[fromColumn.id][card_index];
    let toColumn = this.columns[col_index + increment];
    card.data.column_id = toColumn.id
    this.firestore.editDoc({
      id: card.id,
      data:{
        column_id: toColumn.id,
        index: this.cards[toColumn.id].length,
      }
    }, Card.col)
  }

  moveColumn(col_index: number, increm: number){
    let column = this.columns[col_index];
    this.firestore.editDoc({
      id: column.id,
      data:{
        index: firestore.increment(increm * 1.5),
      }
    }, Column.col)
  }

  // NEW METHODS

  async newColumn(){
    const name = await this.io.alertInput("Escolha um nome para o Status");
    if(name === "") return;
    this.createColumn({data: {
      name: name,
      uid: this.auth.user.uid,
      board_id: this.board.id,
      created: new Date().toISOString(),
      index: this.columns.length,
    }});
  }

  async newCard(column: Column){
    const title = await this.io.alertInput("Digite o título da Atividade");
    if(title === "") return;
    this.createCard({data: {
      title: title,
      uid: this.auth.user.uid,
      board_id: this.board.id,
      column_id: column.id,
      created: new Date().toISOString(),
      index: this.cards[column.id].length,
    }});
  }

  // GET METHODS

  getBoard(id: string){
    const {getFirestore,onSnapshot,doc} = firestore;
    const db = getFirestore();
    this.unsubscribeBoard = onSnapshot(doc(db, Board.col, id), (doc)=>{
      this.board = {id: doc.id, data: doc.data()}
    })
  }

  getColumns(id: string){
    const {getFirestore,query,collection,where,onSnapshot} = firestore;
    const db = getFirestore();
    const q = query(collection(db, Column.col), where("board_id", "==", id));
    this.unsubscribeColumns = onSnapshot(q, (querySnapshot)=>{
      this.columns = querySnapshot.docs.map(doc=>{
        return {id: doc.id, data: doc.data()};
      })
      this.columns.sort((a,b)=>a.data.index-b.data.index);
      // console.log(this.columns);
      this.columns.forEach(column=>{
        if(!this.unsubscribeCards[column.id]) this.getCards(column);
      })

      if(querySnapshot.metadata.fromCache) return;
      if(this.columns.length === 0) this.initColumns();
      this.checkIndexes(this.columns, Column.col);
    })
  }

  getCards(column: Column){
    const {getFirestore,query,collection,where,onSnapshot} = firestore;
    const db = getFirestore();
    const q = query(collection(db, Card.col), where("column_id", "==", column.id));
    this.unsubscribeCards[column.id] = onSnapshot(q, (querySnapshot)=>{
      this.cards[column.id] = querySnapshot.docs.map(doc=>{
        return {id: doc.id, data: doc.data()};
      })
      this.cards[column.id].sort((a,b)=>a.data.index-b.data.index);
      // console.log("Cards "+column.data.name, this.cards[column.id]);

      if(querySnapshot.metadata.fromCache) return;
      this.checkIndexes(this.cards[column.id], Card.col);
    })
  }

  // CREATE METHODS

  async createColumn(column: Column){
    this.firestore.createDoc((column as any), Column.col)
  }

  async createCard(card: Card){
    this.firestore.createDoc((card as any), Card.col)
  }

  // EDIT METHODS

  async editColumn(column: Column){
    const name = await this.io.alertInput("Escolha um novo nome para o Status");
    if(name === "") return;
    this.firestore.editDoc({
      id: column.id,
      data: { name: name }
    }, Column.col);
  }

  async editCard(card: Card){
    const text = await this.io.alertInput("Digite a nova descrição da Atividade");
    if(text === "") return;
    this.firestore.editDoc({
      id: card.id,
      data: { text: text }
    }, Card.col);
  }

  async editBoard(){
    const name = await this.io.alertInput("Escolha um novo nome para o Projeto");
    if(name === "") return;
    this.firestore.editDoc({
      id: this.board.id,
      data: { name: name }
    }, Board.col);
  }

  // DELETE METHODS

  async deleteBoard(){
    if(await this.firestore.removeDoc(this.board.id, Board.col, "Tem certeza que deseja excluir esse Projeto?"))
      this.router.navigateByUrl('boards');
  }

  deleteColumn(id){
    this.firestore.removeDoc(id, Column.col, "Tem certeza que deseja excluir esse Status?")
  }

  deleteCard(id){
    this.firestore.removeDoc(id, Card.col, "Tem certeza que deseja excluir essa Atividade?")
  }

  // OTHER METHODS

  async checkIndexes(array: any[], col_name: string){
    const {getFirestore,writeBatch,doc} = firestore;
    const db = getFirestore();
    let batch: firestore.WriteBatch;
    for(let i=0; i<array.length; i++){
      if(array[i].data.index === i) continue;
      if(!batch) batch = writeBatch(db);
      batch.update(doc(db, col_name, array[i].id), {index: i});
    }
    if(batch) await batch.commit();
  }
  
  async initColumns(){
    const {getFirestore,writeBatch,doc,collection} = firestore;
    const db = getFirestore();
    const batch = writeBatch(db);
    ['A FAZER', 'FAZENDO', 'FEITO'].map((name,index)=>{
      return {data: {
        name: name,
        uid: this.auth.user.uid,
        board_id: this.board.id,
        created: new Date().toISOString(),
        index: index,
      }}
    }).forEach((column: Column)=>{
      batch.set(doc(collection(db, Column.col)), column.data);
    })
    await batch.commit();
  }

  openCard(card: Card){
    const board_id = this.route.snapshot.params.id;
    this.router.navigateByUrl(`boards/${board_id}/${card.id}`);
  }

}
