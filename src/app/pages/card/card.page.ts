import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
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
  text: string = '';

  comments: Comment[]

  subscriptionCard: Subscription
  subscriptionComments: Subscription

  constructor(
    public route: ActivatedRoute,
    public auth: AuthService,
    public io: IoService,
    public fire: FirestoreService,
  ) { }

  ngOnDestroy(){
    console.log("ngOnDestroy()");
    if(this.subscriptionCard) this.subscriptionCard.unsubscribe();
    if(this.subscriptionComments) this.subscriptionComments.unsubscribe();
  }

  ngOnInit() {
    this.board_id = this.route.snapshot.params.board_id;
    this.getCard(this.route.snapshot.params.id);
    this.getComments(this.route.snapshot.params.id);
  }

  getCard(id: string){
    this.subscriptionCard = this.fire.onGet(Card.col, id)
      .subscribe(snap=>{
        this.card = snap.doc;
      })
  }

  async editCardTitle(){
    const title = await this.io.alertInput("Digite o novo título da Atividade");
    if(title === "") return;
    this.fire.editDoc({
      id: this.card.id,
      data: { title: title }
    }, Card.col);
  }

  timeoutId;
  textChange(){
    if(this.timeoutId) clearTimeout(this.timeoutId);
    this.timeoutId = setTimeout(() => {
      this.fire.editDoc({
        id: this.card.id,
        data: {text: this.text}
      }, Card.col);
    }, 500);
  }

  async newComment(){
    const text = await this.io.alertInput("Digite o texto do Comentário");
    if(text === "") return;
    this.fire.createDoc({data: {
      text: text,
      uid: this.auth.user.uid,
      board_id: this.card.data.board_id,
      column_id: this.card.data.column_id,
      card_id: this.card.id,
      created: new Date().toISOString(),
    }}, Comment.col);
  }

  getComments(id){
    this.subscriptionComments = this.fire.onList(Comment.col, [{
      field:"card_id", op:"==", value:id
    }]).subscribe(snap=>{
      this.comments = snap.docs;
      this.comments.sort((a,b)=>{
        if(a.data.created < b.data.created) return +1;
        if(a.data.created > b.data.created) return -1;
        return 0;
      });
      // console.log(this.comments);
    })
  }

  deleteComment(id){
    this.fire.removeDoc(id, Comment.col, "Tem certeza que deseja excluir esse Comentário?")
  }

}
