import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertController } from '@ionic/angular';
import * as firestore from 'firebase/firestore'
import { AuthService } from 'src/app/services/auth.service';
import { Card, Comment } from 'src/app/utils/interfaces';

@Component({
  selector: 'app-card',
  templateUrl: './card.page.html',
  styleUrls: ['./card.page.scss'],
})
export class CardPage implements OnInit {

  board_id;
  card: Card;
  text = '';

  comments: Comment[]

  unsubscribeCard
  unsubscribeComments

  constructor(
    public route: ActivatedRoute,
    public alertCtrl: AlertController,
    public auth: AuthService,
  ) { }

  ngOnDestroy(){
    if(this.unsubscribeCard) this.unsubscribeCard();
  }

  ngOnInit() {
    this.board_id = this.route.snapshot.params.board_id;
    this.getCard(this.route.snapshot.params.id);
    this.getComments(this.route.snapshot.params.id);
  }

  getCard(id: string){
    const {getFirestore,onSnapshot,doc} = firestore;
    const db = getFirestore();
    this.unsubscribeCard = onSnapshot(doc(db, Card.col, id), (doc)=>{
      this.card = {id: doc.id, data: doc.data()}
      this.text = this.card.data.text;
    })
  }

  timeoutId;
  textChange(){
    if(this.timeoutId) clearTimeout(this.timeoutId);
    this.timeoutId = setTimeout(() => {
      this.updateDocum({
        id: this.card.id,
        data: {text: this.text || ' '}
      }, Card.col);
    }, 500);
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

  async newComment(){
    const text = await this.alertInput("Digite o texto do Comentário");
    if(text === "") return;
    this.createDoc({data: {
      text: text,
      uid: this.auth.user.uid,
      board_id: this.card.data.board_id,
      column_id: this.card.data.column_id,
      card_id: this.card.id,
      created: new Date().toISOString(),
    }}, Comment.col);
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

  getComments(id){
    const {getFirestore,query,collection,where,onSnapshot} = firestore;
    const db = getFirestore();
    const q = query(collection(db, Comment.col), where("card_id", "==", id));
    this.unsubscribeComments = onSnapshot(q, (querySnapshot)=>{
      this.comments = querySnapshot.docs.map(doc=>{
        return {id: doc.id, data: doc.data()};
      })
      this.comments.sort((a,b)=>{
        if(a.data.created < b.data.created) return +1;
        if(a.data.created > b.data.created) return -1;
        return 0;
      });
      // console.log(this.comments);
    })
  }

  deleteComment(id){
    this.removeDoc(id, Comment.col, "Tem certeza que deseja excluir esse Comentário?")
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

}
