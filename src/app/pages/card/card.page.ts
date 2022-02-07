import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertController } from '@ionic/angular';
import * as firestore from 'firebase/firestore'
import { AuthService } from 'src/app/services/auth.service';
import { FirestoreService } from 'src/app/services/firestore.service';
import { IoService } from 'src/app/services/io.service';
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
    public auth: AuthService,
    public io: IoService,
    public firestore: FirestoreService,
  ) { }

  ngOnDestroy(){
    if(this.unsubscribeCard) this.unsubscribeCard();
    if(this.unsubscribeComments) this.unsubscribeComments();
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

  async editCardTitle(){
    const title = await this.io.alertInput("Digite o novo título da Atividade");
    if(title === "") return;
    this.firestore.editDoc({
      id: this.card.id,
      data: { title: title }
    }, Card.col);
  }

  timeoutId;
  textChange(){
    if(this.timeoutId) clearTimeout(this.timeoutId);
    this.timeoutId = setTimeout(() => {
      this.firestore.editDoc({
        id: this.card.id,
        data: {text: this.text || ' '}
      }, Card.col);
    }, 500);
  }

  async newComment(){
    const text = await this.io.alertInput("Digite o texto do Comentário");
    if(text === "") return;
    this.firestore.createDoc({data: {
      text: text,
      uid: this.auth.user.uid,
      board_id: this.card.data.board_id,
      column_id: this.card.data.column_id,
      card_id: this.card.id,
      created: new Date().toISOString(),
    }}, Comment.col);
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
    this.firestore.removeDoc(id, Comment.col, "Tem certeza que deseja excluir esse Comentário?")
  }

}
