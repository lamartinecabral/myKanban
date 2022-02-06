import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import * as firestore from 'firebase/firestore';
import { AuthService } from 'src/app/services/auth.service';
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
    public alertCtrl: AlertController,
    public auth: AuthService,
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

  async updateDocum(d: {id: string, data: any}, col: string){
    const {getFirestore,updateDoc,doc} = firestore;
    const db = getFirestore();
    try {
      await updateDoc(doc(db, col, d.id), d.data);
      console.log("Document updated:", d);
    } catch (e) {
      console.error("Error updating document:", e);
    }
  }

  // MOVE METHODS

  moveCard(col_index: number, card_index: number, increment: number){
    let fromColumn = this.columns[col_index];
    let card = this.cards[fromColumn.id][card_index];
    let toColumn = this.columns[col_index + increment];
    card.data.column_id = toColumn.id
    this.updateDocum({
      id: card.id,
      data:{
        column_id: toColumn.id,
        index: this.cards[toColumn.id].length,
      }
    }, 'cards')
  }

  moveColumn(col_index: number, increm: number){
    let column = this.columns[col_index];
    this.updateDocum({
      id: column.id,
      data:{
        index: firestore.increment(increm * 1.5),
      }
    }, 'columns')
  }

  // NEW METHODS

  async newColumn(){
    const name = await this.alertInput("Escolha um nome para o Status");
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
    const text = await this.alertInput("Digite a descrição da Atividade");
    if(text === "") return;
    this.createCard({data: {
      text: text,
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
    this.unsubscribeBoard = onSnapshot(doc(db, 'boards', id), (doc)=>{
      this.board = {id: doc.id, data: doc.data()}
    })
  }

  getColumns(id: string){
    const {getFirestore,query,collection,where,onSnapshot} = firestore;
    const db = getFirestore();
    const q = query(collection(db, "columns"), where("board_id", "==", id));
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
      this.checkIndexes(this.columns, 'columns');
    })
  }

  getCards(column: Column){
    const {getFirestore,query,collection,where,onSnapshot} = firestore;
    const db = getFirestore();
    const q = query(collection(db, "cards"), where("column_id", "==", column.id));
    this.unsubscribeCards[column.id] = onSnapshot(q, (querySnapshot)=>{
      this.cards[column.id] = querySnapshot.docs.map(doc=>{
        return {id: doc.id, data: doc.data()};
      })
      this.cards[column.id].sort((a,b)=>a.data.index-b.data.index);
      // console.log("Cards "+column.data.name, this.cards[column.id]);

      if(querySnapshot.metadata.fromCache) return;
      this.checkIndexes(this.cards[column.id], 'cards');
    })
  }

  // CREATE METHODS

  async createColumn(column: Column){
    this.createDoc((column as any), 'columns')
  }

  async createCard(card: Card){
    this.createDoc((card as any), 'cards')
  }

  async createDoc(docum: {data: any}, col: string){
    const {getFirestore,addDoc,collection} = firestore;
    const db = getFirestore();
    try {
      const docRef = await addDoc(collection(db, col), docum.data);
      console.log("Document created with ID: ", docRef.id, docum.data);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }

  // EDIT METHODS

  async editColumn(column: Column){
    const name = await this.alertInput("Escolha um novo nome para o Status");
    if(name === "") return;
    this.updateDocum({
      id: column.id,
      data: { name: name }
    }, 'columns');
  }

  async editCard(card: Card){
    const text = await this.alertInput("Digite a nova descrição da Atividade");
    if(text === "") return;
    this.updateDocum({
      id: card.id,
      data: { text: text }
    }, 'cards');
  }

  async editBoard(){
    const name = await this.alertInput("Escolha um novo nome para o Board");
    if(name === "") return;
    this.updateDocum({
      id: this.board.id,
      data: { name: name }
    }, 'boards');
  }

  // DELETE METHODS

  async deleteBoard(){
    await this.removeDoc(this.board.id, 'boards', "Tem certeza que deseja excluir esse Board?")
    this.router.navigateByUrl('boards');
  }

  deleteColumn(id){
    this.removeDoc(id, 'columns', "Tem certeza que deseja excluir esse Status?")
  }

  deleteCard(id){
    this.removeDoc(id, 'cards', "Tem certeza que deseja excluir essa Atividade?")
  }

  async removeDoc(id: string, col: string, confirmMessage: string){
    const answer = await this.alertConfirm(confirmMessage);
    if(!answer) return;
    
    const {getFirestore,deleteDoc,doc} = firestore;
    const db = getFirestore();
    try {
      await deleteDoc(doc(db, col, id));
      console.log("Document deleted with ID:", `${col}/${id}`);
    } catch (e) {
      console.error("Error deleting document: ", e);
    }
  }

  // ALERT METHODS

  async alertConfirm(message){
    const alert = await this.alertCtrl.create({
      header: message,
      buttons: [
        "Não",
        {
          text: 'Sim',
          role: 'Ok',
        }
      ]
    })
    await alert.present();
    const res = await alert.onDidDismiss();
    return res.role === 'Ok';
  }

  async alertInput(message){
    const alert = await this.alertCtrl.create({
      subHeader: message,
      inputs: [{
        name: 'name',
        type: 'text',
      }],
      buttons: [{
        text: "Cancelar",
        role: "Cancel",
      },{
        text: "OK",
        role: "Ok",
      }]
    });
    await alert.present();
    const res = await alert.onDidDismiss();
    if(res.role !== "Ok") return "";
    return res.data.values.name;
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
      batch.set(doc(collection(db, "columns")), column.data);
    })
    await batch.commit();
  }

  openCard(card: Card){
    const board_id = this.route.snapshot.params.id;
    this.router.navigateByUrl(`boards/${board_id}/${card.id}`);
  }

}
