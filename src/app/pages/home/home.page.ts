import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import * as firestore from "firebase/firestore";
import { Board } from 'src/app/utils/interfaces';

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
    const alert = await this.alertCtrl.create({
      subHeader: "Escolha um nome para o Board",
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
    if(res.role !== "Ok") return;
    this.createBoard({data: {
      name: res.data.values.name,
      uid: this.auth.user.uid,
      created: new Date().toISOString(),
      index: this.boards.length,
    }});
  }

  async createBoard(board: Board){
    const {getFirestore,addDoc,collection} = firestore;
    const db = getFirestore();
    try {
      const docRef = await addDoc(collection(db, "boards"), board.data);
      console.log("Document written with ID: ", docRef.id);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }

  async updateBoard(board: Board){
    const {getFirestore,updateDoc,doc} = firestore;
    const db = getFirestore();
    try {
      await updateDoc(doc(db, "boards", board.id), board.data);
      console.log("Document written with ID: ", board.id);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }

  getBoards(){
    const {getFirestore,query,collection,where,onSnapshot} = firestore;
    const db = getFirestore();
    const q = query(collection(db, "boards"), where("uid", "==", this.auth.user.uid));
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
          doc(db, "boards", this.boards[i].id),
          {index: this.boards.length-i-1}
        );
      }
    }
    if(batch){
      await batch.commit();
    }
  }

}
