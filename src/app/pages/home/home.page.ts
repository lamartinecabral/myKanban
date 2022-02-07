import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import * as firestore from "firebase/firestore";
import { Board } from 'src/app/utils/interfaces';
import { IoService } from 'src/app/services/io.service';
import { FirestoreService } from 'src/app/services/firestore.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  boards: Board[];

  unsubscribe;

  constructor(
    public router: Router,
    public auth: AuthService,
    public alertCtrl: AlertController,
    public io: IoService,
    public firestore: FirestoreService,
  ) {}

  ngOnDestroy(){
    if(this.unsubscribe) this.unsubscribe();
  }

  ngOnInit(){
    this.getBoards();
  }

  async logout(){
    await this.auth.logout();
    this.router.navigateByUrl('',{replaceUrl: true});
  }

  async newBoard(){
    const name = await this.io.alertInput("Escolha um nome para o Projeto");
    if(name === "") return;
    this.createBoard({data: {
      name: name,
      uid: this.auth.user.uid,
      created: new Date().toISOString(),
      index: this.boards.length,
    }});
  }

  async createBoard(board: Board){
    this.firestore.createDoc((board as any), Board.col)
  }

  getBoards(){
    const {getFirestore,query,collection,where,onSnapshot} = firestore;
    const db = getFirestore();
    const q = query(collection(db, Board.col), where("uid", "==", this.auth.user.uid));
    this.unsubscribe = onSnapshot(q, (querySnapshot)=>{
      this.boards = querySnapshot.docs.map(doc=>{
        return {id: doc.id, data: doc.data()};
      });
      this.boards.sort((a,b)=>b.data.index-a.data.index);
      // console.log(this.boards);
      
      if(querySnapshot.metadata.fromCache) return;
      this.checkIndexes();
    })
  }

  open(id){
    this.router.navigateByUrl('boards/'+id);
  }
  
  // busca e corrige inconsistencias nos indices
  async checkIndexes(){
    const {getFirestore,writeBatch,doc} = firestore;
    const db = getFirestore();
    let batch: firestore.WriteBatch;
    for(let i=0; i<this.boards.length; i++){
      if(this.boards[i].data.index !== this.boards.length-i-1){
        if(!batch) batch = writeBatch(db);
        batch.update(
          doc(db, Board.col, this.boards[i].id),
          {index: this.boards.length-i-1}
        );
      }
    }
    if(batch){
      await batch.commit();
    }
  }

}
