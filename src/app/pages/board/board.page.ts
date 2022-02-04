import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { collection, deleteDoc, doc, getFirestore, onSnapshot, query, where, writeBatch, WriteBatch } from 'firebase/firestore';
import { Board } from 'src/app/utils/interfaces';

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

  cards = {};

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    public alertCtrl: AlertController
  ) { }

  ngOnDestroy(){
    if(this.unsubscribeBoard) this.unsubscribeBoard();
    if(this.unsubscribeColumns) this.unsubscribeColumns();
  }

  ngOnInit() {
    this.getBoard(this.route.snapshot.params.id);
    this.getColumns(this.route.snapshot.params.id);
  }

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

      this.checkIndexes(this.columns, 'columns');
    })
  }

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

}
