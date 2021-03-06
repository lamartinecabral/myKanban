import { Component } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { Board, Column } from 'src/app/utils/interfaces';
import { IoService } from 'src/app/services/io.service';
import { FirestoreService } from 'src/app/services/firestore.service';
import { NavService } from 'src/app/services/nav.service';
import { Subscription } from 'rxjs';
import * as firestore from 'firebase/firestore'

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  boards: Board[];
  inviteBoards: Board[];

  subscription: Subscription;

  constructor(
    public nav: NavService,
    public auth: AuthService,
    public alertCtrl: AlertController,
    public io: IoService,
    public fire: FirestoreService,
  ) {}

  ngOnDestroy(){
    console.log("ngOnDestroy()");
    if(this.subscription) this.subscription.unsubscribe();
  }

  ngOnInit(){
    this.getBoards();
    this.getInviteBoards();
  }

  async logout(){
    await this.auth.logout();
    this.nav.go('', true);
  }

  async newBoard(){
    const name = await this.io.alertInput("Escolha um nome para o Projeto");
    if(name === "") return;
    this.createBoard({data: {
      name: name,
      uid: this.auth.user.uid,
      created: new Date().toISOString(),
      index: -1,
    }});
  }

  async createBoard2(board: Board){
    this.fire.createDoc((board as any), Board.col)
  }

  async createBoard(board: Board){
    let log: any = {}
    const {getFirestore,writeBatch,doc,collection} = firestore;
    const db = getFirestore();
    const batch = writeBatch(db);
    const boardRef = doc(collection(db, Board.col));
    log[board.data.name] = boardRef.id;
    batch.set(boardRef, board.data);
    ['A FAZER', 'FAZENDO', 'FEITO'].map((name,index)=>{
      return {data: {
        name: name,
        uid: this.auth.user.uid,
        board_id: boardRef.id,
        created: new Date().toISOString(),
        index: index,
      }}
    }).forEach((column: Column, index)=>{
      const columnRef = doc(collection(db, Column.col));
      log[column.data.name] = columnRef.id;
      batch.set(columnRef, column.data);
    })
    await batch.commit();
    console.log("Documents created with ID: ",log);
  }

  getBoards(){
    this.subscription = this.fire.onList<Board>(Board.col, [{
      field: 'uid', op: '==', value: this.auth.user.uid
    }]).subscribe(snap=>{
      this.boards = snap.docs;
      this.boards.sort((a,b)=>a.data.index-b.data.index);
      // console.log(this.boards);
      
      if(snap.metadata.fromCache) return;
      this.fire.checkIndexes(this.boards, Board.col);
    })
  }

  getInviteBoards(){
    this.subscription = this.fire.onList<Board>(Board.col, [{
      field: 'guests', op: 'array-contains', value: this.auth.user.email
    }]).subscribe(snap=>{
      this.inviteBoards = snap.docs;
      this.inviteBoards.sort((a,b)=>{
        if(a.data.created > b.data.created) return -1;
        if(a.data.created < b.data.created) return +1;
        return 0;
      });
      // console.log(this.inviteBoards);
    })
  }

  open(id){
    this.nav.forward('boards/'+id);
  }
  
}
