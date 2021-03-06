import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as firestore from 'firebase/firestore';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { FirestoreService } from 'src/app/services/firestore.service';
import { IoService } from 'src/app/services/io.service';
import { NavService } from 'src/app/services/nav.service';
import { Board, Column, Card } from 'src/app/utils/interfaces';

@Component({
  selector: 'app-board',
  templateUrl: './board.page.html',
  styleUrls: ['./board.page.scss'],
})
export class BoardPage implements OnInit {

  board: Board;
  subscriptionBoard: Subscription;

  columns: Column[];
  subscriptionColumns: Subscription;

  cards: {[column_id: string]: Card[]} = {};
  subscriptionCards: {[column_id: string]: Subscription} = {};

  isOwner

  constructor(
    public route: ActivatedRoute,
    public nav: NavService,
    public auth: AuthService,
    public fire: FirestoreService,
    public io: IoService,
  ) { }

  ngOnDestroy(){
    console.log("ngOnDestroy()");
    if(this.subscriptionBoard) this.subscriptionBoard.unsubscribe();
    if(this.subscriptionColumns) this.subscriptionColumns.unsubscribe();
    for(let id in this.subscriptionCards)
      if(this.subscriptionCards[id])
        this.subscriptionCards[id].unsubscribe();
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
    this.fire.editDoc({
      id: card.id,
      data:{
        column_id: toColumn.id,
        index: this.cards[toColumn.id].length,
      }
    }, Card.col)
  }

  moveColumn(col_index: number, increm: number){
    let column = this.columns[col_index];
    this.fire.editDoc({
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
    const title = await this.io.alertInput("Digite o t??tulo da Atividade");
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
    this.subscriptionBoard = this.fire
      .onGet<Board>(Board.col,id).subscribe(snap=>{
        this.board = snap.doc;
        try{ this.isOwner = this.board.data.uid == this.auth.user.uid; }
        catch(e){}
      });
  }

  getColumns(id: string){
    this.subscriptionColumns = this.fire.onList<Column>(Column.col, [{
      field: 'board_id', op: '==', value: id
    }]).subscribe(snap=>{
      this.columns = snap.docs;
      this.columns.sort((a,b)=>a.data.index-b.data.index);
      // console.log(this.columns);
      
      this.columns.forEach(column=>{
        if(!this.subscriptionCards[column.id]) this.getCards(column);
      })
      if(snap.metadata.fromCache) return;
      this.fire.checkIndexes(this.columns, Column.col);
    })
  }

  getCards(column: Column){
    this.subscriptionCards[column.id] = this.fire.onList(Card.col, [{
      field: 'column_id', op: '==', value: column.id
    }]).subscribe(snap=>{
      this.cards[column.id] = snap.docs;
      this.cards[column.id].sort((a,b)=>a.data.index-b.data.index);
      // console.log("Cards "+column.data.name, this.cards[column.id]);

      if(snap.metadata.fromCache) return;
      this.fire.checkIndexes(this.cards[column.id], Card.col);
    })
  }

  // CREATE METHODS

  async createColumn(column: Column){
    this.fire.createDoc((column as any), Column.col)
  }

  async createCard(card: Card){
    this.fire.createDoc((card as any), Card.col)
  }

  // EDIT METHODS

  async editColumn(column: Column){
    const name = await this.io.alertInput("Escolha um novo nome para o Status", column.data.name);
    if(name === "") return;
    this.fire.editDoc({
      id: column.id,
      data: { name: name }
    }, Column.col);
  }

  async editCard(card: Card){
    const title = await this.io.alertInput("Digite o novo t??tulo da Atividade", card.data.title);
    if(title === "") return;
    this.fire.editDoc({
      id: card.id,
      data: { title: title }
    }, Card.col);
  }

  async editBoard(){
    const name = await this.io.alertInput("Escolha um novo nome para o Projeto", this.board.data.name);
    if(name === "") return;
    this.fire.editDoc({
      id: this.board.id,
      data: { name: name }
    }, Board.col);
  }

  // DELETE METHODS

  async deleteBoard(){
    const ans = await this.io.alertConfirm("Tem certeza que deseja excluir esse Projeto?");
    if(!ans) return;
    const {getFirestore,writeBatch,doc,collection} = firestore;
    const db = getFirestore();
    const batch = writeBatch(db);
    batch.delete(doc(db, Board.col, this.board.id));
    this.columns.forEach(column=>{
      batch.delete(doc(db, Column.col, column.id));
    })
    await batch.commit();
    console.log("Documents batch deleted successfully");
    this.nav.back('boards');
  }

  deleteColumn(id){
    this.fire.removeDoc(id, Column.col, "Tem certeza que deseja excluir esse Status?")
  }

  deleteCard(id){
    this.fire.removeDoc(id, Card.col, "Tem certeza que deseja excluir essa Atividade?")
  }

  // OTHER METHODS

  openCard(card: Card){
    const board_id = this.route.snapshot.params.id;
    this.nav.forward(`boards/${board_id}/${card.id}`);
  }

  async invite(){
    let email = await this.io.alertInput(`Digite o email da pessoa que voc?? quer convidar`);
    if(!email) return;
    this.fire.editDoc({
      id: this.board.id,
      data: {guests: firestore.arrayUnion(email)}
    },Board.col);
  }

  async uninvite(email){
    let ans = await this.io.alertConfirm(`Tem certeza que deseja desconvidar ${email}?`);
    if(!ans) return;
    this.fire.editDoc({
      id: this.board.id,
      data: {guests: firestore.arrayRemove(email)}
    },Board.col);
  }

  async leave(){
    let ans = await this.io.alertConfirm(`Tem certeza que deseja sair desse Projeto?`);
    if(!ans) return;
    await this.fire.editDoc({
      id: this.board.id,
      data: {guests: firestore.arrayRemove(this.auth.user.email)}
    },Board.col);
    this.nav.back('boards');
  }

}
