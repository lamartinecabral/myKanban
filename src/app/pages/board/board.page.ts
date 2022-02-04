import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { addDoc, collection, deleteDoc, doc, getFirestore, onSnapshot, query, where, writeBatch, WriteBatch, updateDoc } from 'firebase/firestore';
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

  moveCard(col_index: number, card_index: number, increment: number){
    let fromColumn = this.columns[col_index];
    let card = this.cards[fromColumn.id][card_index];
    let toColumn = this.columns[col_index + increment];
    card.data.column_id = toColumn.id
    this.updateCard({
      id: card.id,
      data:{
        column_id: toColumn.id,
        index: this.cards[toColumn.id].length,
      }
    })
  }

  async updateCard(card: Card){
    console.log(card);
    const db = getFirestore();
    try {
      await updateDoc(doc(db, "cards", card.id), card.data);
      console.log("Document written with ID: ", card.id);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }

  // NEW METHODS

  async newColumn(){
    const name = await this.alertInput("Escolha um nome para a Coluna");
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
    const text = await this.alertInput("Digite o texto do Card");
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
    const db = getFirestore();
    this.unsubscribeBoard = onSnapshot(doc(db, 'boards', id), (doc)=>{
      this.board = {id: doc.id, data: doc.data()}
    })
  }

  getColumns(id: string){
    const db = getFirestore();
    const q = query(collection(db, "columns"), where("board_id", "==", id));
    this.unsubscribeColumns = onSnapshot(q, (querySnapshot)=>{
      this.columns = querySnapshot.docs.map(doc=>{
        return {id: doc.id, data: doc.data()};
      });
      this.columns.sort((a,b)=>a.data.index-b.data.index);
      console.log(this.columns);
      this.columns.forEach(column=>{
        if(!this.unsubscribeCards[column.id]) this.getCards(column);
      })

      if(querySnapshot.metadata.fromCache) return;
      if(this.columns.length === 0) this.initColumns();
      this.checkIndexes(this.columns, 'columns');
    })
  }

  getCards(column: Column){
    const db = getFirestore();
    const q = query(collection(db, "cards"), where("column_id", "==", column.id));
    this.unsubscribeCards[column.id] = onSnapshot(q, (querySnapshot)=>{
      this.cards[column.id] = querySnapshot.docs.map(doc=>{
        return {id: doc.id, data: doc.data()};
      });
      this.cards[column.id].sort((a,b)=>a.data.index-b.data.index);
      console.log("Cards "+column.data.name, this.cards[column.id]);

      if(querySnapshot.metadata.fromCache) return;
      this.checkIndexes(this.cards[column.id], 'cards');
    })
  }

  // CREATE METHODS

  async createColumn(column: Column){
    const db = getFirestore();
    try {
      const docRef = await addDoc(collection(db, "columns"), column.data);
      console.log("Document written with ID: ", docRef.id);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }

  async createCard(card: Card){
    const db = getFirestore();
    try {
      const docRef = await addDoc(collection(db, "cards"), card.data);
      console.log("Document written with ID: ", docRef.id);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }

  // DELETE METHODS

  async deleteBoard(){
    const answer = await this.alertConfirm("Tem certeza que deseja excluir esse Board?")
    if(!answer) return;
    
    const db = getFirestore();
    await deleteDoc(doc(db, "boards", this.board.id));
    this.router.navigateByUrl('boards');
  }

  async deleteColumn(id){
    const answer = await this.alertConfirm("Tem certeza que deseja excluir essa Coluna?")
    if(!answer) return;
    
    const db = getFirestore();
    await deleteDoc(doc(db, "columns", id));
  }

  async deleteCard(id){
    const answer = await this.alertConfirm("Tem certeza que deseja excluir esse Card?")
    if(!answer) return;
    
    const db = getFirestore();
    await deleteDoc(doc(db, "cards", id));
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
    const db = getFirestore();
    let batch: WriteBatch;
    for(let i=0; i<array.length; i++){
      if(array[i].data.index === i) continue;
      if(!batch) batch = writeBatch(db);
      batch.update(doc(db, col_name, array[i].id), {index: i});
    }
    if(batch) await batch.commit();
  }
  
  async initColumns(){
    const db = getFirestore();
    const batch = writeBatch(db);
    ['TO DO', 'DOING', 'DONE'].map((name,index)=>{
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


}
